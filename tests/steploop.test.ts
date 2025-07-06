import { StepLoop } from '../steploop';
import { describe, it, expect, beforeEach } from 'vitest';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const wait_for_loop_to_finish = async (loop: StepLoop, timeout_ms: number) => {
    const start = Date.now();
    while (loop.is_running()) {
        if (Date.now() - start > timeout_ms) {
            console.error(`Loop did not finish in time (timeout: ${timeout_ms}ms). Forcing finish.`);
            loop.finish();
            break;
        }
        await sleep(10);
    }
};

describe('StepLoop', () => {
    it('should initialize with default values', () => {
        const loop = new StepLoop();
        expect(loop.get_sps()).toBe(60);
        expect(loop.get_lifespan()).toBeUndefined();
        expect(loop.is_running()).toBe(false);
    });

    it('should initialize with custom values', () => {
        const loop = new StepLoop(30, 100);
        expect(loop.get_sps()).toBe(30);
        expect(loop.get_lifespan()).toBe(100);
    });

    it('should call initial and final hooks', async () => {
        let initial_called = false;
        let final_called = false;

        class TestLoop extends StepLoop {
            override initial() {
                initial_called = true;
            }
            override final() {
                final_called = true;
            }
        }

        const loop = new TestLoop(60, 1);
        loop.start();

        expect(loop.is_running()).toBe(true);
        expect(initial_called).toBe(true);

        await sleep(50); // Let it run for a bit

        expect(final_called).toBe(true);
        expect(loop.is_running()).toBe(false);
    });

    it('should pause and play correctly', async () => {
        const loop = new StepLoop(60, 100);
        loop.start();
        await sleep(20);
        loop.pause();
        expect(loop.is_running()).toBe(false);
        const step_on_pause = loop.get_step();
        await sleep(50);
        expect(loop.get_step()).toBe(step_on_pause);
        loop.play();
        expect(loop.is_running()).toBe(true);
        await sleep(50);
        expect(loop.get_step()).toBeGreaterThan(step_on_pause);
        loop.finish();
    });

    it('should extend lifespan', async () => {
        const loop = new StepLoop(60, 2);
        loop.start();
        await sleep(50);
        expect(loop.is_running()).toBe(false);
        loop.extend_lifespan(2);
        expect(loop.get_lifespan()).toBe(4);
        loop.play();
        await sleep(50);
        expect(loop.is_running()).toBe(false);
        expect(loop.get_step()).toBeGreaterThanOrEqual(4);
    });

    it('should call step hooks in the correct order', async () => {
        let call_order: string[] = [];

        class TestLoop extends StepLoop {
            override before() {
                call_order.push('before');
            }
            override step() {
                call_order.push('step');
            }
            override after() {
                call_order.push('after');
            }
        }

        const loop = new TestLoop(60, 1);
        loop.start();
        await sleep(50);

        expect(call_order).toEqual(['before', 'step', 'after']);
    });

    it('should change sps and affect step execution', async () => {
        const loop = new StepLoop(10, 100);
        loop.start();
        await sleep(200);
        const steps_at_10_sps = loop.get_step();
        loop.pause();
        loop.set_sps(100);
        loop.play();
        await sleep(200);
        const steps_at_100_sps = loop.get_step() - steps_at_10_sps;

        expect(steps_at_100_sps).toBeGreaterThan(steps_at_10_sps * 2);
        loop.finish();
    });

    it('should run with RAF', async () => {
        const loop = new StepLoop(60, undefined, true);
        expect(loop.set_use_RAF(true)).toBe(true);
        loop.start();
        await sleep(50);
        expect(loop.is_running()).toBe(true);
        loop.finish();
    });

    it('should maintain timing accuracy', async () => {
        const sps = 500;
        const duration_ms = 4000;
        const expected_steps = (duration_ms / 1000) * sps;
        const tolerance = 0.005; // 0.5% tolerance for timing variations

        const loop = new StepLoop(sps, expected_steps);
        loop.start();
        await sleep(duration_ms);
        loop.finish();

        const steps = loop.get_step();
        const lower_bound = expected_steps * (1 - tolerance);
        const upper_bound = expected_steps * (1 + tolerance);

        expect(steps).toBeGreaterThanOrEqual(lower_bound);
        expect(steps).toBeLessThanOrEqual(upper_bound);
    });

    it('should execute steps in order and completely', async () => {
        const run_test = async (sps: number, lifespan: number) => {
            let steps_executed: number[] = [];

            class OrderTestLoop extends StepLoop {
                override step() {
                    const current_step = this.get_step();
                    if (steps_executed.length === 0 || steps_executed[steps_executed.length - 1] !== current_step) {
                        steps_executed.push(current_step);
                    }
                }
            }

            const loop = new OrderTestLoop(sps, lifespan);
            loop.start();

            const expected_duration_ms = (lifespan / sps) * 1000;
            await wait_for_loop_to_finish(loop, expected_duration_ms + 1000);

            expect(loop.is_running()).toBe(false);

            steps_executed.forEach((step, i) => {
                expect(step).toBe(i);
            });

            expect(steps_executed.length).toBe(lifespan);
        };

        await run_test(60, 100);
        await run_test(10, 50);
        await run_test(500, 500);
        await run_test(1000, 100);
        await run_test(20, 300);
    },0);

    it('should not stop the loop when errors occur in step hooks', async () => {
        let before_calls = 0;
        let step_calls = 0;
        let after_calls = 0;
        const error_step = 5;

        class ErrorProneLoop extends StepLoop {
            override before() {
                before_calls++;
                if (this.get_step() === error_step) {
                    throw new Error('Test crash in before()');
                }
            }
            override step() {
                step_calls++;
                if (this.get_step() === error_step) {
                    throw new Error('Test crash in step()');
                }
            }
            override after() {
                after_calls++;
                if (this.get_step() === error_step) {
                    throw new Error('Test crash in after()');
                }
            }
        }

        const sps = 100;
        const lifespan = 20;
        const loop = new ErrorProneLoop(sps, lifespan);

        loop.start();

        const expected_duration_ms = (lifespan / sps) * 1000;
        await wait_for_loop_to_finish(loop, expected_duration_ms + 1000);

        expect(loop.is_running()).toBe(false);
        expect(loop.get_step()).toBeGreaterThanOrEqual(lifespan);
        expect(before_calls).toBe(lifespan);
        expect(step_calls).toBe(lifespan);
        expect(after_calls).toBe(lifespan);
    });

    it('should execute steps in order with RAF', async () => {
        const sps = 60;
        const duration_s = 2;
        const lifespan = sps * duration_s;
        let steps_executed: number[] = [];

        class OrderTestLoopRAF extends StepLoop {
            constructor() {
                super(sps, lifespan, true);
            }
            override step() {
                const current_step = this.get_step();
                if (steps_executed.length === 0 || steps_executed[steps_executed.length - 1] !== current_step) {
                    steps_executed.push(current_step);
                }
            }
        }

        const loop = new OrderTestLoopRAF();
        expect(loop.set_use_RAF(true)).toBe(true);
        loop.start();

        await wait_for_loop_to_finish(loop, duration_s * 1000 + 1000);

        expect(loop.is_running()).toBe(false);

        steps_executed.forEach((step, i) => {
            expect(step).toBe(i);
        });

        expect(steps_executed.length).toBe(lifespan);
    }, 0);
});
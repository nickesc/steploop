import { StepLoop } from '../steploop';

const test = (name: string, fn: () => void) => {
    try {
        fn();
        console.log(`\n\nSUCCESS: ${name}\n\n`);
    } catch (e) {
        console.error(`\n\nFAILURE: ${name}\n\n`);
        console.error(e);
        throw e;
    }
};

const assert_eq = (a: any, b: any, msg: string) => {
    if (a !== b) {
        throw new Error(`ASSERTION FAILED: ${msg} (expected ${b}, got ${a})`);
    }
};

const assert_true = (a: any, msg: string) => {
    if (!a) {
        throw new Error(`ASSERTION FAILED: ${msg} (expected true, got ${a})`);
    }
};

const assert_false = (a: any, msg: string) => {
    if (a) {
        throw new Error(`ASSERTION FAILED: ${msg} (expected false, got ${a})`);
    }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Test Suite

test('Initialization: constructor', () => {
    const loop = new StepLoop();
    assert_eq(loop.get_sps(), 60, 'Default SPS should be 60');
    assert_eq(loop.get_lifespan(), undefined, 'Default lifespan should be undefined');
    assert_false(loop.is_running(), 'Should not be running initially');

    const loop2 = new StepLoop(30, 100);
    assert_eq(loop2.get_sps(), 30, 'Custom SPS should be set');
    assert_eq(loop2.get_lifespan(), 100, 'Custom lifespan should be set');
});

test('Lifecycle: start, initial, finish, final', async () => {
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

    assert_true(loop.is_running(), 'Should be running after start()');
    assert_true(initial_called, 'initial() should be called on start');

    await sleep(50); // Let it run for a bit

    assert_true(final_called, 'final() should be called when lifespan is reached');
    assert_false(loop.is_running(), 'Should not be running after final()');
});

test('Lifecycle: pause and play', async () => {
    const loop = new StepLoop(60, 100);
    loop.start();
    await sleep(20);
    loop.pause();
    assert_false(loop.is_running(), 'Should not be running after pause()');
    const step_on_pause = loop.get_step();
    await sleep(50);
    assert_eq(loop.get_step(), step_on_pause, 'Step should not advance while paused');
    loop.play();
    assert_true(loop.is_running(), 'Should be running after play()');
    await sleep(50);
    assert_true(loop.get_step() > step_on_pause, 'Step should advance after play()');
    loop.finish();
});

test('Lifecycle: extend_lifespan', async () => {
    const loop = new StepLoop(60, 2);
    loop.start();
    await sleep(50);
    assert_false(loop.is_running(), 'Should stop when lifespan is reached');
    loop.extend_lifespan(2);
    assert_eq(loop.get_lifespan(), 4, 'Lifespan should be extended');
    loop.play();
    await sleep(50);
    assert_false(loop.is_running(), 'Should stop again at the new lifespan');
    assert_true(loop.get_step() >= 4, 'Should have run up to the new lifespan');
});

test('Step Hooks: before, step, after', async () => {
    let before_called = false;
    let step_called = false;
    let after_called = false;
    let call_order: string[] = [];

    class TestLoop extends StepLoop {
        override before() {
            before_called = true;
            call_order.push('before');
        }
        override step() {
            step_called = true;
            call_order.push('step');
        }
        override after() {
            after_called = true;
            call_order.push('after');
        }
    }

    const loop = new TestLoop(60, 1);
    loop.start();
    await sleep(50);

    assert_true(before_called, 'before() should be called');
    assert_true(step_called, 'step() should be called');
    assert_true(after_called, 'after() should be called');
    assert_eq(call_order.join('-'), 'before-step-after', 'Hooks should be called in the correct order');
});

test('SPS Control: set_sps', async () => {
    const loop = new StepLoop(10, 100);
    loop.start();
    await sleep(200);
    const steps_at_10_sps = loop.get_step();
    loop.pause();
    loop.set_sps(100);
    loop.play();
    await sleep(200);
    const steps_at_100_sps = loop.get_step() - steps_at_10_sps;

    assert_true(steps_at_100_sps > steps_at_10_sps * 2, 'Should run more steps at a higher SPS');
    loop.finish();
});

test('RAF Option', async () => {
    const loop = new StepLoop(60, undefined, true);
    assert_true(loop.set_use_RAF(true), 'RAF should be active');
    loop.start();
    await sleep(50);
    assert_true(loop.is_running(), 'Should be running with RAF');
    loop.finish();
});

class App extends StepLoop {

    initial_time: number = 0;
    final_time: number = -1;

    public override initial(): void {
        this.initial_time = performance.now()
        console.log("initial",this.initial_time);

    }

    public override final(): void {
        this.final_time = performance.now()
        let execution_time = (this.final_time-this.initial_time)/1000*this.get_sps()
        let target_time = this.get_lifespan();
        console.log("Final", this.final_time)
        console.log(`${execution_time} vs. ${target_time}`)
    }
}

test('Timing Accuracy', async () => {
    const sps = 500;
    const duration_ms = 4000;
    const expected_steps = (duration_ms / 1000) * sps;
    const tolerance = 0.005; // 0.5% tolerance for timing variations

    const loop = new App(sps, expected_steps);
    loop.start();
    await sleep(duration_ms);
    loop.finish();

    const steps = loop.get_step();
    const lower_bound = expected_steps * (1 - tolerance);
    const upper_bound = expected_steps * (1 + tolerance);

    assert_true(steps >= lower_bound && steps <= upper_bound, `Steps should be within ${tolerance * 100}% of expected value`);

    loop.finish();
});

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

test('Step Execution Order and Completeness', async () => {
    const run_test = async (sps: number, lifespan: number) => {
        const description = `sps: ${sps}, lifespan: ${lifespan}`;
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

        assert_false(loop.is_running(), `Loop should have stopped. ${description}`);

        for (let i = 0; i < steps_executed.length; i++) {
            assert_eq(steps_executed[i], i, `Steps should be sequential. Expected ${i} but got ${steps_executed[i]} at index ${i}. ${description}`);
        }

        const tolerance_percent = 0.1; // 10%
        const tolerance_steps = Math.max(5, lifespan * tolerance_percent);
        const lower_bound = lifespan - tolerance_steps;
        const upper_bound = lifespan + tolerance_steps;
        const executed_count = steps_executed.length;

        assert_true(
            executed_count >= lower_bound && executed_count <= upper_bound,
            `Executed step count (${executed_count}) should be within tolerance of lifespan (${lifespan}). Range: [${lower_bound.toFixed(2)}, ${upper_bound.toFixed(2)}]. ${description}`
        );
    };

    await run_test(60, 100);
    await run_test(10, 50);
    await run_test(500, 500);
    await run_test(1000, 100);
    await run_test(20, 300);
});

test('Errors in step hooks do not stop the loop', async () => {
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

    assert_false(loop.is_running(), 'Loop should stop after its lifespan is reached');

    const final_step = loop.get_step();
    assert_true(final_step >= lifespan, `Loop should complete its lifespan. Expected >=${lifespan}, got ${final_step}`);

    assert_eq(before_calls, lifespan, `before() should have been called for every step. Expected ${lifespan}, got ${before_calls}`);
    assert_eq(step_calls, lifespan, `step() should have been called for every step. Expected ${lifespan}, got ${step_calls}`);
    assert_eq(after_calls, lifespan, `after() should have been called for every step. Expected ${lifespan}, got ${after_calls}`);
});

test('Step Execution Order and Completeness with RAF', async () => {
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
    assert_true(loop.set_use_RAF(true), 'RAF should be active');
    loop.start();

    await wait_for_loop_to_finish(loop, duration_s * 1000 + 1000);

    assert_false(loop.is_running(), 'Loop should have stopped (RAF)');

    for (let i = 0; i < steps_executed.length; i++) {
        assert_eq(steps_executed[i], i, `Steps should be sequential with RAF. Failed at index ${i}`);
    }

    const tolerance = 0.25; // 25%
    const lower_bound = lifespan * (1 - tolerance);
    const upper_bound = lifespan * (1 + tolerance);

    assert_true(
        steps_executed.length >= lower_bound && steps_executed.length <= upper_bound,
        `Executed step count with RAF (${steps_executed.length}) should be within tolerance of expected lifespan (${lifespan})`
    );
});

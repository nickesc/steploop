import { StepLoop } from '../steploop';
const test = (name, fn) => {
    try {
        fn();
        console.log(`\n\nSUCCESS: ${name}\n\n`);
    }
    catch (e) {
        console.error(`\n\nFAILURE: ${name}\n\n`);
        console.error(e);
        throw e;
    }
};
const assert_eq = (a, b, msg) => {
    if (a !== b) {
        throw new Error(`ASSERTION FAILED: ${msg} (expected ${b}, got ${a})`);
    }
};
const assert_true = (a, msg) => {
    if (!a) {
        throw new Error(`ASSERTION FAILED: ${msg} (expected true, got ${a})`);
    }
};
const assert_false = (a, msg) => {
    if (a) {
        throw new Error(`ASSERTION FAILED: ${msg} (expected false, got ${a})`);
    }
};
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
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
        initial() {
            initial_called = true;
        }
        final() {
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
    let call_order = [];
    class TestLoop extends StepLoop {
        before() {
            before_called = true;
            call_order.push('before');
        }
        step() {
            step_called = true;
            call_order.push('step');
        }
        after() {
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
    initial_time = 0;
    final_time = -1;
    initial() {
        this.initial_time = performance.now();
        console.log("initial", this.initial_time);
    }
    final() {
        this.final_time = performance.now();
        let execution_time = (this.final_time - this.initial_time) / 1000 * this.get_sps();
        let target_time = this.get_lifespan();
        console.log("Final", this.final_time);
        console.log(`${execution_time} vs. ${target_time}`);
    }
}
test('Timing Accuracy', async () => {
    const sps = 50;
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

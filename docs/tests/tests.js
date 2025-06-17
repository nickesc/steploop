import { StepLoop } from "../steploop.js";
let initial = 0;
let final = -1;
function isWithinOne(target, num) {
    if (target == undefined || num == undefined)
        return false;
    return Math.abs(target - num) <= 1;
}
class App extends StepLoop {
    initial() {
        initial = Date.now();
        console.log("initial", initial);
    }
    async background() {
        //console.log("bg", this.step_num)
    }
    before() {
        //console.log("before", this.step_num)
    }
    step() {
        //console.log("step ", this.get_step())
    }
    after() {
        //console.log("after", this.step_num)
    }
    final() {
        final = Date.now();
        let execution_time = (final - initial) / 1000 * this.get_sps();
        let target_time = this.get_lifespan();
        console.log("Final", final);
        console.log(`${execution_time} vs. ${target_time}`);
        if (!isWithinOne(target_time, execution_time)) {
            throw new Error("\n\FAILURE: `steploop` lifespan did not match execution time\n\n");
        }
        //console.log("final", this.step_num)
    }
}
function testSteploop() {
    const testLoop = new App(250, 1000);
    testLoop.start();
    return true;
}
const status = testSteploop();
if (status) {
    console.log("\n\nSUCCESS: `steploop` lifespan is correct\n\n");
}
else {
    throw new Error("\n\FAILURE: `steploop` lifespan does not match expectations\n\n");
}
//(-)/1000*60

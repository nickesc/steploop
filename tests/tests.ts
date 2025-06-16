import { StepLoop } from "../steploop.ts";

let initial: number = 0;
let final: number = -1;

function isWithinOne(target: number | undefined, num: number | undefined) {
    if (target == undefined || num == undefined) return false;

    return Math.abs(target - num) <= 1;
}

class App extends StepLoop {
    public override initial(): void {
        initial = Date.now()
        console.log("initial",initial);

    }

    public override async background(): Promise<void> {
        //console.log("bg", this.step_num)
    }

    public override before(): void {
        //console.log("before", this.step_num)
    }

    public override step(): void {
        //console.log("step ", this.get_step())
    }

    public override after(): void {
        //console.log("after", this.step_num)
    }

    public override final(): void {
        final = Date.now()
        let execution_time = (final-initial)/1000*this.get_sps()
        let target_time = this.get_lifespan();
        console.log("Final",final)
        console.log(`${execution_time} vs. ${target_time}`)

        if(!isWithinOne(target_time,execution_time)){
            throw new Error("\n\FAILURE: `steploop` lifespan did not match execution time\n\n")
        }
        //console.log("final", this.step_num)
    }
}

function testSteploop(): boolean {

    const testLoop: App = new App(100,1000);

    testLoop.start();

    return true;
}

const status: boolean = testSteploop();

if(status) {
    console.log("\n\nSUCCESS: `steploop` PASSED automated tests\n\n");
} else {
    throw new Error("\n\FAILURE: `steploop` FAILED automated tests\n\n")
}
//(-)/1000*60

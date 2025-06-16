import { StepLoop } from "../dist/steploop.js";

//const new_loop = document.getElementById("new")
const frame = document.getElementById("frame")
const span = document.getElementById("span")
const lifespan = document.getElementById("lifespan")
const sps = document.getElementById("sps")
const setSps = document.getElementById("set-sps")
const start = document.getElementById("start")
const finish = document.getElementById("finish")
const pause = document.getElementById("pause")
const play = document.getElementById("play")
const extension = document.getElementById("extension")
const extend = document.getElementById("extend")

class Demo extends StepLoop {
    initial() {
        console.log("initial", Date.now());
    }
    async background() {
        console.log("background", this.get_step());
    }
    before() {
        console.log("before", this.get_step());
    }
    step() {
        console.log("step", this.get_step());
        frame.innerHTML = this.get_step()
        span.innerHTML = this.get_lifespan()
    }
    after() {
        console.log("after", this.get_step());
    }
    final() {
        //console.log("final", this.step_num);
        console.log("final", Date.now())
    }
}
function testSteploop() {
    let demoLoop = new Demo();
    let init = false;

    setSps.addEventListener("click", function(){
        demoLoop.set_sps(parseInt(sps.value));
    });
    start.addEventListener("click", function(){
        if (init) {
            demoLoop.start();
        } else {
            init = true
            demoLoop = new Demo(parseInt(sps.value), parseInt(lifespan.value));
            demoLoop.start();
        }
    });
    finish.addEventListener("click", function(){
        demoLoop.finish();
    });
    pause.addEventListener("click", function(){
        demoLoop.pause();
    });
    play.addEventListener("click", function(){
        demoLoop.play();
    });
    extend.addEventListener("click", function(){
        demoLoop.extend_lifespan(parseInt(extension.value));
    });

    //testLoop.start()
}
const status = testSteploop();

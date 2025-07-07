import { StepLoop } from "./steploop.js";

console.log("Beginning Test")

//const new_loop = document.getElementById("new")
const frame = document.getElementById("frame")
const span = document.getElementById("span")
const lifespan = document.getElementById("lifespan")
const sps = document.getElementById("sps")
const realSps = document.getElementById("real-sps")
const setSps = document.getElementById("set-sps")
const raf = document.getElementById("raf")
const start = document.getElementById("start")
const finish = document.getElementById("finish")
const pause = document.getElementById("pause")
const play = document.getElementById("play")
const extension = document.getElementById("extension")
const extend = document.getElementById("extend")

const container = document.getElementById("container")
const box = document.getElementById("box")

class Demo extends StepLoop {

    left = 0

    initial() {
        this.left = 0;
        box.className = "active"
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
        realSps.innerHTML = Math.round(this.get_real_sps())
        if (this.left+1 <= container.clientWidth-(box.clientWidth + 12) ) {
            this.left = this.left+1
        } else {
            this.left = 0
        }
        box.style.left = `${this.left}px`
    }
    after() {
        console.log("after", this.get_step());
    }

    on_pause(){
        box.className = "paused"
    }

    on_play(){
        box.className = "active"
    }

    final() {
        //console.log("final", this.step_num);
        box.className = "finished"
        console.log("final", Date.now())
    }
}
function testSteploop() {
    let demoLoop = new Demo();
    let init = false;

    setSps.addEventListener("click", function(){
        demoLoop.set_sps(parseInt(sps.value));
    });

    raf.addEventListener("click", function(){
        demoLoop.set_use_RAF(raf.checked);
    });

    start.addEventListener("click", function(){
        if (init) {
            demoLoop.finish();
            init = false;
        }
        init = true
        demoLoop = new Demo(parseInt(sps.value), parseInt(lifespan.value), raf.checked);
        demoLoop.start();
    });
    finish.addEventListener("click", function(){
        demoLoop.finish();
        init = false;
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

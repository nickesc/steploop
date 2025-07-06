/**
 * @fileoverview Extend the {@link StepLoop} class to define your own loop.
 *
 * The {@link StepLoop} class provides a base for a loop with steps executed at a set rate of steps-per-second.
 *
 * Executes at 60 steps-per-second by default.
 *
 * Executes in three stages:
 *
 * ##### 1. Initialization Stage
 * - {@link StepLoop.initial()}
 * ##### 2. Looping Stage
 * 1. {@link StepLoop.before()}
 * 2. {@link StepLoop.step()}
 * 3. {@link StepLoop.after()}
 * ##### 3. Termination Stage
 * - {@link StepLoop.final()}
 *
 * The initialization stage and termination stage each execute once, as the first step and last step respectively. The looping stage will start after the initialization stage is done, and it will loop through its three parts until something triggers the termination stage and its lifecycle comes to an end.
 *
 * @module steploop
 */

/**
 * A `StepLoop`.
 * @class
 * @static
 */
export class StepLoop {
    private _step_num: number = 0;
    private _lifespan: number | undefined;

    private _sps: number;
    private _interval: number;
    private _startTime: number = 0;
    private _lastStepTime: number = 0;
    private _lastStepDuration: number = 0;
    private _timeoutId: ReturnType<typeof setTimeout> | undefined;


    private _initialized: boolean = false;
    private _running: boolean = false;
    private _paused: boolean = false;
    private _kill: boolean = false;

    /**
     * Create a `StepLoop`, with options to define the steps-per-second and the lifespan of the loop.
     * @param {number} sps - the steps-per-second of the loop (note: values that are greater than about 250 may result in unexpected behavior); default value is 60
     * @param {number | undefined} lifespan - the number of steps that are executed before the loop ends; setting to `undefined` will result in an unlimited lifespan; default value is `undefined`
     */
    constructor(sps: number = 60, lifespan: number | undefined = undefined, RAF: boolean = false) {
        this._lifespan = lifespan;

        this._sps = sps;
        this._interval = 1000 / this._sps;
        //this._lastTime = performance.now();
        this._timeoutId = undefined;
        this._RAFActive = RAF;
    }

    /**
     * Override {@link StepLoop.initial()} to add an initial block of code to execute at the very beginning of the loop.
     *
     * The first code executed in the {@link StepLoop}. Called once at the beginning of the {@link StepLoop} lifecycle, and then moves on to the first {@link StepLoop.background()} call in the looping stage after resolving. Executed right after {@link StepLoop.start()} is called.
     *
     * @returns {void} `void`
     * @example
     * ```ts
     * class App extends StepLoop {
     *     public override initial(): void {
     *         console.log(`initial: ${Date.now()}`);
     *     }
     * }
     * ```
     * @instance
     */
    public initial(): void {
        return;
    }

    /**
     * Override {@link StepLoop.background()} to add a block of code to run in the background of each step of your loop.
     *
     * Executed in the background at the beginning of the looping stage. Called asynchronously before the rest of the loop, executes while the rest of the loop does. Starts before {@link StepLoop.before()} but may not resolve before it is called.
     *
     * @returns {Promise<void>} `Promise<void>`
     * @example
     * ```js
     * class App extends StepLoop {
     *     public override async background(): Promise<void> {
     *         console.log(`background: ${this.get_step()}`);
     *     }
     * }
     * ```
     * @instance
     */
    public async background(): Promise<void> {
        return;
    }

    /**
     * Override {@link StepLoop.before()} to add a block of code to run before each step of your loop.
     *
     * Executed in the looping stage before the main {@link StepLoop.step()} code. Resolves before calling {@link StepLoop.step()}. Use this function to set up anything you need before {@link StepLoop.step()} is called.
     *
     * @returns {void} `void`
     * @example
     * ```ts
     * class App extends StepLoop {
     *     public override before(): void {
     *         console.log(`before: ${this.get_step()}`);
     *     }
     * }
     * ```
     * @instance
     */
    public before(): void {
        return;
    }

    /**
     * Override {@link StepLoop.step()} to add the code for the main step of your loop.
     *
     * The main loop code executed in the looping stage. Called after {@link StepLoop.before()} resolves, and resolves before {@link StepLoop.after()} is called. Use {@link StepLoop.step()} as the main update function of your {@link StepLoop}.
     *
     * @returns {void} `void`
     * @example
     * ```ts
     * class App extends StepLoop {
     *     public override step(): void {
     *         console.log(`step: ${this.get_step()}`);
     *     }
     * }
     * ```
     * @instance
     */
    public step(): void {
        return;
    }

    /**
     * Override {@link StepLoop.after()} to add a block of code to run after each step of your loop.
     *
     * Executed in the looping stage after the main {@link StepLoop.step()} code. Called after {@link StepLoop.step()} resolves. Use this function to clean up anything after {@link StepLoop.step()} resolves.
     *
     * @returns {void} `void`
     * @example
     * ```ts
     * class App extends StepLoop {
     *     public override after(): void {
     *         console.log(`after: ${this.get_step()}`);
     *     }
     * }
     * ```
     * @instance
     */
    public after(): void {
        return;
    }

    /**
     * Override {@link StepLoop.final()} to add a final block of code to run at the very end of the loop.
     *
     * The last code executed in the {@link StepLoop}, called after the looping stage is done. Executed once at the end of the {@link StepLoop} lifecycle, and then kills the loop. Called when the number of steps executed is greater than the lifespan of the {@link StepLoop} (i. e. {@link StepLoop.get_step()} `>` {@link StepLoop.get_lifespan()}) or when {@link StepLoop.finish()} is called.
     *
     * @returns {void} `void`
     * @example
     * ```ts
     * class App extends StepLoop {
     *     public override final(): void {
     *         console.log(`final: ${Date.now()}`);
     *     }
     * }
     * ```
     * @instance
     */
    public final(): void {
        return;
    }

    /**
     * Override {@link StepLoop.on_pause()} to add a block of code to execute immediately after calling {@link StepLoop.pause()}.
     *
     * Called only when the {@link StepLoop} is paused, then stops executing until {@link StepLoop.play()} is called.
     *
     * @returns {void} `void`
     * @example
     * ```ts
     * class App extends StepLoop {
     *     public override on_pause(): void {
     *         console.log(`paused`);
     *     }
     * }
     * ```
     * @instance
     */
    public on_pause(): void {
        return;
    }

    /**
     * Override {@link StepLoop.on_play()} to add a block of code to execute immediately after calling {@link StepLoop.play()}.
     *
     * Called only when the {@link StepLoop} is played, then proceeds with the rest of the loop.
     *
     * @returns {void} `void`
     * @example
     * ```ts
     * class App extends StepLoop {
     *     public override on_play(): void {
     *         console.log(`played`);
     *     }
     * }
     * ```
     * @instance
     */
    public on_play(): void {
        return;
    }

    /**
     * Returns `true` if the {@link StepLoop} is running and false otherwise.
     *
     * @returns {boolean} `true` if the loop is currently running
     * @example
     * ```ts
     * class App extends StepLoop {}
     * let app: App = new App();
     * app.start()
     *
     * console.log(app.is_running()) // Output -> `true`
     * ```
     * @instance
     */
    public is_running(): boolean {
        return this._running;
    }

    /**
     * Returns `true` if the {@link StepLoop} is paused and false otherwise.
     *
     * @returns {boolean} `true` if the loop is currently paused
     * @example
     * ```ts
     * class App extends StepLoop {}
     * let app: App = new App();
     * app.start()
     *
     * console.log(app.is_paused()) // Output -> `false`
     * ```
     * @instance
     */
    public is_paused(): boolean {
        return this._paused;
    }

    /**
     * Returns the current step number (the number of times the loop has run).
     *
     * @returns {number} the current step number
     * @example
     * ```ts
     * class App extends StepLoop {}
     * let app: App = new App();
     * app.start()
     *
     * console.log(app.get_step()) // Output -> `1`
     * ```
     * @instance
     */
    public get_step(): number {
        return this._step_num;
    }

    /**
     * Returns the current steps-per-second (sps).
     *
     * @returns {number} the current steps-per-second (sps)
     * @example
     * ```ts
     * class App extends StepLoop {}
     * let app: App = new App();
     * app.start()
     *
     * console.log(app.get_sps()) // Output -> `60`
     * ```
     * @instance
     */
    public get_sps(): number {
        return this._sps;
    }

    /**
     * Returns the real steps-per-second (sps) based on the time between the last two steps. This value may not be accurate until after the first few steps have completed.
     *
     * @returns {number} the real steps-per-second (sps)
     * @example
     * ```ts
     * class App extends StepLoop {}
     * let app: App = new App();
     * app.start()
     *
     * console.log(app.get_real_sps())
     * ```
     * @instance
     */
    public get_real_sps(): number {
        if (this._lastStepDuration === 0) {
            return 0;
        }
        return 1000 / this._lastStepDuration;
    }

    /**
     * Returns the current lifespan of the {@link StepLoop} (in steps).
     *
     * @returns {number | undefined} the current loop lifespan; returns `undefined` if the lifespan is unlimited
     * @example
     * ```ts
     * class App extends StepLoop {}
     * let app: App = new App(500);
     * app.start()
     *
     * console.log(app.get_lifespan()) // Output -> `500`
     * ```
     * @instance
     */
    public get_lifespan(): number | undefined {
        return this._lifespan;
    }

    /**
     * Sets the current steps-per-second (sps). Alters the speed at which the {@link StepLoop} runs: higher values will result in more steps in a faster step-speed and lower values will result in a lower step-speed. Default speed is 60 steps-per-second.
     *
     * @param {number} sps - the target steps-per-second; default value is `60`
     * @returns {number} the new steps-per-second
     * @example
     * ```ts
     * class App extends StepLoop {}
     * let app: App = new App();
     * app.start()
     *
     * console.log(app.set_sps(120)) // Output -> `120`
     * ```
     * @instance
     */
    public set_sps(sps: number): number {
        //if (this._initialized) return this._sps;;

        this._sps = sps;
        this._interval = 1000/this._sps
        return this._sps;
    }

    /**
     * Set whether or not to use {@link window.requestAnimationFrame()} for the {@link StepLoop}. When set to `true`, the loop will synchronize with the browser's rendering cycle (if the loop is running in a browser), which can result in smoother animations and better performance. When disabled, the loop will use a step-scheduler based on {@link setTimeout()}, which may be less efficient but more predictable.
     *
     * @param {boolean} status - `true` to use `requestAnimationFrame`, `false` to use the step scheduler.
     * @returns {boolean} the new status of `requestAnimationFrame`
     * @example
     * ```ts
     * class App extends StepLoop {}
     * let app: App = new App();
     *
     * app.set_use_RAF(true)
     * app.start()
     * ```
     * @instance
     */
    public set_use_RAF(status: boolean): boolean {
        this._RAFActive = status;
        return this._RAFActive;
    }

    /**
     * Extend (or reduce) the lifespan of the {@link StepLoop}. Adds the specified number of steps to the current lifespan, or removes the limit on the {@link StepLoop}'s lifespan (will run until {@link StepLoop.finish()} is called).
     *
     * If {@link StepLoop.extend_lifespan()} is called after the lifespan limit is reached, {@link StepLoop.play()} can be called to resume executing the {@link StepLoop}. The termination stage will be executed again when the limit is reached again.
     *
     * @param {number} [steps] - the target lifespan (in number of steps); if `undefined` the lifespan becomes unlimited; default value is `undefined` if not provided
     * @returns {number | undefined} the new lifespan
     * @example
     * ```ts
     * class App extends StepLoop {}
     * let app: App = new App();
     * app.start()
     *
     * console.log(app.extend_lifespan(100)) // Output -> `100`
     * ```
     * @instance
     */
    public extend_lifespan(steps?: number ): number | undefined {
        if (!this._initialized) return undefined;

        if (typeof steps != "number") {
            this._lifespan = undefined;
        } else {
            this._lifespan = (this._lifespan || 0) + steps;

            if(this._kill && (this._lifespan > this._step_num)){
                this._kill = false
            }
        }
        return this._lifespan;
    }

    /**
     * Pause the execution of the {@link StepLoop} after the current step resolves. Steps will not advance and the current step ({@link StepLoop.get_step()}) will not increase while the {@link StepLoop} is paused. Use {@link StepLoop.play()} to resume execution and continue the loop.
     *
     * @returns {void} `void`
     * @example
     * ```ts
     * class App extends StepLoop {}
     * let app: App = new App();
     * app.start()
     *
     * app.pause()
     * ```
     * @instance
     */
    public pause(): void {
        if (!this._initialized || !this._running || this._kill) return;

        this._running = false;
        this._paused = true;
        this._cancel_next_step();
        this.on_pause()
    }

    /**
     * Resume execution of the {@link StepLoop} after calling {@link StepLoop.pause()} to pause it. Will resume execution on the next step in the {@link StepLoop} lifespan. Use {@link StepLoop.pause()} to pause execution and stop the loop.
     *
     * @returns {void} `void`
     * @example
     * ```ts
     * class App extends StepLoop {}
     * let app: App = new App();
     * app.start()
     *
     * app.pause()
     * app.play()
     * ```
     * @instance
     */
    public play(): void {
        if (!this._initialized || this._running || this._kill) return;

        this._running = true;
        this._paused = false;
        this._startTime = performance.now() - (this._step_num * this._interval);
        this.on_play();
        this._run(performance.now());
    }

    /**
     * Begin execution of the {@link StepLoop} lifecycle. Calls {@link StepLoop.initial()} to execute the initialization stage, then proceeds to the looping stage. The termination stage will not execute until {@link StepLoop.finish()} is called.
     *
     * If {@link StepLoop.start()} is called after the termination stage has ended, the loop will restart at the beginning of the initialization stage.
     *
     * @returns {void} `void`
     * @example
     * ```ts
     * class App extends StepLoop {}
     * let app: App = new App();
     *
     * app.start()
     * ```
     * @instance
     */
    public start(): void{
        this._running = true;
        this._startTime = performance.now();
        this._main();
    }

    /**
     * Ends the {@link StepLoop}. Executes the termination stage of the {@link StepLoop} lifecycle. Calls {@link StepLoop.final()} and then kills the loop.
     *
     * @returns {void} `void`
     * @example
     * ```ts
     * class App extends StepLoop {}
     * let app: App = new App();
     * app.start()
     *
     * app.finish()
     * ```
     * @instance
     */
    public finish(): void {
        if (!this._initialized || this._kill) return;

        this._running = false;
        this._paused = false;
        this._kill = true;
        this._cancel_next_step();
        this._term()
    }



    private _RAFAvailable: boolean = typeof requestAnimationFrame !== 'undefined';
    private _RAFActive: boolean;
    private _RAFId: number | undefined;

    private _request_next_step(timestamp: DOMHighResTimeStamp | number): void {
        if (!this._running) return;

        if (this._RAFActive && this._RAFAvailable) {
            this._RAFId = requestAnimationFrame((nextTimestamp) => {
                this._run(nextTimestamp);
            });
            return;
        }

        const now = performance.now();
        const nextStepTime = this._startTime + (this._step_num * this._interval);
        const delay = Math.max(0, nextStepTime - now);

        this._timeoutId = setTimeout(() => {
            this._run(performance.now());
        }, delay);
    }

    private _cancel_next_step(): void {
        if (this._timeoutId && !this._RAFActive) {
            clearTimeout(this._timeoutId);
            this._timeoutId = undefined;
        } else if (this._RAFId && this._RAFActive) {
            cancelAnimationFrame(this._RAFId);
            this._RAFId = undefined;
        }
    }

    private _check_for_end_trigger(): boolean {
        if (this._kill || (this._lifespan && (this._step_num >= this._lifespan))){
            return true;
        } else {
            return false;
        }
    }

    private _init(): void {
        this._kill = false
        this._initialized = true;
        this._step_num = 0;
        try {
            this.initial();
        } catch (error) {
            console.error('Error in initial():', error);
        }

    }

    private _run(timestamp: number): void {
        if (this._running) {
            if (this._check_for_end_trigger()) {
                this._term();
                return;
            }

            this.background().catch(error => {
                console.error('Error in background():', error);
            });

            try {
                this.before();
            } catch (error) {
                console.error('Error in before():', error);
            }

            try {
                this.step();
            } catch (error) {
                console.error('Error in step():', error);
            }

            try {
                this.after();
            } catch (error) {
                console.error('Error in after():', error);
            }

            this._step_num++;
            this._lastStepDuration = timestamp - this._lastStepTime;
            this._lastStepTime = timestamp;
            this._request_next_step(timestamp)
        }
    }

    private _term(): void {
        this._running = false
        this._paused = false;
        this._cancel_next_step();
        this._kill = true;

        try {
            this.final();
        } catch (error) {
            console.error('Error in final():', error);
        }

    }

    private _main(): void{
        this._init();
        this._run(performance.now());
    }
}

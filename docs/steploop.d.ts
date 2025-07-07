/**
 * @fileoverview Provides the {@link StepLoop} class, a foundation for building loops that execute at a consistent, specified rate.
 *
 * To define a new loop, extend the {@link StepLoop} class and override its methods to implement custom behavior.
 *
 * ### Lifecycle
 *
 * The {@link StepLoop} class executes in three distinct stages, with hooks that can be overridden to add custom logic:
 *
 * 1.  **Initialization:** Runs once at the beginning of the loop
 *     - {@link StepLoop.initial()}
 * 2.  **Looping:** The core of the loop, which repeatedly executes the following sequence:
 *     - {@link StepLoop.background()} (async)
 *     - {@link StepLoop.before()}
 *     - {@link StepLoop.step()}
 *     - {@link StepLoop.after()}
 * 3.  **Termination:** Runs once when the loop ends, either by reaching the end of its lifespan or being manually stopped
 *     - {@link StepLoop.final()}
 *
 * The loop can run indefinitely or for a set number of steps, and its execution can be precisely controlled, allowing it to be paused, resumed, and dynamically modified at runtime.
 *
 * @module steploop
 */
/**
 * A base class for building loops that execute at a consistent, specified rate.
 *
 * {@link StepLoop} provides a structured lifecycle with methods that can be overridden to implement custom behavior.
 *
 * The {@link StepLoop} class manages the timing and execution flow, supporting both fixed-step updates via {@link setTimeout()} and smoother, display-synchronized updates using {@link window.requestAnimationFrame()}.
 *
 * The loop can run indefinitely or for a set number of steps, and its execution can be precisely controlled, allowing it to be paused, resumed, and dynamically modified at runtime.
 *
 * @example
 * ```ts
 * import { StepLoop } from "steploop";
 *
 * class App extends StepLoop {
 *   override initial(): void {
 *     console.log("Loop starting");
 *   }
 *
 *   override step(): void {
 *     console.log(`Executing step: ${this.get_step()}`);
 *   }
 *
 *   override final(): void {
 *     console.log("Loop finished");
 *   }
 * }
 *
 * // Create a new loop that runs at 60 steps-per-second for 100 steps
 * const loop = new App(60, 100);
 * loop.start();
 * ```
 * @class
 */
export declare class StepLoop {
    private _step_num;
    private _lifespan;
    private _sps;
    private _interval;
    private _startTime;
    private _lastStepTime;
    private _lastStepDuration;
    private _timeoutId;
    private _initialized;
    private _running;
    private _paused;
    private _kill;
    /**
     * Create a `StepLoop`, with options to define the steps-per-second and the lifespan of the loop.
     * @param {number} sps - the steps-per-second of the loop (note: values that are greater than about 250 may result in unexpected behavior); default value is 60
     * @param {number | undefined} lifespan - the number of steps that are executed before the loop ends; setting to `undefined` will result in an unlimited lifespan; default value is `undefined`
     */
    constructor(sps?: number, lifespan?: number | undefined, RAF?: boolean);
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
    initial(): void;
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
    background(): Promise<void>;
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
    before(): void;
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
    step(): void;
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
    after(): void;
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
    final(): void;
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
    on_pause(): void;
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
    on_play(): void;
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
    is_running(): boolean;
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
    is_paused(): boolean;
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
    get_step(): number;
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
    get_sps(): number;
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
    get_real_sps(): number;
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
    get_lifespan(): number | undefined;
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
    set_sps(sps: number): number;
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
    set_use_RAF(status: boolean): boolean;
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
    extend_lifespan(steps?: number): number | undefined;
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
    pause(): void;
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
    play(): void;
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
    start(): void;
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
    finish(): void;
    private _RAFAvailable;
    private _RAFActive;
    private _RAFId;
    private _request_next_step;
    private _cancel_next_step;
    private _check_for_end_trigger;
    private _init;
    private _run;
    private _term;
    private _main;
}

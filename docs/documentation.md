<a name="module_steploop"></a>

## steploop
Extend the [StepLoop](StepLoop) class to define your own loop.

The [StepLoop](StepLoop) class provides a base for a loop with steps executed at a set rate of steps-per-second.

Executes at 60 steps-per-second by default.

Executes in three stages:

##### 1. Initialization Stage
- [StepLoop.initial()](StepLoop.initial())
##### 2. Looping Stage
1. [StepLoop.before()](StepLoop.before())
2. [StepLoop.step()](StepLoop.step())
3. [StepLoop.after()](StepLoop.after())
##### 3. Termination Stage
- [StepLoop.final()](StepLoop.final())

The initialization stage and termination stage each execute once, as the first step and last step respectively. The looping stage will start after the initialization stage is done, and it will loop through its three parts until something triggers the termination stage and its lifecycle comes to an end.


* [steploop](#module_steploop)
    * [.StepLoop](#module_steploop.StepLoop)
        * [new exports.StepLoop(sps, lifespan)](#new_module_steploop.StepLoop_new)
        * [.initial()](#module_steploop.StepLoop+initial) ⇒ <code>void</code>
        * [.background()](#module_steploop.StepLoop+background) ⇒ <code>Promise.&lt;void&gt;</code>
        * [.before()](#module_steploop.StepLoop+before) ⇒ <code>void</code>
        * [.step()](#module_steploop.StepLoop+step) ⇒ <code>void</code>
        * [.after()](#module_steploop.StepLoop+after) ⇒ <code>void</code>
        * [.final()](#module_steploop.StepLoop+final) ⇒ <code>void</code>
        * [.on_pause()](#module_steploop.StepLoop+on_pause) ⇒ <code>void</code>
        * [.on_play()](#module_steploop.StepLoop+on_play) ⇒ <code>void</code>
        * [.is_running()](#module_steploop.StepLoop+is_running) ⇒ <code>boolean</code>
        * [.is_paused()](#module_steploop.StepLoop+is_paused) ⇒ <code>boolean</code>
        * [.get_step()](#module_steploop.StepLoop+get_step) ⇒ <code>number</code>
        * [.get_sps()](#module_steploop.StepLoop+get_sps) ⇒ <code>number</code>
        * [.get_real_sps()](#module_steploop.StepLoop+get_real_sps) ⇒ <code>number</code>
        * [.get_lifespan()](#module_steploop.StepLoop+get_lifespan) ⇒ <code>number</code> \| <code>undefined</code>
        * [.set_sps(sps)](#module_steploop.StepLoop+set_sps) ⇒ <code>number</code>
        * [.set_use_RAF(status)](#module_steploop.StepLoop+set_use_RAF) ⇒ <code>boolean</code>
        * [.extend_lifespan([steps])](#module_steploop.StepLoop+extend_lifespan) ⇒ <code>number</code> \| <code>undefined</code>
        * [.pause()](#module_steploop.StepLoop+pause) ⇒ <code>void</code>
        * [.play()](#module_steploop.StepLoop+play) ⇒ <code>void</code>
        * [.start()](#module_steploop.StepLoop+start) ⇒ <code>void</code>
        * [.finish()](#module_steploop.StepLoop+finish) ⇒ <code>void</code>

<a name="module_steploop.StepLoop"></a>

### steploop.StepLoop
A `StepLoop`.

**Kind**: static class of [<code>steploop</code>](#module_steploop)  

* [.StepLoop](#module_steploop.StepLoop)
    * [new exports.StepLoop(sps, lifespan)](#new_module_steploop.StepLoop_new)
    * [.initial()](#module_steploop.StepLoop+initial) ⇒ <code>void</code>
    * [.background()](#module_steploop.StepLoop+background) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.before()](#module_steploop.StepLoop+before) ⇒ <code>void</code>
    * [.step()](#module_steploop.StepLoop+step) ⇒ <code>void</code>
    * [.after()](#module_steploop.StepLoop+after) ⇒ <code>void</code>
    * [.final()](#module_steploop.StepLoop+final) ⇒ <code>void</code>
    * [.on_pause()](#module_steploop.StepLoop+on_pause) ⇒ <code>void</code>
    * [.on_play()](#module_steploop.StepLoop+on_play) ⇒ <code>void</code>
    * [.is_running()](#module_steploop.StepLoop+is_running) ⇒ <code>boolean</code>
    * [.is_paused()](#module_steploop.StepLoop+is_paused) ⇒ <code>boolean</code>
    * [.get_step()](#module_steploop.StepLoop+get_step) ⇒ <code>number</code>
    * [.get_sps()](#module_steploop.StepLoop+get_sps) ⇒ <code>number</code>
    * [.get_real_sps()](#module_steploop.StepLoop+get_real_sps) ⇒ <code>number</code>
    * [.get_lifespan()](#module_steploop.StepLoop+get_lifespan) ⇒ <code>number</code> \| <code>undefined</code>
    * [.set_sps(sps)](#module_steploop.StepLoop+set_sps) ⇒ <code>number</code>
    * [.set_use_RAF(status)](#module_steploop.StepLoop+set_use_RAF) ⇒ <code>boolean</code>
    * [.extend_lifespan([steps])](#module_steploop.StepLoop+extend_lifespan) ⇒ <code>number</code> \| <code>undefined</code>
    * [.pause()](#module_steploop.StepLoop+pause) ⇒ <code>void</code>
    * [.play()](#module_steploop.StepLoop+play) ⇒ <code>void</code>
    * [.start()](#module_steploop.StepLoop+start) ⇒ <code>void</code>
    * [.finish()](#module_steploop.StepLoop+finish) ⇒ <code>void</code>

<a name="new_module_steploop.StepLoop_new"></a>

#### new exports.StepLoop(sps, lifespan)
Create a `StepLoop`, with options to define the steps-per-second and the lifespan of the loop.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| sps | <code>number</code> | <code>60</code> | the steps-per-second of the loop (note: values that are greater than about 250 may result in unexpected behavior); default value is 60 |
| lifespan | <code>number</code> \| <code>undefined</code> |  | the number of steps that are executed before the loop ends; setting to `undefined` will result in an unlimited lifespan; default value is `undefined` |

<a name="module_steploop.StepLoop+initial"></a>

#### stepLoop.initial() ⇒ <code>void</code>
Override [StepLoop.initial()](StepLoop.initial()) to add an initial block of code to execute at the very beginning of the loop.

The first code executed in the [StepLoop](StepLoop). Called once at the beginning of the [StepLoop](StepLoop) lifecycle, and then moves on to the first [StepLoop.background()](StepLoop.background()) call in the looping stage after resolving. Executed right after [StepLoop.start()](StepLoop.start()) is called.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>void</code> - `void`  
**Example**  
```ts
class App extends StepLoop {
    public override initial(): void {
        console.log(`initial: ${Date.now()}`);
    }
}
```
<a name="module_steploop.StepLoop+background"></a>

#### stepLoop.background() ⇒ <code>Promise.&lt;void&gt;</code>
Override [StepLoop.background()](StepLoop.background()) to add a block of code to run in the background of each step of your loop.

Executed in the background at the beginning of the looping stage. Called asynchronously before the rest of the loop, executes while the rest of the loop does. Starts before [StepLoop.before()](StepLoop.before()) but may not resolve before it is called.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>Promise.&lt;void&gt;</code> - `Promise<void>`  
**Example**  
```js
class App extends StepLoop {
    public override async background(): Promise<void> {
        console.log(`background: ${this.get_step()}`);
    }
}
```
<a name="module_steploop.StepLoop+before"></a>

#### stepLoop.before() ⇒ <code>void</code>
Override [StepLoop.before()](StepLoop.before()) to add a block of code to run before each step of your loop.

Executed in the looping stage before the main [StepLoop.step()](StepLoop.step()) code. Resolves before calling [StepLoop.step()](StepLoop.step()). Use this function to set up anything you need before [StepLoop.step()](StepLoop.step()) is called.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>void</code> - `void`  
**Example**  
```ts
class App extends StepLoop {
    public override before(): void {
        console.log(`before: ${this.get_step()}`);
    }
}
```
<a name="module_steploop.StepLoop+step"></a>

#### stepLoop.step() ⇒ <code>void</code>
Override [StepLoop.step()](StepLoop.step()) to add the code for the main step of your loop.

The main loop code executed in the looping stage. Called after [StepLoop.before()](StepLoop.before()) resolves, and resolves before [StepLoop.after()](StepLoop.after()) is called. Use [StepLoop.step()](StepLoop.step()) as the main update function of your [StepLoop](StepLoop).

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>void</code> - `void`  
**Example**  
```ts
class App extends StepLoop {
    public override step(): void {
        console.log(`step: ${this.get_step()}`);
    }
}
```
<a name="module_steploop.StepLoop+after"></a>

#### stepLoop.after() ⇒ <code>void</code>
Override [StepLoop.after()](StepLoop.after()) to add a block of code to run after each step of your loop.

Executed in the looping stage after the main [StepLoop.step()](StepLoop.step()) code. Called after [StepLoop.step()](StepLoop.step()) resolves. Use this function to clean up anything after [StepLoop.step()](StepLoop.step()) resolves.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>void</code> - `void`  
**Example**  
```ts
class App extends StepLoop {
    public override after(): void {
        console.log(`after: ${this.get_step()}`);
    }
}
```
<a name="module_steploop.StepLoop+final"></a>

#### stepLoop.final() ⇒ <code>void</code>
Override [StepLoop.final()](StepLoop.final()) to add a final block of code to run at the very end of the loop.

The last code executed in the [StepLoop](StepLoop), called after the looping stage is done. Executed once at the end of the [StepLoop](StepLoop) lifecycle, and then kills the loop. Called when the number of steps executed is greater than the lifespan of the [StepLoop](StepLoop) (i. e. [StepLoop.get_step()](StepLoop.get_step()) `>` [StepLoop.get_lifespan()](StepLoop.get_lifespan())) or when [StepLoop.finish()](StepLoop.finish()) is called.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>void</code> - `void`  
**Example**  
```ts
class App extends StepLoop {
    public override final(): void {
        console.log(`final: ${Date.now()}`);
    }
}
```
<a name="module_steploop.StepLoop+on_pause"></a>

#### stepLoop.on\_pause() ⇒ <code>void</code>
Override [StepLoop.on_pause()](StepLoop.on_pause()) to add a block of code to execute immediately after calling [StepLoop.pause()](StepLoop.pause()).

Called only when the [StepLoop](StepLoop) is paused, then stops executing until [StepLoop.play()](StepLoop.play()) is called.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>void</code> - `void`  
**Example**  
```ts
class App extends StepLoop {
    public override on_pause(): void {
        console.log(`paused`);
    }
}
```
<a name="module_steploop.StepLoop+on_play"></a>

#### stepLoop.on\_play() ⇒ <code>void</code>
Override [StepLoop.on_play()](StepLoop.on_play()) to add a block of code to execute immediately after calling [StepLoop.play()](StepLoop.play()).

Called only when the [StepLoop](StepLoop) is played, then proceeds with the rest of the loop.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>void</code> - `void`  
**Example**  
```ts
class App extends StepLoop {
    public override on_play(): void {
        console.log(`played`);
    }
}
```
<a name="module_steploop.StepLoop+is_running"></a>

#### stepLoop.is\_running() ⇒ <code>boolean</code>
Returns `true` if the [StepLoop](StepLoop) is running and false otherwise.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>boolean</code> - `true` if the loop is currently running  
**Example**  
```ts
class App extends StepLoop {}
let app: App = new App();
app.start()

console.log(app.is_running()) // Output -> `true`
```
<a name="module_steploop.StepLoop+is_paused"></a>

#### stepLoop.is\_paused() ⇒ <code>boolean</code>
Returns `true` if the [StepLoop](StepLoop) is paused and false otherwise.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>boolean</code> - `true` if the loop is currently paused  
**Example**  
```ts
class App extends StepLoop {}
let app: App = new App();
app.start()

console.log(app.is_paused()) // Output -> `false`
```
<a name="module_steploop.StepLoop+get_step"></a>

#### stepLoop.get\_step() ⇒ <code>number</code>
Returns the current step number (the number of times the loop has run).

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>number</code> - the current step number  
**Example**  
```ts
class App extends StepLoop {}
let app: App = new App();
app.start()

console.log(app.get_step()) // Output -> `1`
```
<a name="module_steploop.StepLoop+get_sps"></a>

#### stepLoop.get\_sps() ⇒ <code>number</code>
Returns the current steps-per-second (sps).

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>number</code> - the current steps-per-second (sps)  
**Example**  
```ts
class App extends StepLoop {}
let app: App = new App();
app.start()

console.log(app.get_sps()) // Output -> `60`
```
<a name="module_steploop.StepLoop+get_real_sps"></a>

#### stepLoop.get\_real\_sps() ⇒ <code>number</code>
Returns the real steps-per-second (sps) based on the time between the last two steps. This value may not be accurate until after the first few steps have completed.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>number</code> - the real steps-per-second (sps)  
**Example**  
```ts
class App extends StepLoop {}
let app: App = new App();
app.start()

console.log(app.get_real_sps())
```
<a name="module_steploop.StepLoop+get_lifespan"></a>

#### stepLoop.get\_lifespan() ⇒ <code>number</code> \| <code>undefined</code>
Returns the current lifespan of the [StepLoop](StepLoop) (in steps).

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>number</code> \| <code>undefined</code> - the current loop lifespan; returns `undefined` if the lifespan is unlimited  
**Example**  
```ts
class App extends StepLoop {}
let app: App = new App(500);
app.start()

console.log(app.get_lifespan()) // Output -> `500`
```
<a name="module_steploop.StepLoop+set_sps"></a>

#### stepLoop.set\_sps(sps) ⇒ <code>number</code>
Sets the current steps-per-second (sps). Alters the speed at which the [StepLoop](StepLoop) runs: higher values will result in more steps in a faster step-speed and lower values will result in a lower step-speed. Default speed is 60 steps-per-second.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>number</code> - the new steps-per-second  

| Param | Type | Description |
| --- | --- | --- |
| sps | <code>number</code> | the target steps-per-second; default value is `60` |

**Example**  
```ts
class App extends StepLoop {}
let app: App = new App();
app.start()

console.log(app.set_sps(120)) // Output -> `120`
```
<a name="module_steploop.StepLoop+set_use_RAF"></a>

#### stepLoop.set\_use\_RAF(status) ⇒ <code>boolean</code>
Set whether or not to use [window.requestAnimationFrame()](window.requestAnimationFrame()) for the [StepLoop](StepLoop). When set to `true`, the loop will synchronize with the browser's rendering cycle (if the loop is running in a browser), which can result in smoother animations and better performance. When disabled, the loop will use a step-scheduler based on [setTimeout()](setTimeout()), which may be less efficient but more predictable.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>boolean</code> - the new status of `requestAnimationFrame`  

| Param | Type | Description |
| --- | --- | --- |
| status | <code>boolean</code> | `true` to use `requestAnimationFrame`, `false` to use the step scheduler. |

**Example**  
```ts
class App extends StepLoop {}
let app: App = new App();

app.set_use_RAF(true)
app.start()
```
<a name="module_steploop.StepLoop+extend_lifespan"></a>

#### stepLoop.extend\_lifespan([steps]) ⇒ <code>number</code> \| <code>undefined</code>
Extend (or reduce) the lifespan of the [StepLoop](StepLoop). Adds the specified number of steps to the current lifespan, or removes the limit on the [StepLoop](StepLoop)'s lifespan (will run until [StepLoop.finish()](StepLoop.finish()) is called).

If [StepLoop.extend_lifespan()](StepLoop.extend_lifespan()) is called after the lifespan limit is reached, [StepLoop.play()](StepLoop.play()) can be called to resume executing the [StepLoop](StepLoop). The termination stage will be executed again when the limit is reached again.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>number</code> \| <code>undefined</code> - the new lifespan  

| Param | Type | Description |
| --- | --- | --- |
| [steps] | <code>number</code> | the target lifespan (in number of steps); if `undefined` the lifespan becomes unlimited; default value is `undefined` if not provided |

**Example**  
```ts
class App extends StepLoop {}
let app: App = new App();
app.start()

console.log(app.extend_lifespan(100)) // Output -> `100`
```
<a name="module_steploop.StepLoop+pause"></a>

#### stepLoop.pause() ⇒ <code>void</code>
Pause the execution of the [StepLoop](StepLoop) after the current step resolves. Steps will not advance and the current step ([StepLoop.get_step()](StepLoop.get_step())) will not increase while the [StepLoop](StepLoop) is paused. Use [StepLoop.play()](StepLoop.play()) to resume execution and continue the loop.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>void</code> - `void`  
**Example**  
```ts
class App extends StepLoop {}
let app: App = new App();
app.start()

app.pause()
```
<a name="module_steploop.StepLoop+play"></a>

#### stepLoop.play() ⇒ <code>void</code>
Resume execution of the [StepLoop](StepLoop) after calling [StepLoop.pause()](StepLoop.pause()) to pause it. Will resume execution on the next step in the [StepLoop](StepLoop) lifespan. Use [StepLoop.pause()](StepLoop.pause()) to pause execution and stop the loop.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>void</code> - `void`  
**Example**  
```ts
class App extends StepLoop {}
let app: App = new App();
app.start()

app.pause()
app.play()
```
<a name="module_steploop.StepLoop+start"></a>

#### stepLoop.start() ⇒ <code>void</code>
Begin execution of the [StepLoop](StepLoop) lifecycle. Calls [StepLoop.initial()](StepLoop.initial()) to execute the initialization stage, then proceeds to the looping stage. The termination stage will not execute until [StepLoop.finish()](StepLoop.finish()) is called.

If [StepLoop.start()](StepLoop.start()) is called after the termination stage has ended, the loop will restart at the beginning of the initialization stage.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>void</code> - `void`  
**Example**  
```ts
class App extends StepLoop {}
let app: App = new App();

app.start()
```
<a name="module_steploop.StepLoop+finish"></a>

#### stepLoop.finish() ⇒ <code>void</code>
Ends the [StepLoop](StepLoop). Executes the termination stage of the [StepLoop](StepLoop) lifecycle. Calls [StepLoop.final()](StepLoop.final()) and then kills the loop.

**Kind**: instance method of [<code>StepLoop</code>](#module_steploop.StepLoop)  
**Returns**: <code>void</code> - `void`  
**Example**  
```ts
class App extends StepLoop {}
let app: App = new App();
app.start()

app.finish()
```

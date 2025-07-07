<h3 align="center" >
  <div>
    <a href="https://github.com/nickesc/steploop"><img alt="Source: Github" src="https://img.shields.io/badge/source-github-brightgreen?style=for-the-badge&logo=github&labelColor=%23505050"></a>
    <a href="https://github.com/nickesc/steploop/actions/workflows/steploop-ts-tests.yml"><img alt="Tests: github.com/nickesc/steploop/actions/workflows/steploop-ts-tests.yml" src="https://img.shields.io/github/actions/workflow/status/nickesc/steploop/steploop-ts-tests.yml?logo=github&label=tests&logoColor=white&style=for-the-badge&labelColor=%23505050"></a>
    <br>
    <a href="https://www.npmjs.com/package/steploop"><img alt="NPM: npmjs.com/package/steploop" src="https://img.shields.io/npm/v/steploop?style=for-the-badge&logo=npm&logoColor=white&label=npm&color=%23C12127&labelColor=%23505050"></a>
  </div>
  <br>
  <img src="./docs/icon.svg" width="150px">
  <h3 align="center">
    <code>steploop</code>
  </h3>
  <h5 align="center">
    
  </h5>
  <h6 align="center">
    by <a href="https://nickesc.github.io">N. Escobar</a> / <a href="https://github.com/nickesc">nickesc</a>
  </h6>
  <h6 align="center">
    a foundation for building loops that<br>
    execute at a consistent, specified rate
  </h6>
</h3>

<br>

## About `steploop`

`steploop` is a fully-featured main-loop written in TypeScript with no additional dependencies. It provides a strong foundation for building loops that execute at a consistent, specified rate, inspired by game engine main-loops like Godot's [`MainLoop`](https://docs.godotengine.org/en/stable/classes/class_mainloop.html) or Unity's [`Update()` loop](https://docs.unity3d.com/Manual/execution-order.html).

`steploop` provides a structured lifecycle with methods that can be overridden to implement custom behavior.

The `StepLoop` class manages the timing and execution flow, supporting both fixed-step updates via [`setTimeout()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout) and smoother, display-synchronized updates using [`window.requestAnimationFrame()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame).

## Install

Install `steploop` via NPM:

```sh
npm i steploop  # NOT PUBLISHED
```

Import the `StepLoop` class in your TypeScript or JavaScript file:

```ts
import { StepLoop } from "steploop";
```

> [!NOTE]
> `steploop` should be imported as an ES6 module.

## Basic Usage

To define a new loop, extend the `StepLoop` class and override its methods to implement custom behavior.

```ts
import { StepLoop } from "steploop";

class App extends StepLoop {
  override initial(): void {
    console.log("Loop starting");
  }

  override step(): void {
    console.log(`Executing step: ${this.get_step()}`);
  }

  override final(): void {
    console.log("Loop finished");
  }
}

// Create a new loop that runs at 60 steps-per-second for 100 steps
const app = new App(60, 100);
app.start();
```

To see a `StepLoop` in action and play with execution, check out the [demo page](https://nickesc.github.io/steploop/) or the [demo code](/docs/script.js).

## Lifecycle

The `StepLoop` class executes in three distinct stages, with hooks that can be overridden to add custom logic:

1.  **Initialization:** Runs once at the beginning of the loop
    - `initial()`: Runs once at the beginning of the loop.
2.  **Looping:** The core of the loop, which repeatedly executes the following sequence:
    - `background()`: Runs asynchronously at the beginning of each step.
    - `before()`: Runs before the main `step()` method.
    - `step()`: The main update function for your loop.
    - `after()`: Runs after the `step()` method.
3.  **Termination:** Runs once when the loop ends, either by reaching the end of its lifespan or being manually stopped
    - `final()`: Runs once when the loop ends.

The loop can run indefinitely or for a set number of steps, and its execution can be precisely controlled, allowing it to be paused, resumed, and dynamically modified at runtime.

## Reference

For full documentation of the module and its methods, please see the [Documentation](/docs/documentation.md) page.

## License

`steploop` is released under the **MIT** license. For more information, see the repository's [LICENSE](/LICENSE) file.

# Documentation on Sextant

This will be a non-exhaustive list of the different API's and functions
in the project as well as the use of each.

### Setttings

TODO


### Creating Modules

If you haven't yet and are planning on writing modules for Sextant, I
recommend reading how [patches are applied](#patch) first.

#### For the DOM

Patches will normally consist of 4-parts.

- Your Code
- Loading the ipc handler
- Loading the patch
- Registering the ipc-event

To create a patch you program should follow the format:

```typescript
export const handler_function = (settings) => { };

// This is the main function
export default () => { };
```

The `handler_function` will be used for anything that is like
ipcMain function.

> [!INFO]
> Your handler function will optionally take in settings from
> the [settings.toml file](#settings)


> [!IMPORTANT]
> In order for the `ipcMain` function to work, you will need to
> add it the the `patches` variable in `main.ts`.
> You will also need to register the function in the `preload.js`
> script.


`export default ()=>{}` is where your code will go. This will
be injected into the DOM during the runtime of the program.
Anything within the brackets will be executed.

**Example**

```typescript patches/example.ts
import { ipcMain } from "electron";

export const example_handler = (settings: toml) => {
	ipcMain.on("example_event_callback", () => {
        console.log("Hello from the electron client")
	});
};

export default () => {
    window.electron.example_event();
    console.log("Hello! I ran from the DOM!")
};
```

```javascript preload.js
const { contextBridge, ipcRenderer } = require("electron");
    contextBridge.exposeInMainWorld("electron", {
    ...
    example_event: () => ipcRender.send("example_event_callback")
});
```

```typescript main.ts
import { example_handler } from "./patches/example";
const patches = [example_handler];
```

```typescript patch.ts
import example from "./patches/example";
...
	patches.push(`${recent_fix}`, `${dynamic_css_loader}`, `${example}`);
...
```


#### For both DOM and Electron

The steps are almost the same, obviously there are limitations having the
function be shared and there are restrictions on how I've implemented the
ability to load the functions.

When creating the shared function the from **MUST** be a [arrow expression](https://www.w3schools.in/javascript/types-of-functions)
Everything else is up to you!

To load the patch in look for this comment in the `patch.ts` file `// load non dom specific scripts before doms scripts`
and push it before loading the DOM scripts. See [shared patches](#shared-patches) to understand why it needs to be loaded before.

## API

### logger / window.logger

This is a custom logger function to print out information
in a pretty way!

```typescript
logger: (
    message: any,
    level: "warning" | "error" | "debug" | "info" | "log" = "log",
    namespace: string = "Sextant",
) => void;
```

### bootstrap.ts

This is the boostrap function that will wait till Observer events are
able to be registered a.k.a. the DOM is loaded. Then it will call
the electron ipcRender function [load_patches](#load_patches)


### load_patches

`load_patches` is an ipcRender function send function that will call
load both the window event (because if the patches are called, then
we want to see the window) and it will then also call the [patch](#patch) function
as `executeJavaScript` to load in all patches.


### patch

This is a function that will load in all patches registered. If
you're planning on adding to this project, this is most likely where
you would want to iterate on.

---

#### DOM Patches

If the script is meant to run **only on the browser**, add your patches
to the push method where there is this comment `// load in the dom scripts`.
It must follow the the format `${function_export}`.

Read on how to export functions -> [creating modules](#creating-modules)

#### Shared Patches

To have a shared function that works both in Electron and is registered in
the DOM read -> [creating shared modules](#for-both-dom-and-electron)

Once you've read the above an want the explanation why shared function
should be loaded in before dom functions, its really quite simple,
we want to use the "shared function" in our patch!

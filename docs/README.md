# Documentation on Sextant

This will be a non-exhaustive list of the different API's and functions
in the project as well as the use of each.


### Creating Modules

If you haven't yet and are planning on writing modules for Sextant, I
recommend reading how [patches are applied](#patch) first.

To create a patch you program should follow the format:

```typescript
export const handler_function = () => { };

// This is the main function
export default () => { };
```

The `handler_function` will be used for anything that is like
ipcMain function.

> [!IMPORTANT]
> In order for the `ipcMain` function to work, you will need to
> add it the the `patches` variable in `main.ts`

`export default ()=>{}` is where your code will go. This will
be injected into the DOM during the runtime of the program.
Anything within the brackets will be executed.


## API

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

If the script is meant to run **only on the browser**, add your patches
to the push method where there is this comment `// load in the dom scripts`.
It must follow the the format `${function_export}`.

Read on how to export functions -> [creating modules](#creating-modules)

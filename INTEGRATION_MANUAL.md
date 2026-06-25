# A2UI Composer Integration Manual

# Background

The A2UI Composer has no knowledge or integration with any particular catalog or
renderer stack. In order to see the A2UI JSON rendered, it relies on a “Renderer
Application.” The A2UI Composer hosts the Renderer Application in an iframe and
communicates with it via **postMessage**. The iframe hosting the renderer
application has `sandbox='allow-scripts allow-same-origin allow-forms'`, which
should not be a problem for simply rendering the A2UI JSON.

The Renderer Application is responsible for accepting A2UI JSON and using its
renderers to display the result.

# The Bridge

To simplify the work of integrating with the A2UI Composer, a **bridge** has
been created. This is a small amount of Javascript code that the Renderer
Application incorporates, and coordinates all the communication between the A2UI
Composer and the Renderer Application.

To further simplify the integration, three framework specific wrappers are
provide:

* Angular
* Lit
* React

## Prerequisites

Add the core integration package to your project dependencies list:

```shell
yarn add a2ui-bridge
```

Of course, if you’re using a different package manager, follow the appropriate
steps.

## Using Lit

### Bootstrap your renderer application

Import `bootstrapLitSandbox` from the Lit-specific subpath, and provide your
catalog definitions inside your entrypoint file (`src/main.ts`):

```ts
import {bootstrapLitSandbox} from 'a2ui-bridge/lit';
import {basicCatalog} from '@a2ui/lit/v0_9';


import {Catalog, ComponentApi} from '@a2ui/web_core/v0_9';

// Exposes the Lit element mapping cast-free using standard workspace interfaces:
export const AppRoot = bootstrapLitSandbox([
  basicCatalog as unknown as Catalog<ComponentApi>,
]);
```

Replace `basicCatalog` with your catalog.

## Using Angular

Angular involves additional steps in order to properly work with the
Ahead-of-Time compilation.

### Step 1: Create the wrapper component

Create a new component that looks like this:

```ts
import {Component, inject} from '@angular/core';
import {SurfaceComponent} from '@a2ui/angular/v0_9';
import {A2uiSandboxConnection} from 'a2ui-bridge/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SurfaceComponent],
  template: `
    <main class="sandbox-shell">
      @if (sandbox.surfaceId()) {
        <a2ui-v09-surface [surfaceId]="sandbox.surfaceId()" />
      } @else {
        <p style="padding: 24px; color: #666; font-family: sans-serif; text-align: center;">
          Waiting for RENDER_A2UI payloads...
        </p>
      }
    </main>
  `,
})
export class AppComponent {
  protected sandbox = inject(A2uiSandboxConnection);
}
```

Note that contents of the `@else` can be modified as you see fit, but the rest
of the template should remain as-is.

### Step 2: Bootstrap your renderer application

Configure the standard Angular bootstrapping entrypoint file (`src/main.ts`),
passing your catalog classes dynamically to the sandbox provider mapping:

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideA2uiSandbox} from 'a2ui-bridge/angular';
import {BasicCatalog} from '@a2ui/angular/v0_9';

bootstrapApplication(AppComponent, {
  providers: [
    provideA2uiSandbox([BasicCatalog]), // Injects and exposes dynamic catalogs
  ],
}).catch((err) => console.error('A2UI Sandbox Bootstrap Failed:', err));
```

Make sure to replace `BasicCatalog` with your catalog.

NOTE on change detection compatibility: The `provideA2uiSandbox` helper is 100%
compatible with both standard Zone-based change detection (using `zone.js`) and
Zoneless change detection (`provideZonelessChangeDetection()`) out-of-the-box.

## Using React

### Bootstrap your renderer application

Use the `useA2uiSandbox` hook in your root component (e.g., `src/App.tsx`) to
manage the sandbox lifecycle and obtain the active surface model:

```ts
import {useA2uiSandbox} from 'a2ui-bridge/react';
import {A2uiSurface, basicCatalog} from '@a2ui/react/v0_9';

export function App() {
  const {surface} = useA2uiSandbox([basicCatalog]);

  return (
    <main className = "sandbox-shell" >
      {
        surface ?
          (<A2uiSurface surface = {surface}/>) :
          (<p>A2UI
        React Sandbox
        active
        . Waiting
        for RENDER_A2UI
        payloads...</p>)
      }
      < /main>
  );
}
```

Make sure to replace `basicCatalog` with your catalog.

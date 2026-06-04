---
trigger: glob
globs:
  - '**/*.ts'
  - '**/*.html'
  - '**/*.scss'
description: Guidelines for Angular development, covering component structure, templates, styles, and reactivity.
---

# Angular Development Guidelines

## Component Structure & Files

- HTML templates and SCSS stylesheets must be separated into their own files.
  They are NOT to be included inline in the `.ts` file.

## Reactivity & Templates

- Use modern Angular best practices:
  - Use signals instead of decorators for component inputs, outputs, queries,
    and state management where applicable.
  - Use the built-in control flow syntax (`@if`, `@for`, `@switch`) instead of
    structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`).

### Signals Reactivity

- Prefer `computed()` signals over component methods in templates for derived
  state.
- Do not use `effect()` to propagate state changes inside components or
  services; reserve `effect()` for external side effects (e.g. iframe
  postMessage, DOM updates, storage).
- Wrap any Signal write operations inside `effect()` with
  `untracked(() => { ... })` to avoid tracking cycles/deadlocks.
- Expose private writeable signals publicly as read-only signals using
  `asReadonly()`; the private writable signal should have the EXACT SAME name
  as the public read-only, except that it should start with a `_` character.
  E.g.,
  ```typescript
  private readonly _envMode: WritableSignal<EnvMode> = signal(EnvMode.STANDALONE);
  readonly envMode: Signal<EnvMode> = this._envMode.asReadonly();
  ```

### RxJS & Signals Boundaries

- Do not use `toObservable` on Signals for event streams (e.g. postMessage,
  WebSocket, event queues) to avoid event loss. Use RxJS `Subject` or
  `Observable` directly.
- Always unsubscribe from RxJS streams by piping `takeUntilDestroyed()`.
- Use RxJS `Subject` with `debounceTime(300)` and `distinctUntilChanged()` for
  user text inputs to throttle side effects.

### Zoneless State Mutation Safety

- Because of Zone-less change detection, templates must only bind to signals,
  computed derivations, or template-triggered events. Do not bind standard
  mutable class variables.
- Perform updates on signals immutably (e.g. using spread operators) to ensure
  change detection triggers.

## Naming

- Components should not have names that include the word "Component"
- Services should not have names that include the word "Service", unless there
  is no more appropriate way of naming it

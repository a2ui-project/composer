# React 0.10.2 CSS module repair

The published `@a2ui/react@0.10.2` bundle replaces its four CSS module maps with empty objects and ships unprocessed `:global(...)` selectors. Functional tests still pass, but headings, buttons, text fields, and choice pickers lose their styles. The current 0.11.1 archive has the same empty maps and also requires a broader web_core migration, so upgrading does not resolve this issue.

This version-pinned Yarn patch recompiles the four CSS sections already included in the package as CSS modules, restores their class-name maps in both ESM and CommonJS bundles, and exposes `@a2ui/react/v0_9/styles.css`. The React sample imports that stylesheet before the shared theme. No renderer behavior or schemas change.

The CSS was compiled with esbuild 0.28.1's `local-css` loader from the package's own `v0_9/index.css`; the four inputs are Text, Button, TextField, and ChoicePicker. Remove this patch and the custom stylesheet import when upgrading to an upstream release that ships working CSS modules and documents its stylesheet entry point. #119 real-renderer E2E checks assert the loaded font, primary button background, radius, and shared sample styling.

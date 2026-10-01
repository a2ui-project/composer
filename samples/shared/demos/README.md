# Sample renderer demos

The Angular, Lit, and React sample renderers all serve the same demos to the Composer demo wall, from this directory:

- **`NN_*.json`** are the four showcase demos, written by hand for these samples. They open the demo wall.
- **`demos.json`** is generated; don't edit it. It holds the four showcases followed by the 43 basic-catalog examples from the pinned `@a2ui/web_core` package, in the order the demo wall shows them.
- **`index.ts`** exports `demos.json` as `DEMOS`, typed as `Demo[]`. Each sample renderer imports it from here.

So the showcases are the only demos defined in this repository; the rest come from the A2UI specification's examples.

## The showcases

They use only standard A2UI v0.9 basic-catalog components and share the sample theme in `../basic-catalog.css`.

- **Flight status**: route, airport, departure, arrival, and gate information.
- **System dashboard**: a static health snapshot. CPU and memory charts are SVG images with accessible descriptions; the numbers do not represent live monitoring.
- **Product checkout**: editable shipping and billing fields. Place order emits a demo action with the current values; it does not purchase anything.
- **Optimization plan**: editable workflow checkboxes and a Start plan action carrying the selected steps.

The checkout photo uses the same public Unsplash image as the upstream basic-catalog examples and requires network access. The dashboard charts are embedded SVGs.

## Updating demos

Edit a showcase's JSON, then run `yarn generate:demos` from the repository root to rewrite `demos.json`. The numeric `NN_` prefix orders the showcases. The generator validates message schemas, basic-component properties, unique component IDs, and child references first. CI runs `yarn generate:demos:check`, which fails if `demos.json` is out of date.

During generation, a literal Text heading such as `{text: '# Title', variant: 'h1'}` becomes `{text: 'Title', variant: 'h1'}`, because heading variants render plain text. Only a leading Markdown marker that matches the explicit heading level is removed. Markdown body text, dynamic bindings, other hashes, and upstream source files remain unchanged. Run `node --test scripts/normalize-demo-headings.test.mjs` to verify this normalization.

Review changes in Angular, Lit, and React, including light and dark themes, narrow layouts, and any input or action bindings. The shell consumes the demos the renderer supplies and doesn't know their component types or content.

# Showcase demos

These four examples lead the sample renderer demo wall. They use only standard A2UI v0.9 basic-catalog components and share the sample theme in `../basic-catalog.css`.

- **Flight status**: route, airport, departure, arrival, and gate information.
- **System dashboard**: a static health snapshot. CPU and memory charts are SVG images with accessible descriptions; the numbers do not represent live monitoring.
- **Product checkout**: editable shipping and billing fields. Place order emits a demo action with the current values; it does not purchase anything.
- **Optimization plan**: editable workflow checkboxes and a Start plan action carrying the selected steps.

The checkout photo uses the same public Unsplash image as the upstream basic-catalog examples and requires network access. The dashboard charts are embedded SVGs.

## Updating examples

Edit the JSON source, then run `yarn generate:demos` from the repository root. Numeric `NN_` prefixes control ordering. The generator validates message schemas, basic-component properties, unique component IDs, and child references before writing all three renderer modules. The existing 43 examples from the pinned `@a2ui/web_core` dependency follow these four showcases.

During generation, a literal Text heading such as `{text: '# Title', variant: 'h1'}` becomes `{text: 'Title', variant: 'h1'}` because heading variants render plain text. Only a leading Markdown marker that matches the explicit heading level is removed. Markdown body text, dynamic bindings, other hashes, and upstream source files remain unchanged. Run `node --test scripts/normalize-demo-headings.test.mjs` to verify this normalization.

Run `yarn generate:demos:check` to catch drift. Review the result in Angular, Lit, and React, including light/dark themes, narrow layouts, and any input or action bindings. The shell consumes renderer-supplied demos and does not know their component types or content.

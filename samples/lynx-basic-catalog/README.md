# Lynx Sample A2UI Composer Integration

This renderer uses Lynx for Web inside the Composer preview iframe and emits a
native Lynx bundle from the same ReactLynx source. Run `yarn build` to produce:

- `dist/a2ui.web.js`, loaded by the browser's `<lynx-view>`.
- `dist/a2ui.lynx.js`, downloadable for a Lynx mobile host.

The first release intentionally keeps mobile delivery artifact-based. Device
discovery, QR codes, and live cross-device synchronization are outside this
sample's scope.

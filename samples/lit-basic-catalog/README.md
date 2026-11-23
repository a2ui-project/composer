# Lit Sample A2UI Composer Integration

Sample application showing how to integrate Lit-based renderers (for the basic
catalog) into the A2UI Composer. Supports both A2UI v1.0 (default) and A2UI v0.9
payloads.

- Every message must include `version` (`"v0.9"` or `"1.0"`).
- Accepted v0.9 basic catalog IDs:
  `https://a2ui.org/specification/v0_9/basic_catalog.json` and
  `https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json`.

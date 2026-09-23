# Angular Basic with MCP Sample A2UI Composer Integration

Sample application demonstrating how to integrate Angular-based renderers for the
`basic_with_mcp` catalog into the A2UI Composer.

## Catalog Composition

This sample combines two catalogs:

- **Components**: Standard UI components from `@a2ui/angular/v0_9` (`BasicCatalog`).
- **Functions**: MCP tool execution and data transformation functions (`createMcpCatalogFunctions`).

## Upstream MCP Package Status

The MCP catalog functions are currently vendored in `bridge/src/mcp/` and
re-exported through `a2ui-bridge` because `@a2ui/mcp-catalog` has not yet been
published to NPM.

Once `@a2ui/mcp-catalog` is published:

1. Add `@a2ui/mcp-catalog` to `package.json`.
2. Update `src/app/basic-with-mcp.catalog.ts` to import `createMcpCatalogFunctions`
   directly from `@a2ui/mcp-catalog/v0_9`.

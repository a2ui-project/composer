# Vendored A2UI MCP Catalog

This directory contains vendored TypeScript source files from the upstream
`@a2ui/mcp-catalog` package (version `v0_9`).

## Summary

The upstream package `@a2ui/mcp-catalog` is not yet published to the NPM registry
and remains private within the A2UI repository. Composer requires the MCP catalog
functions to support Model Context Protocol (MCP) tool execution and dynamic data
transformations in preview surfaces.

To unblock Composer development without waiting for the upstream release, we
vendor the catalog source files into this isolated directory. Once the upstream
package is published to NPM, remove this directory and reference the official
NPM package.

## Scope and Non-Scope

- **Scope**: Catalog function implementations, schemas, dynamic expression
  resolvers, and unit tests adhering to the A2UI MCP catalog specification.
- **Non-Scope**: Composer bridge infrastructure and iframe communication. The
  `IframeMcpClient` class resides in `bridge/src/iframe-mcp-client.ts`, outside
  this directory.

## File Inventory and Upstream Mapping

The following table maps each vendored file in this directory to its upstream
source in `a2ui/catalogs/mcp/v0_9/`:

| Local Path                     | Upstream Source                    | Description                                                                  |
| :----------------------------- | :--------------------------------- | :--------------------------------------------------------------------------- |
| `index.ts`                     | `src/index.ts`                     | Catalog function factory (`createMcpCatalogFunctions`) and catalog constants |
| `dynamic-values.ts`            | `src/dynamic-values.ts`            | Recursive resolution of data bindings and dynamic function calls             |
| `functions/callMcpTool.ts`     | `src/functions/callMcpTool.ts`     | MCP tool execution function and UI resource extractor                        |
| `functions/common.ts`          | `src/functions/common.ts`          | Schema helpers and Promise settling utilities                                |
| `functions/jmespath.ts`        | `src/functions/jmespath.ts`        | JMESPath query evaluation function                                           |
| `functions/regexCapture.ts`    | `src/functions/regexCapture.ts`    | RE2 regular expression capture group extractor                               |
| `functions/regexReplace.ts`    | `src/functions/regexReplace.ts`    | RE2 regular expression replacement function                                  |
| `functions/split.ts`           | `src/functions/split.ts`           | String delimiter split function                                              |
| `functions/updateDataModel.ts` | `src/functions/updateDataModel.ts` | Surface data model mutation function                                         |
| `mcp.spec.ts`                  | `src/**/*.test.ts`                 | Vitest test suite adapted from upstream unit tests                           |

## Temporary Dependencies

The `bridge/package.json` file includes several dependencies solely to support
these vendored files:

- `@modelcontextprotocol/sdk`: MCP client type definitions and result schemas.
- `jmespath`: Query engine for the `jmespath` catalog function.
- `re2js`: Linear-time regular expression engine for `regexCapture` and `regexReplace`.
- `zod`: Runtime schema validation for function signatures.
- `@types/jmespath`: TypeScript definitions for JMESPath.

## Migration Steps

Follow these steps to replace this vendored directory once `@a2ui/mcp-catalog`
is published to NPM:

1. Add `@a2ui/mcp-catalog` to `bridge/package.json`:

   ```bash
   yarn workspace a2ui-bridge add @a2ui/mcp-catalog
   ```

2. Remove temporary dependencies from `bridge/package.json`:

   Remove `jmespath`, `re2js`, `zod`, `@types/jmespath`, and
   `@modelcontextprotocol/sdk` (unless required elsewhere in `a2ui-bridge`).

3. Update `bridge/src/index.ts` to re-export from the NPM package:

   ```typescript
   export * from '@a2ui/mcp-catalog/v0_9';
   export * from './iframe-mcp-client.js';
   ```

4. Delete this directory:

   ```bash
   rm -rf bridge/src/mcp
   ```

5. Update `samples/ng-basic-with-mcp-catalog`:

   - Add `@a2ui/mcp-catalog` to `samples/ng-basic-with-mcp-catalog/package.json`.
   - In `samples/ng-basic-with-mcp-catalog/src/app/basic-with-mcp.catalog.ts`,
     replace the import from `a2ui-bridge` with `@a2ui/mcp-catalog/v0_9`.

6. Run the test suite and linter to verify the migration:

   ```bash
   yarn test
   yarn lint
   ```

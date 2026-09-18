# React Slack Catalog Renderer

Credential-free React sample renderer that previews A2UI surfaces as Slack
message Block Kit. It registers the catalog ID
`https://a2ui-project.github.io/composer/catalogs/slack/v1`, exposes Gallery
usages for the supported Slack-oriented components, and renders the active
Composer surface through the standard `a2uiBridge.attachRenderer` API.

## Start locally

Run from the repository root with Node 24 and Corepack on `PATH`:

```bash
corepack yarn install --immutable
corepack yarn workspace a2ui-bridge build
corepack yarn workspace react-slack-catalog start
```

The renderer starts on `http://localhost:3459`. Start Composer separately:

```bash
corepack yarn --cwd shell start
```

Register the renderer in Composer Settings as `http://localhost:3459`, select
the built-in `Slack Block Kit Preview` renderer profile, or open Composer with
the query parameter:

```text
http://localhost:4200/?renderer=http://localhost:3459
```

Localhost renderer origins are allowed by the shell startup flow. The Slack
renderer does not use Slack credentials, a Slack app, or a live agent endpoint.

For assistant-driven generation and refinement, configure a valid Gemini API key
through the normal Composer Settings flow. The Playwright happy-path tests use a
deterministic Gemini fixture so local and CI runs are repeatable; that fixture is
not live Gemini.

## Review in Composer

Composer supports the Slack sample through the Components Gallery, the workspace
A2UI editor, and the assistant when the Slack renderer is selected.

### Assistant workflow

1. Open Composer with the built-in Slack renderer profile or a registered Slack
   renderer URL.
2. Confirm the Slack catalog handshake finishes. The built-in profile starts with
   the same Book a Car form as the basic renderers, using native Slack controls.
   Custom renderer URLs without a starter retain the read-only example preview.
3. Ask the assistant to generate a Slack message.
4. Review the live Slack preview, then ask the assistant to refine the message.
5. Expand `Generated Block Kit` or use `Copy Block Kit` to inspect or copy the
   Slack export produced from the same rendered snapshot.

### Book a Car form

The built-in Slack profiles load `/examples/car-booking.json` as their starter.
Enter a pick-up location and two dates, then select **Search Cars**. Composer
receives the same `searchCars` A2UI event as the basic renderer, with the current
field values. The sample demonstrates form authoring and events; it does not
book a car or contact a rental service.

`TextField` maps to a Slack `plain_text_input`, and date-only `DateTimeInput`
maps to `datepicker`. Values use writable data bindings such as
`{"path":"/booking/location"}`. Edits update the preview's data model and the
exported Block Kit; subsequent assistant/canvas changes refresh the controls.
Only short/long text and date-only inputs are supported. Password fields, time
inputs, and date constraints are rejected instead of being silently changed.

### Gallery Button workflow

1. Open Composer with the Slack renderer URL.
2. Open Components Gallery and choose `Button`.
3. Confirm the preview shows `Ready for review` and an `Acknowledge` button.
4. Edit the example properties or expand `Example JSON` to change the message.
5. Select `Open in Composer` to continue with the same surface and Slack renderer
   in the workspace. Refine it with the assistant or the A2UI editor.

The Button example includes `createSurface`, `updateDataModel`, and
`updateComponents` messages. Its data model provides `/greeting` and
`/record/id`, and the button action resolves `recordId` before dispatch.

### Gallery MarketSnapshot workflow

1. Open Components Gallery and choose `MarketSnapshot`.
2. Confirm the preview shows the sample energy market headline and three market
   rows.
3. Edit the example, then select `Open in Composer` to continue in the workspace.

The fixture data is illustrative example data. The sample does not fetch live
market data.

### Gallery Table workflow

1. Open Components Gallery and choose `Table`.
2. Review the illustrative 2022 World Cup final scores, with team, goals, and
   result aligned in three columns.
3. Edit the column headers, alignment, or body rows, then select
   `Open in Composer` to continue in the workspace.

Use `Table` when asking the assistant for scores, rankings, or comparisons.
`Row` flattens its children into sequential Slack blocks and does not preserve
table columns. The example is historical illustration; the renderer does not
fetch current sports results.

Each `columns` entry contains a `header` and optional `align` (`left`, `center`,
or `right`). `rows` contains arrays of cells in the same order, with exactly one
cell per column. Headers and cells accept literal strings, data bindings such
as `{"path":"/teams/0/name"}`, or supported string-returning functions.
Tables support 1–20 columns and 1–99 body rows, plus the header row. Resolved
cells must stay within 2,000 characters each and the message's existing 10,000
character aggregate limit.
Wide tables scroll horizontally inside the message preview, keeping the surrounding
message and export controls within narrow Composer panels.

### Raw editor workflow

Complete example message arrays are also served by the renderer:

- `/examples/car-booking.json`
- `/examples/data-bound-action.json`
- `/examples/market-snapshot.json`

With the dev server running, fetch one of those files from
`http://localhost:3459/examples/...`, paste the JSON into the workspace A2UI
editor, and edit literals or data bindings directly. The preview and the
expanded `Generated Block Kit` JSON are produced from the same renderer
snapshot.

Demo-wall integration remains future work for the Composer Gallery after the
separate demo API work lands.

## Supported Slack mappings

| A2UI component   | Slack output                                            | Notes                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Text`           | Header, section, or context block                       | Heading variants render as Slack headers; non-`h1` heading variants produce approximation warnings. `caption` renders as context.                                                |
| `Image`          | Slack image block                                       | Requires an HTTP(S) `url` with a host and `description` for Slack alt text. `fit` and `variant` are accepted but approximated because Slack does not preserve those style hints. |
| `Divider`        | Slack divider block                                     | Only horizontal dividers are supported. Vertical dividers are rejected by the catalog schema.                                                                                    |
| `Row`            | Flattened child blocks                                  | Slack does not preserve row layout hints. Use `Table` for aligned data. Rows containing only buttons render as an actions block.                                                 |
| `Column`         | Flattened child blocks                                  | Slack does not preserve column layout hints. Columns containing only buttons render as an actions block.                                                                         |
| `Card`           | Flattened child                                         | Slack does not render card containers, so the child is emitted without a card frame.                                                                                             |
| `Button`         | Slack button in an actions block                        | Labels are collected from supported `Text` children. `primary` maps to Slack primary style.                                                                                      |
| `TextField`      | Slack input block with `plain_text_input`               | Writable data binding; `shortText` or `longText`.                                                                                                                                |
| `DateTimeInput`  | Slack input block with `datepicker`                     | Writable data binding; date only, in `YYYY-MM-DD` format.                                                                                                                        |
| `Table`          | Slack table block                                       | Aligned headers and body cells, including data bindings. Supports 1–20 columns and 1–99 body rows with matching cell counts.                                                     |
| `MarketSnapshot` | Header, summary, table, context, and acknowledge button | Custom sample component with exactly three market rows, source links, `whyItMatters`, and `searchedAt`.                                                                          |

Unsupported components, invalid props, catalog mismatches, expression failures,
component cycles, and Slack output limit failures show diagnostics and clear the
stale preview/export/actions until a valid update arrives. Missing child
components put the preview in a waiting state and recover when the child arrives.

## Actions

Slack buttons use opaque revision-local action IDs like
`a2ui-<revision>-<ordinal>`. IDs are regenerated on each accepted update; stale
IDs become inert after replacement, deletion, or recreation.

Native Slack button clicks and the Tightknit `Simulate` control both call the
same local renderer dispatch path. Event actions resolve against the current
live A2UI surface and are delivered back to Composer as local Composer events
through `a2uiBridge.sendAction`. They are not sent to Slack.

Read-only local function actions, such as `formatString`, are evaluated
synchronously with `dataContext.resolveAction`. They do not send bridge server
events and do not imply a data-model notification unless a future custom
mutating function explicitly writes data. Unsupported functions and expression
failures are shown as preview diagnostics.

## Generated Block Kit

When the preview is ready, the `Generated Block Kit` section contains:

```json
{
  "blocks": []
}
```

with the current Slack blocks in place of the empty array. `Copy Block Kit`
copies the same JSON. If iframe clipboard access is unavailable, the JSON
remains selectable in the expanded section.

## Static hosting

With Node 24 and Corepack on `PATH`, build the static renderer assets with:

```bash
corepack yarn workspace a2ui-bridge build
corepack yarn workspace react-slack-catalog build
```

The output is `samples/react-slack-catalog/dist`. It includes the public example
JSON files and `THIRD_PARTY_NOTICES.md`. Serve `dist` with any static host and
register that hosted URL as the Composer renderer URL. For a local production
asset smoke:

```bash
corepack yarn workspace react-slack-catalog preview --host 127.0.0.1 --port 4459
```

Then register `http://127.0.0.1:4459` in Composer. If a host rewrites `/render`
to this same static app, that `/render` entry is credential-free; it only serves
the renderer bundle and participates in the Composer iframe bridge.

The Vite config uses a relative asset base, so the built bundle can be hosted
under a path prefix as long as the host serves `index.html` and static assets
from the same directory.

## Attribution and vendor-removal path

This sample adapts Slack lowering ideas from CopilotKit channel playground code
under the MIT license. The full notice is in `THIRD_PARTY_NOTICES.md` and is
copied into `dist`.

The sample keeps the Slack lowerers local today because the published packages
do not expose an equivalent persistent-surface lowering API. When CopilotKit
publishes that API, replace the local lowerer and action registry with the
vendor API, keep this README's behavior contract, and remove the adapted source
notice once no adapted source remains.

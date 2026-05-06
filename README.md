# Chartai MCP

Setup helper for Chartai's remote MCP server.

This beta package defaults to Chartai staging:

- MCP: `https://mcp-staging.chartai.live/mcp`
- Web/key page: `https://test.chartai.live/app/keys`

## Install From GitHub

```bash
npx github:chartai-official/chartai-mcp config
```

Or install globally:

```bash
npm install -g github:chartai-official/chartai-mcp
chartai-mcp config
```

## Agent Key

```bash
chartai-mcp connect
export CHARTAI_AGENT_KEY="..."
```

The default config references `${CHARTAI_AGENT_KEY}` and does not print the raw
key:

```json
{
  "mcpServers": {
    "chartai": {
      "url": "https://mcp-staging.chartai.live/mcp",
      "headers": {
        "Authorization": "Bearer ${CHARTAI_AGENT_KEY}"
      }
    }
  }
}
```

Use `--inline-key` only for local private config files, never for shared logs.

## Tools

The remote MCP server exposes Composable Chart Context tools including
capabilities, symbol search, scans, records, context manifests, visual
confirmation, chart packages, supplemental indicator facts, watchlist,
monitors, feed, and usage.

Use `chartai_inspect_chart_context` as the default tool after a scan. It exposes
the visual-first Chart Context inspection path: native Core chart first,
structured Evidence Modules and Recipes second, then optional indicator and
price-volume facts. The default chart is the native 1920x1080 inspection image
with a visible VC code; do not request a resized chart unless the agent
explicitly needs a different size. If the runtime can see the image, call
`chartai_confirm_chart_visual_inspection`; if not, report `visual_unverified`.

Use `chartai_get_context_manifest` when a client needs to negotiate supported
modules, recipes, image delivery, and fallback states before pulling the full
inspection payload.

Compatibility tools such as `chartai_get_context` and `chartai_get_chart`
remain available for older clients and explicit low-level access.

Chartai returns chart facts and Chart Context. It does not execute trades.

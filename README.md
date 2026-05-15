# Chartai MCP

Setup helper for Chartai's remote MCP server.

Default endpoints:

- MCP: `https://mcp.chartai.live/mcp`
- Web/key page: `https://chartai.live/app/keys`

Use **subscription** only for Chartai billing plans and renewals. Durable agent
workflows are **watchlists**, **monitors**, and **feed**.

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
      "url": "https://mcp.chartai.live/mcp",
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
confirmation, chart packages, context-bound OHLCV, agent chart rendering,
supplemental indicator facts, watchlist, monitors, feed, and usage.

Use `chartai_inspect_chart_context` as the default tool after
`chartai_scan_contexts`. It exposes the visual-first Chart Context inspection
path: native Chartai chart first, structured Evidence Modules and Recipes
second, then optional indicator and price-volume facts. The default chart is the
native 1920x1080 inspection image
with a visible VC code. Do not request a resized chart unless the agent
explicitly needs a different size. If the runtime can see the image, call
`chartai_confirm_chart_visual_inspection`. If not, report `visual_unverified`.

Use `chartai_get_context_manifest` when a client needs to negotiate supported
modules, recipes, image delivery, and fallback states before pulling the full
inspection payload.

Use `chartai_get_context_ohlcv` after a context is selected when an agent needs
the candles behind that context's chart window. Pass `window: "wide"` for wider
data-only context around the same Chart Context. Treat it as evidence attached
to the Chart Context, not as a general price-feed tool.

Use `chartai_render_agent_chart` when an agent has its own live thesis and
needs Chartai to render a persistent TradingView-based chart from a
Chartai-supported `symbol`, `interval`, focus `range`, optional source context
id, structured overlays, and optional studies. This action requires Pro, and each
accepted request uses 5 Chart Context units. Include the context id to keep
the original pattern shape. Chartai may add safety margin around the focus range
so labels and source pattern shapes are not clipped. Send retest
support/resistance areas as zones, or as two-price Retest support/resistance
overlays; use Dynamic/Trendline labels only for sloped lines. Do not upload
OHLCV. The agent may analyze Bybit or another exchange feed independently, then
pass only the TradingView render source and levels/drawings that should appear
on the chart.

Use `chartai_get_context` and `chartai_get_chart` only for explicit low-level
access after a context has already been selected. Pass
`variant: "original"` to `chartai_get_chart` when the agent needs the persistent
clean chart variant with only wider-context candles, Volume, and pattern geometry.

Use `chartai_search_symbols` or `chartai_resolve_symbol` before scanning user
tickers. Chartai normalizes crypto, US stock, and forex/metals aliases into
provider canonical symbols such as `BINANCE:TRXUSDT`, `AAPL.US`, and
`OANDA:EUR_USD`. Symbol discovery means Chartai can normalize the symbol;
`chartai_scan_contexts` returns current contexts only when a ready native chart
exists for that symbol/timeframe. No ready context? Chartai can queue a fresh
scan; wait, then retry the same query.
`chartai_search_symbols` is paginated across crypto, US stocks, and
forex/metals. If the response has `has_more=true`, call it again with
`cursor=<next_cursor>` until `has_more=false`. Do not treat the first 100
results as the full catalog.
`chartai_list_feed` is also paginated; keep calling it with
`cursor=<next_cursor>` until `has_more=false`.

Agent flow: use `chartai_scan_contexts` to find current Chart Context, then use
`chartai_inspect_chart_context` before making a judgment. Keep the returned
`context_id` as the decision evidence ID. Use `chartai_get_record` and
`chartai_search_records` with `detection_id` only when you need historical
lifecycle records. Monitor/feed tools are for durable watch workflows.

Agent-facing tool errors include `guidance`; follow `guidance.next_actions`
before changing symbols, timeframes, ids, or tool names. Do not guess a fallback
query.

Chartai returns chart facts and Chart Context. It does not execute trades.

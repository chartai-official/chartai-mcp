#!/usr/bin/env node

const DEFAULT_MCP_URL = "https://mcp-staging.chartai.live/mcp";
const DEFAULT_WEB_BASE = "https://test.chartai.live";

function usage() {
  return `Chartai MCP setup helper (agent beta)

Usage:
  chartai-mcp config
  chartai-mcp cursor
  chartai-mcp claude
  chartai-mcp codex
  chartai-mcp connect
  chartai-mcp status

Options:
  --mcp-url <url>       Default: ${DEFAULT_MCP_URL}
  --web-base <url>      Default: ${DEFAULT_WEB_BASE}
  --inline-key          Inline CHARTAI_AGENT_KEY into config. Avoid in shared logs.
  --help, -h

Default config references \${CHARTAI_AGENT_KEY}; it does not print the raw key.

Use "subscription" only for Chartai billing plans and renewals. Durable agent workflows are watchlists, monitors, and feed.
`;
}

function parse(argv) {
  const opts = {};
  const args = [];
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    const read = (name) => {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) throw new Error(`${name} requires a value.`);
      i += 1;
      return value;
    };
    if (item === "--mcp-url") opts.mcpUrl = read(item);
    else if (item === "--web-base") opts.webBase = read(item);
    else if (item === "--inline-key") opts.inlineKey = true;
    else if (item === "--help" || item === "-h") opts.help = true;
    else if (item.startsWith("--")) throw new Error(`Unknown option: ${item}`);
    else args.push(item);
  }
  return { command: args[0] || "help", opts };
}

function mcpUrl(opts) {
  return opts.mcpUrl || process.env.CHARTAI_MCP_URL || DEFAULT_MCP_URL;
}

function webBase(opts) {
  return (opts.webBase || process.env.CHARTAI_WEB_URL || DEFAULT_WEB_BASE).replace(/\/+$/, "");
}

function apiBase(opts) {
  const fromEnv = (process.env.CHARTAI_API_BASE_URL || "").trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const base = webBase(opts);
  if (base === "https://test.chartai.live") return "https://api.test.chartai.live";
  if (base === "https://chartai.live") return "https://api.chartai.live";
  return base;
}

function authValue(opts) {
  if (!opts.inlineKey) return "Bearer ${CHARTAI_AGENT_KEY}";
  const key = (process.env.CHARTAI_AGENT_KEY || process.env.CHARTAI_API_KEY || "").trim();
  if (!key) throw new Error("CHARTAI_AGENT_KEY is required when --inline-key is used.");
  return `Bearer ${key}`;
}

function mcpConfig(opts) {
  return {
    mcpServers: {
      chartai: {
        url: mcpUrl(opts),
        headers: {
          Authorization: authValue(opts)
        }
      }
    }
  };
}

function printJson(data) {
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}

async function run({ command, opts }) {
  if (opts.help || command === "help") {
    process.stdout.write(usage());
    return;
  }
  if (command === "config" || command === "cursor" || command === "claude" || command === "codex") {
    printJson(mcpConfig(opts));
    return;
  }
  if (command === "connect") {
    const url = new URL(`${webBase(opts)}/connect`);
    url.searchParams.set("target", "mcp");
    printJson({
      connect_url: url.toString(),
      env: "CHARTAI_AGENT_KEY",
      flow: "manual_web_agent_key",
      next: [
        "Open connect_url in a browser.",
        "Register or log in, verify email, and pay or renew in Chartai Web if needed.",
        "Create or copy an Agent Key in Chartai Web.",
        "Set CHARTAI_AGENT_KEY in the MCP client environment.",
        "Install the JSON from `chartai-mcp config`."
      ]
    });
    return;
  }
  if (command === "status") {
    const response = await fetch(`${apiBase(opts)}/api/v1/status`);
    const data = await response.json();
    printJson(data);
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

run(parse(process.argv.slice(2))).catch((error) => {
  process.stderr.write(`chartai-mcp: ${error.message}\n`);
  process.exit(1);
});

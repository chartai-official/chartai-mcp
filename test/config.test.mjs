import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("config prints MCP server JSON without raw key", () => {
  const result = spawnSync("node", ["bin/chartai-mcp.mjs", "config"], {
    encoding: "utf8",
    env: { ...process.env, CHARTAI_AGENT_KEY: "should-not-print" }
  });
  assert.equal(result.status, 0);
  const json = JSON.parse(result.stdout);
  assert.equal(json.mcpServers.chartai.url, "https://mcp.chartai.live/mcp");
  assert.equal(json.mcpServers.chartai.headers.Authorization, "Bearer ${CHARTAI_AGENT_KEY}");
});

test("connect prints onboarding URL", () => {
  const result = spawnSync("node", ["bin/chartai-mcp.mjs", "connect"], {
    encoding: "utf8"
  });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /connect_url/);
  assert.match(result.stdout, /target=mcp/);
});

test("inline key ignores old CHARTAI_API_KEY env", () => {
  const result = spawnSync("node", ["bin/chartai-mcp.mjs", "config", "--inline-key"], {
    encoding: "utf8",
    env: { ...process.env, CHARTAI_AGENT_KEY: "", CHARTAI_API_KEY: "cak_old" }
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CHARTAI_AGENT_KEY is required/);
});

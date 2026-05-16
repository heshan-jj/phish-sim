import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  appendPlatformLog,
  inferLogLevel,
  listPlatformLogs,
  parseDockerLogLine,
} from "@/lib/platform-logs";

describe("inferLogLevel", () => {
  it("maps failures to ERROR", () => {
    assert.equal(inferLogLevel("Agent routing failed", { httpOk: false }), "ERROR");
    assert.equal(inferLogLevel("something failed badly"), "ERROR");
  });

  it("maps fallback to WARNING", () => {
    assert.equal(inferLogLevel("using MiniMax fallback"), "WARNING");
  });
});

describe("listPlatformLogs", () => {
  it("filters by level", () => {
    appendPlatformLog({ level: "INFO", source: "test", message: "ok" });
    appendPlatformLog({ level: "ERROR", source: "test", message: "bad" });

    const errors = listPlatformLogs("ERROR");
    assert.ok(errors.some((row) => row.message === "bad"));
    assert.ok(!errors.some((row) => row.message === "ok"));
  });
});

describe("parseDockerLogLine", () => {
  it("parses standard log levels", () => {
    const row = parseDockerLogLine(
      "2026-05-17T10:00:00Z ERROR nasiko-router Agent routing failed",
    );
    assert.ok(row);
    assert.equal(row.level, "ERROR");
    assert.match(row.message, /Agent routing failed/);
  });
});

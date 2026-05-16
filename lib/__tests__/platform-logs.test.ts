import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  appendPlatformLog,
  clearPlatformLogs,
  getPlatformLogCounts,
  getPlatformLogSources,
  importDockerLogText,
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

describe("getPlatformLogCounts", () => {
  it("returns counts by level", () => {
    clearPlatformLogs();
    appendPlatformLog({ level: "INFO", source: "a", message: "one" });
    appendPlatformLog({ level: "WARNING", source: "b", message: "two" });
    appendPlatformLog({ level: "ERROR", source: "c", message: "three" });

    const counts = getPlatformLogCounts();
    assert.equal(counts.INFO, 1);
    assert.equal(counts.WARNING, 1);
    assert.equal(counts.ERROR, 1);
  });
});

describe("getPlatformLogSources", () => {
  it("returns sorted unique sources", () => {
    clearPlatformLogs();
    appendPlatformLog({ level: "INFO", source: "zebra", message: "z" });
    appendPlatformLog({ level: "INFO", source: "alpha", message: "a" });
    appendPlatformLog({ level: "INFO", source: "alpha", message: "a2" });

    assert.deepEqual(getPlatformLogSources(), ["alpha", "zebra"]);
  });
});

describe("clearPlatformLogs", () => {
  it("removes all entries", () => {
    appendPlatformLog({ level: "INFO", source: "test", message: "x" });
    clearPlatformLogs();
    assert.equal(listPlatformLogs("ALL").length, 0);
  });
});

describe("importDockerLogText", () => {
  it("imports parseable lines", () => {
    clearPlatformLogs();
    const imported = importDockerLogText(
      "2026-05-17T10:00:00Z ERROR nasiko-router Agent routing failed\n\n",
    );
    assert.equal(imported, 1);
    assert.ok(
      listPlatformLogs("ERROR").some((r) => r.message.includes("Agent routing")),
    );
  });
});

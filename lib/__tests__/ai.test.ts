import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractJson, findFirstJsonObject } from "@/lib/ai";
import { orgContextToCompanyContext, toAiDifficulty } from "@/lib/org-context";

describe("extractJson", () => {
  it("parses raw JSON", () => {
    const result = extractJson('{"a":1}');
    assert.deepEqual(result, { a: 1 });
  });

  it("parses fenced JSON", () => {
    const result = extractJson('```json\n{"b":2}\n```');
    assert.deepEqual(result, { b: 2 });
  });

  it("extracts JSON from prose wrapper", () => {
    const result = extractJson('Here is output: {"c":3} thanks');
    assert.deepEqual(result, { c: 3 });
  });
});

describe("findFirstJsonObject", () => {
  it("returns null when no object", () => {
    assert.equal(findFirstJsonObject("no json"), null);
  });
});

describe("orgContextToCompanyContext", () => {
  it("maps onboarding fields", () => {
    const ctx = orgContextToCompanyContext({
      vendors: "Slack",
      terminology: "Hub",
      events: "Launch",
      orgStructure: "500 staff",
    });
    assert.equal(ctx.vendors, "Slack");
    assert.equal(ctx.internalTerms, "Hub");
    assert.equal(ctx.recentEvents, "Launch");
  });
});

describe("toAiDifficulty", () => {
  it("normalizes title case", () => {
    assert.equal(toAiDifficulty("Hard"), "hard");
    assert.equal(toAiDifficulty("easy"), "easy");
  });
});

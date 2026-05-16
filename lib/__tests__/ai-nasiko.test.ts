import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildNasikoA2aPayload,
  extractNasikoAgentResponse,
  getAiProvider,
  parseNasikoRouterStream,
} from "@/lib/ai-nasiko";

describe("parseNasikoRouterStream", () => {
  it("returns the last non-intermediate message", () => {
    const body = [
      '{"message":"Processing...","is_int_response":true}',
      '{"message":"Agent selected","is_int_response":true}',
      '{"message":"{\\"subject\\":\\"Hi\\"}","is_int_response":false}',
    ].join("\n");

    const result = parseNasikoRouterStream(body);
    assert.equal(result, '{"subject":"Hi"}');
  });

  it("throws when no final message", () => {
    assert.throws(
      () =>
        parseNasikoRouterStream(
          '{"message":"Processing","is_int_response":true}',
        ),
      /No final agent message/,
    );
  });
});

describe("extractNasikoAgentResponse", () => {
  it("extracts text from a message result", () => {
    const text = extractNasikoAgentResponse({
      result: {
        kind: "message",
        parts: [{ kind: "text", text: '{"subject":"Hi"}' }],
      },
    });
    assert.equal(text, '{"subject":"Hi"}');
  });

  it("extracts text from the last task artifact", () => {
    const text = extractNasikoAgentResponse({
      result: {
        kind: "task",
        artifacts: [
          { parts: [{ kind: "text", text: "draft" }] },
          { parts: [{ kind: "text", text: "final" }] },
        ],
      },
    });
    assert.equal(text, "final");
  });
});

describe("buildNasikoA2aPayload", () => {
  it("uses message/send JSON-RPC", () => {
    const payload = buildNasikoA2aPayload("sess-1", "hello");
    assert.equal(payload.method, "message/send");
    assert.equal(payload.id, "sess-1");
    const params = payload.params as {
      message: { parts: { text: string }[] };
    };
    assert.equal(params.message.parts[0]?.text, "hello");
  });
});

describe("getAiProvider", () => {
  it("defaults to minimax", () => {
    const prev = process.env.AI_PROVIDER;
    delete process.env.AI_PROVIDER;
    assert.equal(getAiProvider(), "minimax");
    if (prev !== undefined) process.env.AI_PROVIDER = prev;
  });

  it("reads nasiko when set", () => {
    const prev = process.env.AI_PROVIDER;
    process.env.AI_PROVIDER = "nasiko";
    assert.equal(getAiProvider(), "nasiko");
    if (prev !== undefined) process.env.AI_PROVIDER = prev;
    else delete process.env.AI_PROVIDER;
  });
});

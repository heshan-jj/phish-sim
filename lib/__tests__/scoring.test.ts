import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateRiskScore, getRiskTier } from "@/lib/scoring";
import type { CampaignEvent, CampaignEventAction } from "@/types";

function event(action: CampaignEventAction): CampaignEvent {
  return {
    id: "",
    campaignId: "",
    employeeId: "",
    action,
    metadata: {},
    ip: null,
    userAgent: null,
    createdAt: new Date(),
  };
}

describe("calculateRiskScore", () => {
  it("penalizes credentials_submitted like a credential attempt", () => {
    assert.equal(calculateRiskScore([event("credentials_submitted")]), 50);
  });

  it("combines opened, clicked, and credentials_submitted penalties", () => {
    const score = calculateRiskScore([
      event("email_opened"),
      event("link_clicked"),
      event("credentials_submitted"),
    ]);

    assert.equal(score, 25);
  });

  it("applies the call and credential penalty to credentials_submitted", () => {
    const score = calculateRiskScore([
      event("call_answered"),
      event("credentials_submitted"),
    ]);

    assert.equal(score, 40);
  });

  it("keeps opened, clicked, reported credential submissions in the at-risk band", () => {
    const score = calculateRiskScore([
      event("email_opened"),
      event("link_clicked"),
      event("reported"),
      event("credentials_submitted"),
    ]);

    assert.equal(score, 50);
  });
});

describe("getRiskTier", () => {
  it("floors credential failures from champion to at-risk", () => {
    assert.equal(getRiskTier(75, [event("credentials_submitted")]), "at-risk");
  });

  it("keeps reported credential failures at-risk instead of champion", () => {
    const events = [event("reported"), event("credentials_submitted")];
    const score = calculateRiskScore(events);

    assert.equal(score, 75);
    assert.equal(getRiskTier(score, events), "at-risk");
  });
});

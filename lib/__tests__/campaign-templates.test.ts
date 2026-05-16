import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAMPAIGN_TEMPLATES,
  renderGeneratedCampaignEmail,
} from "@/lib/campaign-templates";

const template = CAMPAIGN_TEMPLATES[0]!;

describe("renderGeneratedCampaignEmail", () => {
  it("wraps generated AI copy in the campaign email shell", () => {
    const html = renderGeneratedCampaignEmail({
      template,
      placeholders: {
        firstName: "Alex",
        lastName: "Taylor",
        department: "Finance",
        employeeId: "emp-1",
        employeeEmail: "alex@example.com",
        companyName: "Example Co",
        variation: "Location: Toronto, Canada",
      },
      actionUrl: "https://training.example/login",
      subject: "Please review this alert",
      body: "Hi {{firstName}},\n\nPlease review the sign-in alert.",
    });

    assert.match(html, /<!doctype html>/i);
    assert.match(html, /Example Co/);
    assert.match(html, /Please review this alert/);
    assert.match(html, /Hi Alex/);
    assert.match(html, /href="https:\/\/training\.example\/login"/);
    assert.match(html, /Verify Account/);
  });
});

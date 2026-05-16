import { pgEnum } from "drizzle-orm/pg-core";

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "active",
  "complete",
]);

export const campaignEventActionEnum = pgEnum("campaign_event_action", [
  "sent",
  "email_opened",
  "link_clicked",
  "credential_attempted",
  "reported",
  "call_answered",
  "call_hung_up",
]);

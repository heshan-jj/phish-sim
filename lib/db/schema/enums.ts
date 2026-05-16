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
  "landing_page_viewed",
  "credential_attempted",
  "credentials_submitted",
  "training_viewed",
  "reported",
  "call_answered",
  "call_hung_up",
]);

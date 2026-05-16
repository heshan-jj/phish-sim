import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { campaignEventActionEnum } from "./enums";
import { campaigns } from "./campaigns";
import { employees } from "./employees";

export const campaignEvents = pgTable(
  "campaign_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    action: campaignEventActionEnum("action").notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("campaign_events_campaign_id_idx").on(table.campaignId),
    index("campaign_events_employee_id_idx").on(table.employeeId),
    index("campaign_events_created_at_idx").on(table.createdAt),
  ],
);

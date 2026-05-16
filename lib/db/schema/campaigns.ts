import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { campaignStatusEnum } from "./enums";
import { organizations } from "./organizations";

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    templateCategory: text("template_category").notNull(),
    difficulty: text("difficulty").notNull(),
    status: campaignStatusEnum("status").notNull().default("draft"),
    schedule: timestamp("schedule", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("campaigns_org_id_idx").on(table.orgId)],
);

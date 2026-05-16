import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { campaigns } from "./campaigns";
import { employees } from "./employees";

/**
 * Junction table tracking each employee's lifecycle status within a campaign.
 *
 * Status progression:
 *   pending → sent → email_opened → link_clicked
 *     → credential_attempted → compromised
 *     → reported → safe
 */
export const campaignEmployees = pgTable(
  "campaign_employees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    /**
     * Current status of this employee in the campaign.
     * Values: "pending" | "sent" | "compromised" | "reported" | "safe"
     */
    status: text("status").notNull().default("pending"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("campaign_employees_campaign_employee_uidx").on(
      t.campaignId,
      t.employeeId,
    ),
    index("campaign_employees_campaign_id_idx").on(t.campaignId),
    index("campaign_employees_employee_id_idx").on(t.employeeId),
  ],
);

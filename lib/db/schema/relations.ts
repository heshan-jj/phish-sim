import { relations } from "drizzle-orm";
import { campaignEvents } from "./campaign-events";
import { campaigns } from "./campaigns";
import { employees } from "./employees";
import { organizations } from "./organizations";

export const organizationsRelations = relations(organizations, ({ many }) => ({
  employees: many(employees),
  campaigns: many(campaigns),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [employees.orgId],
    references: [organizations.id],
  }),
  campaignEvents: many(campaignEvents),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [campaigns.orgId],
    references: [organizations.id],
  }),
  campaignEvents: many(campaignEvents),
}));

export const campaignEventsRelations = relations(campaignEvents, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignEvents.campaignId],
    references: [campaigns.id],
  }),
  employee: one(employees, {
    fields: [campaignEvents.employeeId],
    references: [employees.id],
  }),
}));

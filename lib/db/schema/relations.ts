import { relations } from "drizzle-orm";
import { campaignEmployees } from "./campaign-employees";
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
  campaignEmployees: many(campaignEmployees),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [campaigns.orgId],
    references: [organizations.id],
  }),
  campaignEvents: many(campaignEvents),
  campaignEmployees: many(campaignEmployees),
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

export const campaignEmployeesRelations = relations(campaignEmployees, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignEmployees.campaignId],
    references: [campaigns.id],
  }),
  employee: one(employees, {
    fields: [campaignEmployees.employeeId],
    references: [employees.id],
  }),
}));

import {
  campaignEventActionEnum,
  campaignEvents,
  campaignStatusEnum,
  campaigns,
  employees,
  organizations,
} from "@/lib/db/schema";

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type UpdateOrganization = Partial<NewOrganization>;

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type UpdateEmployee = Partial<NewEmployee>;

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type UpdateCampaign = Partial<NewCampaign>;

export type CampaignEvent = typeof campaignEvents.$inferSelect;
export type NewCampaignEvent = typeof campaignEvents.$inferInsert;
export type UpdateCampaignEvent = Partial<NewCampaignEvent>;

export type CampaignStatus = (typeof campaignStatusEnum.enumValues)[number];
export type CampaignEventAction =
  (typeof campaignEventActionEnum.enumValues)[number];

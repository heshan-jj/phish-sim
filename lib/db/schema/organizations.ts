import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(),
  name: text("name").notNull(),
  industry: text("industry"),
  logoUrl: text("logo_url"),
  context: jsonb("context"),
  onboardingCompletedAt: timestamp("onboarding_completed_at", {
    withTimezone: true,
  }),
  templateRecommendations: jsonb("template_recommendations"),
  templateRecommendationsAt: timestamp("template_recommendations_at", {
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

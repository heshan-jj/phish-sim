import { listCampaignsByOrg } from "@/lib/db/queries/campaigns";
import { getLeaderboardData } from "@/lib/db/queries/leaderboard";
import type { DepartmentScore } from "@/lib/scoring";

const FALLBACK_DEPARTMENT_SCORES: DepartmentScore[] = [
  {
    department: "General",
    avgScore: 50,
    compromisedCount: 1,
    reportedCount: 0,
    safeCount: 0,
    mostVulnerableTemplate: "—",
  },
];

export async function getDepartmentScoresForRecommendations(
  orgId: string,
): Promise<DepartmentScore[]> {
  const campaigns = await listCampaignsByOrg(orgId);
  const latestComplete = campaigns.find((c) => c.status === "complete");

  if (!latestComplete) {
    return FALLBACK_DEPARTMENT_SCORES;
  }

  const leaderboard = await getLeaderboardData(latestComplete.id);
  if (!leaderboard || leaderboard.departments.length === 0) {
    return FALLBACK_DEPARTMENT_SCORES;
  }

  return leaderboard.departments;
}

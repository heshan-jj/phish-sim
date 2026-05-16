import {
  assertNasikoConfigured,
  getAiProvider,
  type AiProvider,
} from "@/lib/ai-nasiko";
import { getPlatformLogSources } from "@/lib/platform-logs";

export type NasikoLogsStatus = {
  provider: AiProvider;
  nasikoConfigured: boolean;
  minimaxConfigured: boolean;
  nasikoBaseUrl: string | null;
  agentRouteSet: boolean;
  nasikoUiUrl: string | null;
  sources: string[];
};

export function buildNasikoLogsStatus(): NasikoLogsStatus {
  let nasikoConfigured = false;
  try {
    assertNasikoConfigured();
    nasikoConfigured = true;
  } catch {
    nasikoConfigured = false;
  }

  const rawBase = process.env.NASIKO_BASE_URL?.trim();
  let nasikoBaseUrl: string | null = null;
  if (rawBase) {
    try {
      nasikoBaseUrl = new URL(rawBase).origin;
    } catch {
      nasikoBaseUrl = rawBase.replace(/\/$/, "");
    }
  }

  return {
    provider: getAiProvider(),
    nasikoConfigured,
    minimaxConfigured: Boolean(process.env.MINIMAX_API_KEY?.trim()),
    nasikoBaseUrl,
    agentRouteSet: Boolean(process.env.NASIKO_AGENT_ROUTE?.trim()),
    nasikoUiUrl: rawBase ? `${rawBase.replace(/\/$/, "")}/app/` : null,
    sources: getPlatformLogSources(),
  };
}

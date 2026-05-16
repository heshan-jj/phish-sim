import type { CSSProperties } from "react";

export function getCampaignStatusStyle(status: string): CSSProperties {
  switch (status) {
    case "active":
      return {
        backgroundColor: "var(--ds-lavender)",
        color: "var(--ds-primary)",
      };
    case "complete":
      return {
        backgroundColor: "var(--ds-tint-mint)",
        color: "var(--ds-success)",
      };
    default:
      return {
        backgroundColor: "var(--ds-surface)",
        color: "var(--ds-charcoal)",
        border: "1px solid var(--ds-hairline)",
      };
  }
}

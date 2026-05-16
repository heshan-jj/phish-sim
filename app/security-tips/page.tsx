import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Tips",
};

const SECURITY_TIPS = [
  "Check sender domains carefully for typos, extra words, or unusual endings.",
  "Pause before acting on urgent requests involving passwords, payments, or account access.",
  "Hover over links to inspect destinations before clicking.",
  "Never enter credentials from links in unexpected emails; open the app directly instead.",
  "Report suspicious messages to your security team, even if you are unsure.",
];

export default function SecurityTipsPage() {
  return (
    <main
      className="min-h-screen px-4 py-12"
      style={{ backgroundColor: "var(--ds-surface)" }}
    >
      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-[28px] font-[600]" style={{ color: "var(--ds-ink)" }}>
            Security Tips
          </CardTitle>
          <CardDescription className="text-[14px]" style={{ color: "var(--ds-steel)" }}>
            Use this checklist whenever you receive an email that asks you to sign in,
            transfer money, or share sensitive information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul
            className="list-disc space-y-2 pl-5 text-[14px] leading-[1.5]"
            style={{ color: "var(--ds-charcoal)" }}
          >
            {SECURITY_TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}

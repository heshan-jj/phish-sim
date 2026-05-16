const SECURITY_TIPS = [
  "Check sender domains carefully for typos, extra words, or unusual endings.",
  "Pause before acting on urgent requests involving passwords, payments, or account access.",
  "Hover over links to inspect destinations before clicking.",
  "Never enter credentials from links in unexpected emails; open the app directly instead.",
  "Report suspicious messages to your security team, even if you are unsure.",
];

export default function SecurityTipsPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-12">
      <section className="mx-auto w-full max-w-3xl rounded-xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-[#0f172a]">Security Tips</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use this checklist whenever you receive an email that asks you to sign in,
          transfer money, or share sensitive information.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-slate-800">
          {SECURITY_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

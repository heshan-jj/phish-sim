import {
  EMAIL_TEMPLATES,
  getEmailTemplateById,
} from "@/lib/email/templates";

interface EmailPreviewPageProps {
  searchParams: Promise<{
    template?: string;
  }>;
}

function fillPlaceholders(value: string, placeholders: Record<string, string>) {
  return value.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return placeholders[key] ?? match;
  });
}

export default async function EmailPreviewPage({
  searchParams,
}: EmailPreviewPageProps) {
  const { template: templateId } = await searchParams;
  const selectedTemplate =
    getEmailTemplateById(templateId ?? "") ?? EMAIL_TEMPLATES[0];
  const html = selectedTemplate.render({
    copy: selectedTemplate.sampleCopy,
    placeholders: selectedTemplate.samplePlaceholders,
  });

  const subject = fillPlaceholders(
    selectedTemplate.sampleCopy.subject,
    selectedTemplate.samplePlaceholders,
  );
  const previewText = fillPlaceholders(
    selectedTemplate.sampleCopy.previewText,
    selectedTemplate.samplePlaceholders,
  );

  return (
    <main className="min-h-dvh bg-[var(--ds-surface)] px-4 py-8 text-[var(--ds-ink)] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium text-[var(--ds-steel)]">
            Development preview
          </p>
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-balance text-3xl font-semibold">
                Email template preview
              </h1>
              <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-[var(--ds-slate)]">
                Test phishing-simulation email layouts with sample AI-generated
                copy and placeholder data before connecting them to campaign
                delivery.
              </p>
            </div>
            <form>
              <label
                className="mb-2 block text-sm font-medium text-[var(--ds-charcoal)]"
                htmlFor="template"
              >
                Template
              </label>
              <select
                id="template"
                name="template"
                defaultValue={selectedTemplate.id}
                className="h-10 rounded-md border border-[var(--ds-hairline-strong)] bg-white px-3 text-sm"
              >
                {EMAIL_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="ml-2 h-10 rounded-md bg-[var(--ds-primary)] px-4 text-sm font-medium text-white"
              >
                Preview
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-4 rounded-xl border border-[var(--ds-hairline)] bg-white p-5 shadow-sm md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--ds-steel)]">
              Brand
            </p>
            <p className="mt-1 text-sm font-medium">{selectedTemplate.brand}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--ds-steel)]">
              Scenario
            </p>
            <p className="mt-1 text-sm font-medium">
              {selectedTemplate.scenario.replaceAll("_", " ")}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--ds-steel)]">
              Placeholders
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--ds-slate)]">
              {selectedTemplate.allowedPlaceholders.join(", ")}
            </p>
          </div>
        </section>

        <section className="grid gap-4 rounded-xl border border-[var(--ds-hairline)] bg-white p-5 shadow-sm lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-lg font-semibold">Inbox metadata</h2>
            <p className="mt-2 text-pretty text-sm leading-6 text-[var(--ds-slate)]">
              This is the text an employee sees before opening the message.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--ds-steel)]">
                Subject
              </p>
              <p className="mt-1 text-sm font-medium">{subject}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--ds-steel)]">
                Preview text
              </p>
              <p className="mt-1 text-sm text-[var(--ds-slate)]">
                {previewText}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-xl border border-[var(--ds-hairline)] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Desktop email width</h2>
              <span className="text-sm text-[var(--ds-steel)]">600px layout</span>
            </div>
            <iframe
              title={`${selectedTemplate.name} desktop preview`}
              srcDoc={html}
              className="h-[760px] w-full rounded-lg border border-[var(--ds-hairline)] bg-white"
            />
          </div>

          <div className="rounded-xl border border-[var(--ds-hairline)] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Mobile preview</h2>
              <span className="text-sm text-[var(--ds-steel)]">375px frame</span>
            </div>
            <div className="mx-auto w-full max-w-[375px]">
              <iframe
                title={`${selectedTemplate.name} mobile preview`}
                srcDoc={html}
                className="h-[760px] w-full rounded-lg border border-[var(--ds-hairline)] bg-white"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

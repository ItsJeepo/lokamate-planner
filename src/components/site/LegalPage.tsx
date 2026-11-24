import { useI18n } from "@/lib/i18n";

export type LegalSection = { title: string; body: string };
export type LegalContent = { title: string; updated: string; sections: LegalSection[] };

export function LegalPage({ id, en }: { id: LegalContent; en: LegalContent }) {
  const { lang } = useI18n();
  const c = lang === "en" ? en : id;
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">{c.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{c.updated}</p>
      <div className="mt-10 space-y-8">
        {c.sections.map((s, i) => (
          <section key={s.title}>
            <h2 className="text-lg font-bold text-foreground">
              {i + 1}. {s.title}
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}

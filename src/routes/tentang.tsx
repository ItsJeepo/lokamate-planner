import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang Lokamate — Perencana Liburan Indonesia" },
      {
        name: "description",
        content:
          "Lokamate menyusun itinerary liburan destinasi lokal Indonesia dari empat pertanyaan sederhana: gaya, kota, budget, dan lama liburan.",
      },
      { property: "og:title", content: "Tentang Lokamate" },
      {
        property: "og:description",
        content: "Kenapa kami fokus ke destinasi lokal Indonesia dan bagaimana cara kerjanya.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {t.about.title}
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t.about.lead}</p>

      <h2 className="mt-14 font-display text-2xl font-extrabold text-foreground">{t.about.how}</h2>
      <ol className="mt-6 space-y-4">
        {t.about.steps.map((step, index) => (
          <li key={step.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {index + 1}
            </span>
            <div>
              <h3 className="font-bold text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 font-display text-2xl font-extrabold text-foreground">{t.about.whyTitle}</h2>
      <p className="mt-4 leading-relaxed text-muted-foreground">{t.about.why}</p>

      <div className="mt-12">
        <Button asChild size="lg" className="rounded-full px-7 shadow-soft">
          <Link to="/planner">
            {t.about.cta}
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

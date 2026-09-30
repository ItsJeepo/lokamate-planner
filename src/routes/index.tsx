import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";

import { TripForm } from "@/components/home/TripForm";
import { JourneyBackground, RoutePreview } from "@/components/home/HomeJourney";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lokamate — Itinerary Liburan Indonesia dengan AI" },
      {
        name: "description",
        content:
          "Isi gaya liburan, kota tujuan, budget, dan lama liburan. Lokamate langsung menyusun itinerary harian, rincian biaya, penginapan, kuliner, dan tips lokal.",
      },
      { property: "og:title", content: "Lokamate — Itinerary Liburan Indonesia Siap Pakai" },
      {
        property: "og:description",
        content:
          "Perencana liburan berbasis AI untuk destinasi lokal Indonesia. Empat pertanyaan, itinerary lengkap langsung jadi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const HERO_PHRASE_VISIT_KEY = "lokamate.hero-phrase-visit";

function StaticHeroPhrase({ phrases }: { phrases: readonly string[] }) {
  const [phrase, setPhrase] = useState(phrases[0] ?? "");

  useEffect(() => {
    setPhrase(phrases[0] ?? "");
  }, [phrases]);

  useEffect(() => {
    if (phrases.length === 0) return;
    let nextIndex = 0;
    try {
      const currentIndex = Number.parseInt(window.sessionStorage.getItem(HERO_PHRASE_VISIT_KEY) ?? "-1", 10);
      nextIndex = Number.isFinite(currentIndex)
        ? (currentIndex + 1) % phrases.length
        : Math.floor(Math.random() * phrases.length);
      window.sessionStorage.setItem(HERO_PHRASE_VISIT_KEY, String(nextIndex));
    } catch {
      nextIndex = Math.floor(Math.random() * phrases.length);
    }

    setPhrase(phrases[nextIndex] ?? phrases[0] ?? "");
  }, [phrases]);

  return (
    <span className="block" aria-live="polite">
      {phrase}
    </span>
  );
}

function HomePage() {
  const { t } = useI18n();

  return (
    <div className="relative isolate overflow-hidden">
      <JourneyBackground />
      {/* Hero */}
      <section className="relative flex min-h-[78vh] items-end overflow-hidden text-ink-foreground">
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20 lg:pb-24">
          <div className="max-w-3xl">
            <h1 className="max-w-4xl font-display text-3xl font-extrabold leading-[1.08] text-ink-foreground sm:text-5xl lg:text-6xl">
              <StaticHeroPhrase phrases={t.hero.titleOptions} />
              <span className="text-primary-light">{t.hero.title2}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-foreground/80 sm:text-lg">
              {t.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="rounded-full px-7 shadow-lift">
                <Link to="/planner">
                  {t.hero.cta}
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <span className="text-sm text-ink-foreground/75">{t.hero.note}</span>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {t.hero.chips.map((chip) => (
                <div key={chip.title} className="rounded-xl border border-ink-foreground/20 bg-ink/35 p-4 backdrop-blur">
                  <dt className="text-sm font-bold text-ink-foreground">{chip.title}</dt>
                  <dd className="mt-1 text-xs text-ink-foreground/65">{chip.sub}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <RoutePreview />
      </section>

      {/* Compare */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 rounded-3xl border border-border/80 bg-background/95 p-8 shadow-lift backdrop-blur sm:p-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {t.compare.title1}
              <br />
              <span className="text-primary">{t.compare.title2}</span>
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">{t.compare.body}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">{t.compare.tagBad}</p>
                <div className="flex h-40 items-end gap-2">
                  {[30, 24, 18, 12].map((height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-lg bg-border"
                      style={{ height: `${height * 3}px` }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="mb-2 text-xs font-semibold text-primary">{t.compare.tagGood}</p>
                <div className="flex h-40 items-end gap-2">
                  {[20, 28, 36, 44].map((height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-lg bg-primary"
                      style={{ height: `${height * 3}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{t.compare.chartX}</span>
              <span>{t.compare.chartY}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative z-10 mx-auto w-full max-w-6xl space-y-16 px-4 pb-8 sm:px-6">
        {t.benefits.map((benefit, index) => (
          <div
            key={benefit.title}
            className={`grid gap-10 lg:grid-cols-2 lg:items-center ${index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}
          >
            <div className="rounded-2xl bg-background/95 p-6 shadow-lift backdrop-blur sm:p-8">
              <h3 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {benefit.title}
              </h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">{benefit.body}</p>
              <Button asChild className="mt-6 rounded-full px-6 shadow-soft">
                <Link to="/planner">
                  {benefit.cta}
                </Link>
              </Button>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              {"items" in benefit && benefit.items ? (
                <div className="space-y-3">
                  {benefit.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm"
                    >
                      <span className="flex items-center gap-2 text-foreground">
                        <Wallet className="size-4 text-primary" />
                        {item.label}
                      </span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-sm text-primary-foreground">
                    <span>{benefit.totalLabel}</span>
                    <span className="font-bold">{benefit.totalValue}</span>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-background p-5">
                    <p className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                      <X className="size-4" />
                      {benefit.leftLabel}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">{benefit.leftBody}</p>
                  </div>
                  <div className="rounded-2xl border border-primary/30 bg-secondary p-5">
                    <p className="flex items-center gap-2 text-sm font-bold text-primary">
                      <Check className="size-4" />
                      {benefit.rightLabel}
                    </p>
                    <p className="mt-3 text-sm text-foreground">{benefit.rightBody}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Form */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl bg-background/95 p-2 shadow-lift backdrop-blur sm:p-4"><TripForm /></div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold text-ink-foreground sm:text-4xl">
          {t.faq.heading}
        </h2>
        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {t.faq.items.map((item, index) => (
            <AccordionItem
              key={item.q}
              value={`faq-${index}`}
              className="rounded-2xl border border-border bg-card px-5 shadow-soft"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Closing */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="rounded-3xl bg-ink px-6 py-16 text-center sm:px-12">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
            {t.closing.title1}
            <br />
            {t.closing.title2}
          </h2>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-full px-8">
              <Link to="/planner">
                {t.closing.cta}
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <span className="text-sm text-primary-foreground/70">{t.closing.note}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

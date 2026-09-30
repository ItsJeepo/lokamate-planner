import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BedDouble,
  Bus,
  CalendarDays,
  Loader2,
  MapPin,
  Sun,
  Sunrise,
  Sunset,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { Map as MapIcon } from "lucide-react";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useEffect } from "react";

const TripMap = lazy(() => import("@/components/itinerary/TripMap"));

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { formatIDR, useI18n } from "@/lib/i18n";
import { getItinerary } from "@/lib/itinerary.functions";
import type { Activity, ItineraryRecord } from "@/lib/itinerary-types";

export const Route = createFileRoute("/itinerary/$id")({
  head: () => ({
    meta: [
      { title: "Itinerary Liburanmu — Lokamate" },
      {
        name: "description",
        content:
          "Rencana harian, rincian biaya, penginapan, kuliner, dan tips lokal untuk liburanmu di Indonesia.",
      },
      { property: "og:title", content: "Itinerary liburan siap pakai" },
      {
        property: "og:description",
        content: "Lihat rencana harian, biaya, penginapan, dan kuliner untuk perjalananmu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResultPage,
});

function Block({ items, label, icon }: { items: Activity[]; label: string; icon: React.ReactNode }) {
  const { t, lang } = useI18n();
  if (!items?.length) return null;
  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-sm font-bold text-primary">
        {icon}
        {label}
      </p>
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="font-display text-base font-bold text-foreground">
              <span className="mr-2 text-sm font-semibold text-muted-foreground">{item.time}</span>
              {item.title}
            </h4>
            <span className="text-sm font-semibold text-primary">{formatIDR(item.cost, lang)}</span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {item.location}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
      ))}
      <span className="sr-only">{t.result.daily}</span>
    </div>
  );
}

function ResultPage() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const load = useServerFn(getItinerary);

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/auth", search: { next: `/itinerary/${id}` }, replace: true });
    }
  }, [loading, session, navigate, id]);

  const query = useQuery({
    queryKey: ["itinerary", id],
    enabled: Boolean(session),
    queryFn: () => load({ data: { id } }) as Promise<ItineraryRecord | null>,
  });

  if (query.isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <p className="text-foreground">{t.result.notFound}</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/planner">
            {t.result.newTrip}
          </Link>
        </Button>
      </div>
    );
  }

  const trip = query.data;
  const result = trip.result;
  const total = result.costs?.total ?? 0;
  const diff = trip.budget - total;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <header className="rounded-3xl bg-ink px-6 py-10 text-primary-foreground sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/70">
          {trip.style} · {trip.days} {t.trips.days}
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {result.title}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-primary-foreground/80">{result.summary}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-primary-foreground/10 px-3 py-1">
            <MapPin className="mr-1 inline size-3.5" />
            {result.city || trip.city}
          </span>
          <span className="rounded-full bg-primary-foreground/10 px-3 py-1">
            <Wallet className="mr-1 inline size-3.5" />
            {t.result.budget}: {formatIDR(trip.budget, lang)}
          </span>
          <span className="rounded-full bg-primary-foreground/10 px-3 py-1">
            {t.result.total}: {formatIDR(total, lang)}
          </span>
          <span
            className={
              diff >= 0
                ? "rounded-full bg-primary px-3 py-1 font-semibold"
                : "rounded-full bg-destructive px-3 py-1 font-semibold"
            }
          >
            {diff >= 0 ? t.result.remaining : t.result.over}: {formatIDR(Math.abs(diff), lang)}
          </span>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="mb-5 flex items-center gap-2 font-display text-2xl font-extrabold text-foreground">
          <MapIcon className="size-5 text-primary" />
          {lang === "id" ? "Peta rute harian" : "Daily route map"}
        </h2>
        <ClientOnly fallback={<div className="h-[480px] rounded-3xl bg-surface" />}>
          <Suspense fallback={<div className="h-[480px] rounded-3xl bg-surface" />}>
            <TripMap days={result.days ?? []} city={result.city || trip.city} lang={lang} />
          </Suspense>
        </ClientOnly>
      </section>

      <section className="mt-12 space-y-10">
        <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold text-foreground">
          <CalendarDays className="size-5 text-primary" />
          {t.result.daily}
        </h2>
        {result.days?.map((day) => (
          <div key={day.day} className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
            <h3 className="font-display text-xl font-bold text-foreground">
              {t.result.day} {day.day} — {day.title}
            </h3>
            <div className="mt-5 grid gap-6 lg:grid-cols-3">
              <Block items={day.morning} label={t.result.morning} icon={<Sunrise className="size-4" />} />
              <Block items={day.afternoon} label={t.result.afternoon} icon={<Sun className="size-4" />} />
              <Block items={day.evening} label={t.result.evening} icon={<Sunset className="size-4" />} />
            </div>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold text-foreground">
          <Wallet className="size-5 text-primary" />
          {t.result.costs}
        </h2>
        <div className="mt-5 rounded-3xl border border-border bg-card p-5 sm:p-7">
          <div className="space-y-2">
            {result.costs?.items?.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm"
              >
                <span className="text-foreground">{item.label}</span>
                <span className="font-semibold text-foreground">{formatIDR(item.amount, lang)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-primary-foreground">
            <span>{t.result.total}</span>
            <span className="font-bold">{formatIDR(total, lang)}</span>
          </div>
          {result.costs?.note ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{result.costs.note}</p>
          ) : null}
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-foreground">
            <BedDouble className="size-5 text-primary" />
            {t.result.stays}
          </h2>
          <div className="mt-4 space-y-3">
            {result.stays?.map((stay) => (
              <div key={stay.name} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-bold text-foreground">{stay.name}</h3>
                  <span className="text-sm font-semibold text-primary">
                    {formatIDR(stay.pricePerNight, lang)} {t.result.perNight}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{stay.area}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stay.why}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-foreground">
            <UtensilsCrossed className="size-5 text-primary" />
            {t.result.food}
          </h2>
          <div className="mt-4 space-y-3">
            {result.food?.map((item) => (
              <div key={item.name} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-bold text-foreground">{item.name}</h3>
                  <span className="text-sm font-semibold text-primary">{formatIDR(item.price, lang)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.where}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.why}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold text-foreground">
          <Bus className="size-5 text-primary" />
          {t.result.tips}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            { title: t.result.tips, list: result.tips?.transport ?? [] },
            { title: t.destinations.best, list: result.tips?.bestTime ? [result.tips.bestTime] : [] },
            { title: t.result.packing, list: result.tips?.packing ?? [] },
            { title: t.result.watchOut, list: result.tips?.watchOut ?? [] },
          ].map((group) => (
            <div key={group.title} className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-sm font-bold text-foreground">{group.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {group.list.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-14 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full px-6">
          <Link to="/planner">
            {t.result.newTrip}
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link to="/perjalanan">{t.result.myTrips}</Link>
        </Button>
      </div>
    </div>
  );
}

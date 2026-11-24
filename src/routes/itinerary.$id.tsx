import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BedDouble,
  Bus,
  CalendarDays,
  ChevronDown,
  Loader2,
  MapPin,
  SlidersHorizontal,
  Sun,
  Sunrise,
  Sunset,
  Trash2,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { Map as MapIcon } from "lucide-react";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState } from "react";

const TripMap = lazy(() => import("@/components/itinerary/TripMap"));

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { formatIDR, useI18n, type Lang } from "@/lib/i18n";
import { deleteItinerary, getItinerary, getItineraryDestinationPhoto } from "@/lib/itinerary.functions";
import type { Activity, ItineraryRecord } from "@/lib/itinerary-types";
import heroBorobudur from "@/assets/lokamate-borobudur.jpg";
import heroBromo from "@/assets/lokamate-bromo.jpg";
import heroRajaAmpat from "@/assets/lokamate-raja-ampat.jpg";
import heroSurabaya from "@/assets/lokamate-surabaya.jpg";
import type { DestinationPhoto } from "@/lib/destination-photo.server";

export const Route = createFileRoute("/itinerary/$id")({
  head: () => ({
    meta: [
      { title: "Itinerary Liburanmu | Lokamate.id" },
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

function heroImageFor(city: string): string | null {
  const c = city.toLowerCase();
  if (/surabaya/.test(c)) return heroSurabaya;
  if (/jogja|yogyakarta|magelang|borobudur|solo|surakarta/.test(c)) return heroBorobudur;
  if (/bromo|malang|probolinggo|batu/.test(c)) return heroBromo;
  if (/raja ampat|sorong|papua/.test(c)) return heroRajaAmpat;
  return null;
}

function GooglePhotoHero({ photo, city, lang }: { photo: DestinationPhoto; city: string; lang: Lang }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <img
        src={photo.url}
        alt={lang === "id" ? `Foto wisata ${city}` : `Travel photo of ${city}`}
        className={`absolute inset-0 size-full object-cover ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(false)}
      />
      {loaded && (
        <div className="absolute bottom-20 right-4 z-10 max-w-[60%] text-right text-[10px] text-primary-foreground drop-shadow sm:bottom-24 sm:right-6">
          {photo.attributions.map((author) => author.url ? (
            <a key={author.name} href={author.url} target="_blank" rel="noopener noreferrer" className="underline">{author.name}</a>
          ) : <span key={author.name}>{author.name}</span>)}
          <span> · Google Maps</span>
        </div>
      )}
    </>
  );
}

const PERIODS = {
  morning: { icon: Sunrise, active: "bg-primary text-primary-foreground shadow-lg" },
  afternoon: { icon: Sun, active: "bg-warning text-warning-foreground shadow-lg" },
  evening: { icon: Sunset, active: "bg-primary-dark text-primary-foreground shadow-lg" },
} as const;

function TimelineBlock({
  items,
  label,
  period,
  lang,
  isLast,
}: {
  items: Activity[];
  label: string;
  period: keyof typeof PERIODS;
  lang: Lang;
  isLast: boolean;
}) {
  if (!items?.length) return null;
  const { icon: Icon, active } = PERIODS[period];
  return (
    <div className="relative flex gap-4 sm:gap-5">
      <div className="flex flex-col items-center">
        <div className={`z-10 flex size-10 shrink-0 items-center justify-center rounded-2xl ${active}`}>
          <Icon className="size-5" />
        </div>
        {!isLast && <div className="mt-2 w-0.5 flex-1 bg-border" />}
      </div>
      <div className="flex-1 pb-8">
        <p className="mb-3 text-[11px] font-black uppercase tracking-wide text-primary">{label}</p>
        <div className="space-y-4">
          {items.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[11px] font-black uppercase tracking-tight text-primary">{item.time}</span>
                <span className="shrink-0 rounded-lg bg-secondary px-2.5 py-1 text-xs font-bold text-primary">
                  {formatIDR(item.cost, lang)}
                </span>
              </div>
              <h4 className="mt-2 font-trip-display text-lg font-bold leading-snug text-foreground">{item.title}</h4>
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                {item.location}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultPage() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const load = useServerFn(getItinerary);
  const loadPhoto = useServerFn(getItineraryDestinationPhoto);
  const removeFn = useServerFn(deleteItinerary);
  async function handleDelete() {
    if (!window.confirm(lang === "id" ? "Hapus itinerary ini?" : "Delete this itinerary?")) return;
    try {
      await removeFn({ data: { id } });
      navigate({ to: "/perjalanan", replace: true });
    } catch (error) {
      console.error(error);
      window.alert(lang === "id" ? "Gagal menghapus" : "Delete failed");
    }
  }

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
  const photoQuery = useQuery({
    queryKey: ["itinerary-destination-photo", id],
    enabled: Boolean(session && query.data),
    queryFn: () => loadPhoto({ data: { id } }),
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (query.isPending || loading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6" aria-busy="true" aria-label="Memuat itinerary">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
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
  const city = result.city || trip.city;
  const localHero = heroImageFor(city);
  const budgetPct = trip.budget > 0 ? Math.min(100, Math.round((total / trip.budget) * 100)) : 0;
  const travelers =
    typeof trip.prefs?.adults === "number"
      ? `${trip.prefs.adults} ${t.result.prefsAdults}${trip.prefs.children ? ` · ${trip.prefs.children} ${t.result.prefsChildren}` : ""}`
      : null;

  return (
    <div className="font-trip-body">
      {/* Hero bergaya majalah */}
      <header className="relative">
        <div className="relative h-72 overflow-hidden sm:h-96">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light" />
          {localHero && (
            <img src={localHero} alt="" className="absolute inset-0 size-full object-cover" />
          )}
          {photoQuery.data?.url && <GooglePhotoHero key={photoQuery.data.url} photo={photoQuery.data} city={city} lang={lang} />}
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-transparent to-background" />
          <div className="absolute left-1/2 top-6 w-full max-w-5xl -translate-x-1/2 px-4 sm:px-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/30 bg-foreground/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground backdrop-blur-md">
              <MapPin className="size-3" /> {city}
            </span>
          </div>
        </div>

        {/* Kartu perjalanan melayang */}
        <div className="relative z-10 mx-auto -mt-16 w-full max-w-5xl px-4 sm:-mt-20 sm:px-6">
          <div className="rounded-[2rem] border border-border bg-card p-5 shadow-lift sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="font-trip-display text-2xl font-extrabold leading-tight text-foreground sm:text-4xl">
                  {result.title}
                </h1>
                <p className="mt-2 text-xs font-medium text-muted-foreground sm:text-sm">
                  {trip.days} {t.trips.days}
                  {travelers ? ` · ${travelers}` : ""} · {formatIDR(trip.budget, lang)}
                </p>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary">
                <CalendarDays className="size-5 text-primary" />
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">{result.summary}</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-strong">
                <div
                  className={`h-full rounded-full ${diff >= 0 ? "bg-primary" : "bg-destructive"}`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
              <span className={`text-[11px] font-bold ${diff >= 0 ? "text-muted-foreground" : "text-destructive"}`}>
                {budgetPct}% {t.result.budget}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-border bg-surface p-3 text-center">
                <p className="text-[9px] font-bold uppercase text-muted-foreground">{t.result.budget}</p>
                <p className="mt-1 text-xs font-bold text-foreground sm:text-sm">{formatIDR(trip.budget, lang)}</p>
              </div>
              <div className="rounded-2xl bg-primary p-3 text-center shadow-lg">
                <p className="text-[9px] font-bold uppercase text-primary-foreground/80">{t.result.total}</p>
                <p className="mt-1 text-xs font-bold text-primary-foreground sm:text-sm">{formatIDR(total, lang)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-3 text-center">
                <p className="text-[9px] font-bold uppercase text-muted-foreground">
                  {diff >= 0 ? t.result.remaining : t.result.over}
                </p>
                <p className={`mt-1 text-xs font-bold sm:text-sm ${diff >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatIDR(Math.abs(diff), lang)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        {/* Preferensi perjalanan — tertutup secara default */}
        <details className="group mt-6 rounded-2xl border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 marker:hidden [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-secondary">
                <SlidersHorizontal className="size-4 text-primary" />
              </span>
              <span className="text-sm font-semibold text-foreground">{t.result.prefs}</span>
            </span>
            <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="grid gap-x-8 gap-y-4 border-t border-border p-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: t.result.prefsName, value: trip.prefs?.nickname },
              { label: t.result.prefsDestination, value: city },
              { label: t.result.prefsStyle, value: trip.style },
              { label: t.result.prefsBudget, value: formatIDR(trip.budget, lang) },
              {
                label: t.result.prefsDates,
                value:
                  trip.prefs?.startDate && trip.prefs?.endDate
                    ? `${trip.prefs.startDate} – ${trip.prefs.endDate} · ${trip.days} ${t.trips.days}`
                    : `${trip.days} ${t.trips.days}`,
              },
              {
                label: t.result.prefsArrival,
                value: trip.prefs?.arrivalHub
                  ? `${
                      trip.prefs.arrivalMode === "station"
                        ? t.result.arrivalStation
                        : trip.prefs.arrivalMode === "harbor"
                          ? t.result.arrivalHarbor
                          : t.result.arrivalAirport
                    } · ${trip.prefs.arrivalHub}`
                  : undefined,
              },
              {
                label: t.result.prefsTravelers,
                value: travelers ?? undefined,
              },
            ]
              .filter((item) => item.value)
              .map((item) => (
                <div key={item.label} className="pl-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
          </div>
        </details>

        {/* Peta rute */}
        <section className="mt-10">
          <h2 className="mb-5 flex items-center gap-2 font-trip-display text-2xl font-bold text-foreground">
            <MapIcon className="size-5 text-primary" />
            {lang === "id" ? "Peta rute harian" : "Daily route map"}
          </h2>
          <ClientOnly fallback={<div className="h-[280px] rounded-[2rem] bg-surface sm:h-[390px]" />}>
            <Suspense fallback={<div className="h-[280px] rounded-[2rem] bg-surface sm:h-[390px]" />}>
              <TripMap days={result.days ?? []} city={city} lang={lang} compact />
            </Suspense>
          </ClientOnly>
        </section>

        {/* Rencana harian — expandable per hari */}
        <section className="mt-14">
          <h2 className="flex items-center gap-2 font-trip-display text-2xl font-bold text-foreground">
            <CalendarDays className="size-5 text-primary" />
            {t.result.daily}
          </h2>
          <div className="mt-6 space-y-4">
            {result.days?.map((day) => {
              const activityCount =
                (day.morning?.length ?? 0) + (day.afternoon?.length ?? 0) + (day.evening?.length ?? 0);
              return (
                <details
                  key={day.day}
                  className="group rounded-[1.75rem] border border-border bg-card shadow-soft"
                  open={day.day === 1}
                >
                  <summary className="flex cursor-pointer list-none items-center gap-4 p-4 marker:hidden sm:p-5 [&::-webkit-details-marker]:hidden">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary font-trip-display text-xl font-bold text-primary-foreground shadow-lg">
                      {day.day}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase text-primary">
                        {t.result.day} {day.day}
                      </p>
                      <h3 className="mt-0.5 truncate font-trip-display text-xl font-bold text-foreground sm:text-2xl">
                        {day.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {activityCount} {lang === "id" ? "aktivitas" : "activities"}
                      </p>
                    </div>
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-border px-4 pb-2 pt-6 sm:px-5">
                    <TimelineBlock items={day.morning} label={t.result.morning} period="morning" lang={lang} isLast={!day.afternoon?.length && !day.evening?.length} />
                    <TimelineBlock items={day.afternoon} label={t.result.afternoon} period="afternoon" lang={lang} isLast={!day.evening?.length} />
                    <TimelineBlock items={day.evening} label={t.result.evening} period="evening" lang={lang} isLast />
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        {/* Rincian biaya */}
        <section className="mt-12">
          <h2 className="flex items-center gap-2 font-trip-display text-2xl font-bold text-foreground">
            <Wallet className="size-5 text-primary" />
            {t.result.costs}
          </h2>
          <div className="mt-5 rounded-[2rem] border border-border bg-card p-5 sm:p-7">
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

        {/* Penginapan & kuliner */}
        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 font-trip-display text-xl font-bold text-foreground">
              <BedDouble className="size-5 text-primary" />
              {t.result.stays}
            </h2>
            <div className="mt-4 space-y-3">
              {result.stays?.map((stay) => (
                <div key={stay.name} className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft">
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
            <h2 className="flex items-center gap-2 font-trip-display text-xl font-bold text-foreground">
              <UtensilsCrossed className="size-5 text-primary" />
              {t.result.food}
            </h2>
            <div className="mt-4 space-y-3">
              {result.food?.map((item) => (
                <div key={item.name} className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft">
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

        {/* Tips — kartu gelap "Rekomendasi Ahli" */}
        <section className="mt-12">
          <div className="rounded-[2.5rem] bg-primary-dark p-6 text-primary-foreground shadow-lift sm:p-10">
            <h2 className="flex items-center gap-2 font-trip-display text-2xl font-bold">
              <Bus className="size-5" />
              {t.result.tips}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {[
                { title: t.result.tips, list: result.tips?.transport ?? [] },
                { title: t.destinations.best, list: result.tips?.bestTime ? [result.tips.bestTime] : [] },
                { title: t.result.packing, list: result.tips?.packing ?? [] },
                { title: t.result.watchOut, list: result.tips?.watchOut ?? [] },
              ].map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-primary-foreground/90">{group.title}</h3>
                  <ul className="mt-3 space-y-3 text-sm text-primary-foreground/80">
                    {group.list.map((line) => (
                      <li key={line} className="flex gap-3">
                        <span className="mt-0.5 h-6 w-1 shrink-0 rounded-full bg-primary-light" />
                        <span className="leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-14 flex flex-wrap justify-center gap-3 pb-4">
          <Button asChild className="rounded-full px-6">
            <Link to="/planner">
              {t.result.newTrip}
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link to="/perjalanan">{t.result.myTrips}</Link>
          </Button>
          <Button variant="outline" className="rounded-full px-6 text-destructive hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="size-4" />
            {lang === "id" ? "Hapus itinerary" : "Delete itinerary"}
          </Button>
        </div>
      </div>
    </div>
  );
}

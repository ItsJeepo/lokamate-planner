import { ClientOnly, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  MapPin,
  Sun,
  Sunrise,
  Sunset,
} from "lucide-react";
import { Suspense, lazy, useEffect, useState } from "react";

import borobudurPhoto from "@/assets/lokamate-borobudur.jpg";
import bromoPhoto from "@/assets/lokamate-bromo.jpg";
import rajaAmpatPhoto from "@/assets/lokamate-raja-ampat.jpg";
import { Button } from "@/components/ui/button";
import { formatIDR, useI18n } from "@/lib/i18n";
import type { ItineraryDay } from "@/lib/itinerary-types";
import { cn } from "@/lib/utils";

const TripMap = lazy(() => import("@/components/itinerary/TripMap"));

const photos = [borobudurPhoto, bromoPhoto, rajaAmpatPhoto];

export function JourneyBackground() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const page = document.documentElement.scrollHeight - window.innerHeight;
      const progress = page > 0 ? window.scrollY / page : 0;
      setActive(progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink" aria-hidden="true">
      {photos.map((photo, index) => (
        <img
          key={photo}
          src={photo}
          alt=""
          width={1920}
          height={1280}
          loading={index === 0 ? "eager" : "lazy"}
          className={cn(
            "absolute inset-0 size-full scale-[1.015] object-cover transition-opacity duration-[1400ms] ease-in-out motion-reduce:transition-none",
            active === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      <div className="absolute inset-0 bg-ink/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/10 via-transparent to-ink/65" />
    </div>
  );
}

type SampleActivity = {
  time: string;
  title: string;
  location: string;
  cost: number;
};

type SampleDay = {
  day: number;
  title: { id: string; en: string };
  morning: SampleActivity[];
  afternoon: SampleActivity[];
  evening: SampleActivity[];
};

const BALI_DAYS: SampleDay[] = [
  {
    day: 1,
    title: { id: "Tiba & Ubud yang tenang", en: "Arrival & serene Ubud" },
    morning: [
      { time: "09.00", title: "Tiba di Bandara Ngurah Rai", location: "Badung, Bali", cost: 0 },
      { time: "10.30", title: "Transfer ke penginapan di Ubud", location: "Ubud, Gianyar", cost: 250000 },
    ],
    afternoon: [
      { time: "13.00", title: "Makan siang di warung babi guling lokal", location: "Ubud", cost: 60000 },
      { time: "15.00", title: "Jalan santai di Tegalalang Rice Terrace", location: "Tegalalang, Gianyar", cost: 25000 },
    ],
    evening: [
      { time: "19.00", title: "Makan malam & pasar malam Ubud", location: "Pusat Ubud", cost: 90000 },
    ],
  },
  {
    day: 2,
    title: { id: "Pantai & matahari terbenam Uluwatu", en: "Beaches & Uluwatu sunset" },
    morning: [
      { time: "08.00", title: "Sarapan & berangkat ke Pantai Padang Padang", location: "Pecatu, Badung", cost: 15000 },
      { time: "09.30", title: "Santai & berenang di Padang Padang", location: "Pecatu, Badung", cost: 0 },
    ],
    afternoon: [
      { time: "12.30", title: "Makan siang seafood Jimbaran", location: "Jimbaran, Badung", cost: 120000 },
      { time: "16.00", title: "Pura Luhur Uluwatu & tebing karang", location: "Uluwatu, Badung", cost: 50000 },
    ],
    evening: [
      { time: "18.00", title: "Tari Kecak saat matahari terbenam", location: "Uluwatu, Badung", cost: 150000 },
    ],
  },
  {
    day: 3,
    title: { id: "Nusa Penida seharian", en: "A full day in Nusa Penida" },
    morning: [
      { time: "06.30", title: "Fast boat dari Sanur ke Nusa Penida", location: "Pelabuhan Sanur", cost: 200000 },
      { time: "09.00", title: "Kelingking Beach & T-Rex viewpoint", location: "Nusa Penida, Klungkung", cost: 25000 },
    ],
    afternoon: [
      { time: "12.00", title: "Makan siang di warung tepi laut", location: "Nusa Penida", cost: 70000 },
      { time: "14.00", title: "Angel's Billabong & Broken Beach", location: "Nusa Penida, Klungkung", cost: 20000 },
    ],
    evening: [
      { time: "17.00", title: "Kembali ke Sanur & makan malam perpisahan", location: "Sanur, Denpasar", cost: 110000 },
    ],
  },
];

const SAMPLE_BUDGET = 3500000;
const SAMPLE_COST_ITEMS = [
  { label: { id: "Transport (boat, transfer, bensin)", en: "Transport (boat, transfers, fuel)" }, amount: 680000 },
  { label: { id: "Penginapan 2 malam di Ubud", en: "2 nights stay in Ubud" }, amount: 900000 },
  { label: { id: "Makan & kuliner", en: "Food & dining" }, amount: 510000 },
  { label: { id: "Tiket masuk & aktivitas", en: "Entrance tickets & activities" }, amount: 420000 },
];
const SAMPLE_TOTAL = SAMPLE_COST_ITEMS.reduce((sum, item) => sum + item.amount, 0);

const PERIODS = {
  morning: { icon: Sunrise, active: "bg-primary text-primary-foreground" },
  afternoon: { icon: Sun, active: "bg-warning text-warning-foreground" },
  evening: { icon: Sunset, active: "bg-primary-dark text-primary-foreground" },
} as const;

function MiniTimeline({
  items,
  label,
  period,
  isLast,
}: {
  items: SampleActivity[];
  label: string;
  period: keyof typeof PERIODS;
  isLast: boolean;
}) {
  const { lang } = useI18n();
  if (!items.length) return null;
  const { icon: Icon, active } = PERIODS[period];
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`z-10 flex size-8 shrink-0 items-center justify-center rounded-xl ${active}`}>
          <Icon className="size-3.5" />
        </div>
        {!isLast && <div className="mt-2 w-px flex-1 bg-primary-foreground/20" />}
      </div>
      <div className="min-w-0 flex-1 pb-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary-light">{label}</p>
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={`${item.time}-${item.title}`} className="flex items-baseline gap-3">
              <span className="w-10 shrink-0 text-[11px] font-bold tabular-nums text-ink-foreground/50">
                {item.time}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug text-ink-foreground">{item.title}</p>
                <p className="mt-0.5 truncate text-xs text-ink-foreground/50">{item.location}</p>
              </div>
              <span className="shrink-0 text-xs font-bold text-primary-light">
                {item.cost > 0 ? formatIDR(item.cost, lang) : lang === "id" ? "Gratis" : "Free"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RoutePreview() {
  const { t, lang } = useI18n();
  const diff = SAMPLE_BUDGET - SAMPLE_TOTAL;
  const budgetPct = Math.min(100, Math.round((SAMPLE_TOTAL / SAMPLE_BUDGET) * 100));

  const mapDays: ItineraryDay[] = BALI_DAYS.map((day) => ({
    day: day.day,
    title: day.title[lang],
    morning: day.morning.map((a) => ({ ...a, description: "" })),
    afternoon: day.afternoon.map((a) => ({ ...a, description: "" })),
    evening: day.evening.map((a) => ({ ...a, description: "" })),
  }));

  return (
    <section className="overflow-hidden rounded-[2rem] border border-primary-foreground/20 bg-ink/90 text-ink-foreground shadow-lift backdrop-blur-sm">
      <div className="p-4 sm:p-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-ink-foreground/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-light">
            <MapPin className="size-3" /> Bali
          </span>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            {lang === "id" ? "Contoh hasilnya: " : "See a real sample: "}
            <span className="text-primary-light">
              {lang === "id" ? "3 hari keliling Bali" : "3 days across Bali"}
            </span>
          </h2>
          <p className="mt-2 text-sm text-ink-foreground/70">
            {lang === "id"
              ? "Gambaran itinerary yang akan kamu terima. Klik tiap hari untuk detail, dan lihat jalurnya di peta."
              : "A preview of your itinerary. Tap each day for details and follow the route on the map."}
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          {/* Kolom kiri: ringkasan + rencana harian */}
          <div className="min-w-0 space-y-4">
            <div className="rounded-[1.75rem] border border-primary-foreground/15 bg-ink/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-trip-display text-lg font-extrabold leading-tight text-ink-foreground sm:text-xl">
                    {lang === "id" ? "Tiga Hari Keliling Bali" : "Three Days Across Bali"}
                  </h3>
                  <p className="mt-1.5 text-xs font-medium text-ink-foreground/70 sm:text-sm">
                    3 {t.trips.days} · 2 {lang === "id" ? "dewasa" : "adults"} · {formatIDR(SAMPLE_BUDGET, lang)}
                  </p>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary">
                  <CalendarDays className="size-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-foreground/15">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${budgetPct}%` }} />
                </div>
                <span className="text-[11px] font-bold text-ink-foreground/70">
                  {budgetPct}% {t.result.budget}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="text-ink-foreground/70">
                  {t.result.total} <strong className="font-bold text-ink-foreground">{formatIDR(SAMPLE_TOTAL, lang)}</strong>
                </span>
                <span className="font-semibold text-primary-light">
                  {t.result.remaining} {formatIDR(diff, lang)}
                </span>
              </div>
            </div>

            {/* Rencana harian expandable */}
            <div className="space-y-3">
              {BALI_DAYS.map((day) => {
                const activityCount = day.morning.length + day.afternoon.length + day.evening.length;
                return (
                  <details
                    key={day.day}
                    className="group rounded-3xl border border-primary-foreground/15 bg-ink/60"
                    open={day.day === 1}
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-3 p-4 marker:hidden [&::-webkit-details-marker]:hidden">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-trip-display text-base font-bold text-primary-foreground">
                        {day.day}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase text-primary-light">
                          {t.result.day} {day.day}
                        </p>
                        <h4 className="mt-0.5 truncate font-trip-display text-base font-bold text-ink-foreground">
                          {day.title[lang]}
                        </h4>
                        <p className="mt-0.5 text-xs text-ink-foreground/60">
                          {activityCount} {lang === "id" ? "aktivitas" : "activities"}
                        </p>
                      </div>
                      <ChevronDown className="size-5 shrink-0 text-ink-foreground/60 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-primary-foreground/15 px-4 pb-2 pt-5">
                      <MiniTimeline
                        items={day.morning}
                        label={t.result.morning}
                        period="morning"
                        isLast={!day.afternoon.length && !day.evening.length}
                      />
                      <MiniTimeline
                        items={day.afternoon}
                        label={t.result.afternoon}
                        period="afternoon"
                        isLast={!day.evening.length}
                      />
                      <MiniTimeline items={day.evening} label={t.result.evening} period="evening" isLast />
                    </div>
                  </details>
                );
              })}
            </div>

            {/* Perkiraan biaya ringkas */}
            <div className="rounded-[1.75rem] border border-primary-foreground/15 bg-ink/60 p-5">
              <div className="divide-y divide-primary-foreground/10">
                {SAMPLE_COST_ITEMS.map((item) => (
                  <div key={item.label.id} className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0">
                    <span className="text-ink-foreground/80">{item.label[lang]}</span>
                    <span className="font-semibold text-ink-foreground">{formatIDR(item.amount, lang)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-primary-foreground/20 pt-3">
                <span className="text-sm font-semibold text-ink-foreground">{t.result.total}</span>
                <span className="font-trip-display text-base font-extrabold text-primary-light">
                  {formatIDR(SAMPLE_TOTAL, lang)}
                </span>
              </div>
            </div>

            <div className="pt-1 text-center">
              <Button asChild className="rounded-full px-7 shadow-soft">
                <Link to="/planner">
                  {lang === "id" ? "Buat versimu sendiri" : "Make your own"}
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Kolom kanan: peta rute */}
          <div className="min-w-0 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[1.75rem] border border-primary-foreground/15 bg-ink/60">
              <div className="flex items-center gap-2 border-b border-primary-foreground/15 px-4 py-3 text-xs font-semibold text-ink-foreground/80">
                <MapPin className="size-4 text-primary-light" />
                {lang === "id" ? "Peta rute, pilih hari" : "Route map, pick a day"}
              </div>
              <div className="p-3 text-foreground">
                <ClientOnly fallback={<div className="h-[280px] rounded-2xl bg-ink-foreground/10 sm:h-[360px]" />}>
                  <Suspense fallback={<div className="h-[280px] rounded-2xl bg-ink-foreground/10 sm:h-[360px]" />}>
                    <TripMap days={mapDays} city={lang === "id" ? "Bali" : "Bali, Indonesia"} lang={lang} compact />
                  </Suspense>
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

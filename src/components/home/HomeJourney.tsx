import { useEffect, useState } from "react";
import { ChevronDown, Clock3, MapPin, Navigation, Wallet } from "lucide-react";

import borobudurPhoto from "@/assets/lokamate-borobudur.jpg.asset.json";
import bromoPhoto from "@/assets/lokamate-bromo.jpg.asset.json";
import rajaAmpatPhoto from "@/assets/lokamate-raja-ampat.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const dayRoutes = [
  {
    id: 1,
    title: { id: "Warisan kota & senja", en: "Heritage & sunset" },
    distance: "18 km",
    points: [
      { time: "08.00", place: "Keraton Yogyakarta", cost: "Rp 25.000", x: 24, y: 68 },
      { time: "10.30", place: "Taman Sari", cost: "Rp 20.000", x: 37, y: 60 },
      { time: "15.30", place: "Bukit Bintang", cost: "Rp 10.000", x: 68, y: 35 },
      { time: "19.00", place: "Malioboro", cost: "Rp 60.000", x: 52, y: 75 },
    ],
  },
  {
    id: 2,
    title: { id: "Candi & desa wisata", en: "Temples & village life" },
    distance: "44 km",
    points: [
      { time: "06.30", place: "Candi Borobudur", cost: "Rp 120.000", x: 20, y: 25 },
      { time: "11.30", place: "Desa Candirejo", cost: "Rp 75.000", x: 38, y: 42 },
      { time: "16.00", place: "Svargabumi", cost: "Rp 30.000", x: 64, y: 55 },
      { time: "19.30", place: "Alun-alun Kidul", cost: "Rp 45.000", x: 76, y: 76 },
    ],
  },
  {
    id: 3,
    title: { id: "Pantai selatan", en: "Southern coast" },
    distance: "62 km",
    points: [
      { time: "07.00", place: "Hutan Pinus Mangunan", cost: "Rp 15.000", x: 22, y: 32 },
      { time: "10.30", place: "Pantai Timang", cost: "Rp 150.000", x: 44, y: 53 },
      { time: "15.30", place: "Pantai Indrayanti", cost: "Rp 20.000", x: 67, y: 67 },
      { time: "18.30", place: "Seafood Baron", cost: "Rp 85.000", x: 80, y: 78 },
    ],
  },
];

const photos = [borobudurPhoto.url, bromoPhoto.url, rajaAmpatPhoto.url];

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

export function RoutePreview() {
  const { lang } = useI18n();
  const [activeDay, setActiveDay] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const route = dayRoutes.find((day) => day.id === activeDay) ?? dayRoutes[0];

  if (!route) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-primary-foreground/20 bg-ink/90 text-ink-foreground shadow-lift backdrop-blur-sm">
      <div className="grid lg:grid-cols-[0.92fr_1.35fr]">
        <div className="flex flex-col p-6 sm:p-8 lg:p-10">
          <span className="text-xs font-bold uppercase text-primary-light">
            {lang === "id" ? "Contoh itinerary interaktif" : "Interactive itinerary sample"}
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
            {lang === "id" ? "Tiga hari menyusuri Yogyakarta" : "Three days across Yogyakarta"}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-foreground/70">
            {lang === "id"
              ? "Pilih hari untuk melihat jalur yang disusun berdasarkan jarak dan waktu kunjungan."
              : "Choose a day to see a route arranged around distance and ideal visiting times."}
          </p>

          <div
            className="mt-8 grid grid-cols-3 gap-2"
            role="tablist"
            aria-label={lang === "id" ? "Hari itinerary" : "Itinerary days"}
          >
            {dayRoutes.map((day) => (
              <Button
                key={day.id}
                type="button"
                variant={activeDay === day.id ? "secondary" : "ghost"}
                className={cn(
                  "h-auto min-h-14 flex-col rounded-xl px-2 py-2",
                  activeDay !== day.id && "text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground",
                )}
                onClick={() => {
                  setActiveDay(day.id);
                  setExpanded(false);
                }}
                role="tab"
                aria-selected={activeDay === day.id}
              >
                <span className="text-xs opacity-70">{lang === "id" ? "Hari" : "Day"}</span>
                <span className="text-base font-bold">0{day.id}</span>
              </Button>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-ink-foreground/15 pt-6">
            <div>
              <p className="font-semibold">{route.title[lang]}</p>
              <p className="mt-1 flex items-center gap-2 text-xs text-ink-foreground/60">
                <Navigation className="size-3.5" /> {route.distance} · {route.points.length} {lang === "id" ? "pemberhentian" : "stops"}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0 rounded-full"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
            >
              {expanded ? (lang === "id" ? "Tutup" : "Close") : lang === "id" ? "Lihat detail" : "View details"}
              <ChevronDown className={cn("ml-1 size-4 transition-transform", expanded && "rotate-180")} />
            </Button>
          </div>

          <div className={cn("grid transition-all duration-500", expanded ? "mt-6 grid-rows-[1fr]" : "grid-rows-[0fr]")}>
            <div className="overflow-hidden">
              <ol className="space-y-4 border-l border-primary-light/40 pl-5">
                {route.points.map((point, index) => (
                  <li key={point.place} className="relative">
                    <span className="absolute -left-[1.55rem] top-1.5 size-2.5 rounded-full bg-primary-light ring-4 ring-ink" />
                    <p className="font-semibold">{point.place}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-foreground/65">
                      <span className="flex items-center gap-1"><Clock3 className="size-3" />{point.time}</span>
                      <span className="flex items-center gap-1"><Wallet className="size-3" />{point.cost}</span>
                      <span>{lang === "id" ? `Tujuan ${index + 1}` : `Stop ${index + 1}`}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden bg-surface-strong lg:min-h-[590px]">
          <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:38px_38px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-background/35 to-primary/20" />
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M4 18 C22 6,30 28,48 18 S76 2,96 17 M0 44 C25 30,35 50,57 39 S82 29,100 42 M0 75 C18 61,35 82,54 69 S84 59,100 74" fill="none" stroke="var(--border)" strokeWidth="0.7" />
            <polyline
              points={route.points.map((point) => `${point.x},${point.y}`).join(" ")}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="route-path"
            />
          </svg>
          {route.points.map((point, index) => (
            <div
              key={point.place}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <div className="flex size-9 items-center justify-center rounded-full border-4 border-primary-foreground bg-primary text-sm font-bold text-primary-foreground shadow-lift">
                {index + 1}
              </div>
              <span className="absolute left-1/2 top-11 -translate-x-1/2 whitespace-nowrap rounded-md bg-card px-2 py-1 text-xs font-semibold text-card-foreground shadow-soft">
                {point.place}
              </span>
            </div>
          ))}
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-card/90 px-3 py-2 text-xs font-semibold text-card-foreground shadow-soft backdrop-blur sm:left-6 sm:top-6">
            <MapPin className="size-4 text-primary" />
            {lang === "id" ? `Jalur Hari ${activeDay}` : `Day ${activeDay} route`}
          </div>
        </div>
      </div>
    </section>
  );
}
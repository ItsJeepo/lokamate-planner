import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, CalendarRange, MapPin, Wallet } from "lucide-react";

import yogyakartaImage from "@/assets/destination-yogyakarta.jpg";
import baliImage from "@/assets/destination-bali.jpg";
import bandungImage from "@/assets/destination-bandung.jpg";
import labuanBajoImage from "@/assets/destination-labuan-bajo.jpg";
import bromoImage from "@/assets/destination-bromo.jpg";
import lombokImage from "@/assets/destination-lombok.jpg";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type Destination = {
  city: string;
  plannerCity: string;
  region: string;
  blurb: { id: string; en: string };
  best: { id: string; en: string };
  budget: string;
  image: string;
  landmark: string;
};

const DESTINATIONS: Destination[] = [
  {
    city: "Yogyakarta",
    plannerCity: "Yogyakarta",
    image: yogyakartaImage,
    landmark: "Tugu Yogyakarta",
    region: "DI Yogyakarta",
    blurb: {
      id: "Keraton, candi, gudeg, dan bukit senja dalam radius satu jam.",
      en: "Palaces, temples, gudeg, and sunset hills within an hour of each other.",
    },
    best: { id: "April - Oktober", en: "April - October" },
    budget: "Rp 1.500.000 - Rp 3.500.000",
  },
  {
    city: "Bali",
    plannerCity: "Bali",
    image: baliImage,
    landmark: "Pura Ulun Danu Beratan",
    region: "Bali",
    blurb: {
      id: "Pantai selatan, sawah Ubud, dan pura yang tidak pernah membosankan.",
      en: "Southern beaches, Ubud rice fields, and temples that never get old.",
    },
    best: { id: "Mei - September", en: "May - September" },
    budget: "Rp 2.500.000 - Rp 8.000.000",
  },
  {
    city: "Bandung",
    plannerCity: "Bandung",
    image: bandungImage,
    landmark: "Gedung Sate",
    region: "Jawa Barat",
    blurb: {
      id: "Udara sejuk, kawah Tangkuban Perahu, dan kuliner malam tanpa habis.",
      en: "Cool air, the Tangkuban Perahu crater, and endless late-night food.",
    },
    best: { id: "Sepanjang tahun", en: "All year round" },
    budget: "Rp 1.000.000 - Rp 3.000.000",
  },
  {
    city: "Labuan Bajo",
    plannerCity: "Labuan Bajo",
    image: labuanBajoImage,
    landmark: "Pulau Padar",
    region: "Nusa Tenggara Timur",
    blurb: {
      id: "Komodo, Padar, dan snorkeling di air yang jernih sekali.",
      en: "Komodo, Padar, and snorkelling in remarkably clear water.",
    },
    best: { id: "April - Oktober", en: "April - October" },
    budget: "Rp 4.000.000 - Rp 12.000.000",
  },
  {
    city: "Malang & Bromo",
    plannerCity: "Bromo",
    image: bromoImage,
    landmark: "Gunung Bromo",
    region: "Jawa Timur",
    blurb: {
      id: "Sunrise Bromo, kota dingin, dan pantai selatan yang masih sepi.",
      en: "Bromo sunrise, a cool highland city, and quiet southern beaches.",
    },
    best: { id: "Mei - September", en: "May - September" },
    budget: "Rp 1.500.000 - Rp 4.000.000",
  },
  {
    city: "Lombok",
    plannerCity: "Lombok",
    image: lombokImage,
    landmark: "Gunung Rinjani",
    region: "Nusa Tenggara Barat",
    blurb: {
      id: "Pantai Kuta Mandalika, Gili, dan Rinjani untuk yang kuat jalan.",
      en: "Kuta Mandalika beaches, the Gilis, and Rinjani for strong legs.",
    },
    best: { id: "Mei - September", en: "May - September" },
    budget: "Rp 2.000.000 - Rp 6.000.000",
  },
];

export const Route = createFileRoute("/destinasi")({
  head: () => ({
    meta: [
      { title: "Jelajah Destinasi Indonesia | Lokamate.id" },
      {
        name: "description",
        content:
          "Jelajahi destinasi populer Yogyakarta, Bali, Bandung, Labuan Bajo, Bromo, dan Lombok beserta landmark, waktu berkunjung, dan kisaran budget.",
      },
      { property: "og:title", content: "Jelajah Destinasi Populer Indonesia | Lokamate.id" },
      {
        property: "og:description",
        content: "Pilih satu destinasi lokal, lalu Lokamate.id menyusun itinerary-nya untukmu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DestinationsPage,
});

function DestinationsPage() {
  const { t, lang } = useI18n();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {t.destinations.title}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{t.destinations.sub}</p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DESTINATIONS.map((item) => (
          <article
            key={item.city}
             className="group relative isolate flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift"
          >
             <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
               <img
                 src={item.image}
                 alt={`${item.landmark}, ${item.city}`}
                 width={512}
                 height={512}
                 loading="lazy"
                 className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
               />
             </div>
             <div aria-hidden="true" className="destination-text-wash pointer-events-none absolute inset-0 -z-10" />
            <h2 className="font-display text-xl font-bold text-foreground">{item.city}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 text-primary" />
              {item.region}
            </p>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
              {item.blurb[lang]}
            </p>
            <dl className="mt-5 space-y-2 text-xs">
               <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <CalendarRange className="size-3.5 text-primary" />
                <dt className="text-muted-foreground">{t.destinations.best}:</dt>
                <dd className="font-semibold text-foreground">{item.best[lang]}</dd>
              </div>
               <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Wallet className="size-3.5 text-primary" />
                <dt className="text-muted-foreground">{t.destinations.budget}:</dt>
                <dd className="font-semibold text-foreground">{item.budget}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" className="mt-6 rounded-full">
              <Link to="/planner" search={{ kota: item.plannerCity }}>
                 {t.destinations.plan}
                 <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}

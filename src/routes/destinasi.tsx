import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarRange, MapPin, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type Destination = {
  city: string;
  region: string;
  blurb: { id: string; en: string };
  best: { id: string; en: string };
  budget: string;
};

const DESTINATIONS: Destination[] = [
  {
    city: "Yogyakarta",
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
    region: "Jawa Timur",
    blurb: {
      id: "Sunrise Bromo, kota dingin, dan pantai selatan yang masih sepi.",
      en: "Bromo sunrise, a cool highland city, and quiet southern beaches.",
    },
    best: { id: "Mei - September", en: "May - September" },
    budget: "Rp 1.500.000 - Rp 4.000.000",
  },
  {
    city: "Danau Toba",
    region: "Sumatera Utara",
    blurb: {
      id: "Kaldera raksasa, budaya Batak, dan ritme liburan yang santai.",
      en: "A giant caldera, Batak culture, and a genuinely slow pace.",
    },
    best: { id: "Juni - September", en: "June - September" },
    budget: "Rp 1.800.000 - Rp 4.500.000",
  },
  {
    city: "Raja Ampat",
    region: "Papua Barat Daya",
    blurb: {
      id: "Terumbu terbaik dunia dan pemandangan karst dari Piaynemo.",
      en: "World-class reefs and the karst view from Piaynemo.",
    },
    best: { id: "Oktober - April", en: "October - April" },
    budget: "Rp 8.000.000 - Rp 20.000.000",
  },
  {
    city: "Lombok",
    region: "Nusa Tenggara Barat",
    blurb: {
      id: "Pantai Kuta Mandalika, Gili, dan Rinjani untuk yang kuat jalan.",
      en: "Kuta Mandalika beaches, the Gilis, and Rinjani for strong legs.",
    },
    best: { id: "Mei - September", en: "May - September" },
    budget: "Rp 2.000.000 - Rp 6.000.000",
  },
  {
    city: "Semarang & Karimunjawa",
    region: "Jawa Tengah",
    blurb: {
      id: "Kota lama bergaya kolonial lalu menyeberang ke laut biru.",
      en: "A colonial old town, then a crossing to bright blue water.",
    },
    best: { id: "April - Oktober", en: "April - October" },
    budget: "Rp 1.500.000 - Rp 4.000.000",
  },
];

export const Route = createFileRoute("/destinasi")({
  head: () => ({
    meta: [
      { title: "Jelajah Destinasi Indonesia — Lokamate" },
      {
        name: "description",
        content:
          "Yogyakarta, Bali, Labuan Bajo, Raja Ampat, dan destinasi lokal lain: waktu terbaik berkunjung dan kisaran budget.",
      },
      { property: "og:title", content: "Jelajah Destinasi Indonesia" },
      {
        property: "og:description",
        content: "Pilih satu destinasi lokal, lalu Lokamate menyusun itinerary-nya untukmu.",
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
            className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift"
          >
            <h2 className="font-display text-xl font-bold text-foreground">{item.city}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 text-primary" />
              {item.region}
            </p>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
              {item.blurb[lang]}
            </p>
            <dl className="mt-5 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CalendarRange className="size-3.5 text-primary" />
                <dt className="text-muted-foreground">{t.destinations.best}:</dt>
                <dd className="font-semibold text-foreground">{item.best[lang]}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="size-3.5 text-primary" />
                <dt className="text-muted-foreground">{t.destinations.budget}:</dt>
                <dd className="font-semibold text-foreground">{item.budget}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" className="mt-6 rounded-full">
              <Link to="/planner">
                {t.destinations.plan}
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}

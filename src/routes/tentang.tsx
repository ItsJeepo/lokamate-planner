import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Languages, MapPin, Route as RouteIcon, Wallet } from "lucide-react";

import borobudurImage from "@/assets/lokamate-borobudur.jpg";
import bromoImage from "@/assets/lokamate-bromo.jpg";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang Lokamate.id | Perencana Liburan Indonesia" },
      {
        name: "description",
        content:
          "Lokamate.id menyusun itinerary liburan destinasi lokal Indonesia dari empat pertanyaan sederhana: gaya, kota, budget, dan lama liburan.",
      },
      { property: "og:title", content: "Tentang Lokamate.id" },
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

const copy = {
  id: {
    heroTitle: "Perencana liburan Indonesia dalam satu menit",
    heroSub:
      "Lokamate.id menyusun itinerary lengkap dari empat pertanyaan sederhana: gaya perjalanan, kota tujuan, budget, dan lama liburan.",
    whoTitle: "Apa itu Lokamate.id?",
    whoBody:
      "Lokamate.id adalah perencana liburan khusus destinasi lokal Indonesia. Kamu menjawab beberapa pertanyaan tentang gaya perjalanan, kota tujuan, titik kedatangan, jumlah rombongan, budget, dan tanggal, lalu Lokamate.id menyusun rencana harian yang rapi: aktivitas pagi, siang, dan malam, estimasi biaya per kegiatan, rekomendasi penginapan dan kuliner, sampai tips transportasi dan barang bawaan.",
    whoBody2:
      "Semua rencana tersimpan di akunmu, bisa dibuka kembali kapan pun, dan dilengkapi peta rute agar urutan perjalananmu masuk akal di lapangan.",
    statsTitle: "Lokamate.id dalam angka",
    stats: [
      { value: "98", label: "Kota dan daerah tujuan di seluruh Indonesia" },
      { value: "4", label: "Gaya perjalanan: sejarah, belanja, kuliner, alam" },
      { value: "2", label: "Bahasa: Indonesia dan Inggris" },
      { value: "±1 mnt", label: "Dari pertanyaan pertama sampai itinerary jadi" },
    ],
    whyTitle: "Kenapa Lokamate.id?",
    why: [
      {
        icon: RouteIcon,
        title: "Itinerary yang disusun khusus oleh AI",
        body: "Setiap rencana disusun khusus untuk jawabanmu, bukan salinan itinerary orang lain. Ganti gaya atau budget, rencananya ikut berubah.",
      },
      {
        icon: Wallet,
        title: "Estimasi biaya yang transparan",
        body: "Setiap aktivitas punya perkiraan harga dalam rupiah, plus rincian total perjalanan, jadi kamu tahu ke mana uangmu pergi sebelum berangkat.",
      },
      {
        icon: MapPin,
        title: "Rute yang masuk akal di peta",
        body: "Urutan aktivitas disusun agar perjalananmu efisien, dan setiap titik bisa kamu lihat langsung di peta interaktif.",
      },
      {
        icon: Languages,
        title: "Ramai untuk rombongan",
        body: "Liburan sendiri, berdua, atau sekeluarga: jumlah dewasa dan anak ikut diperhitungkan dalam rekomendasi dan estimasi biaya.",
      },
    ],
    howTitle: "Cara kerjanya",
    cta: "Mulai rencanakan liburanmu",
  },
  en: {
    heroTitle: "Your Indonesia trip planner in one minute",
    heroSub:
      "Lokamate.id builds a complete itinerary from four simple questions: travel style, destination city, budget, and trip length.",
    whoTitle: "What is Lokamate.id?",
    whoBody:
      "Lokamate.id is a trip planner focused on local Indonesian destinations. You answer a few questions about your travel style, destination, arrival point, group size, budget, and dates, then Lokamate.id builds a tidy daily plan: morning, afternoon, and evening activities, cost estimates per activity, stay and food recommendations, plus transport and packing tips.",
    whoBody2:
      "Every plan is saved to your account, ready to reopen anytime, and comes with a route map so your trip order makes sense on the ground.",
    statsTitle: "Lokamate.id in numbers",
    stats: [
      { value: "98", label: "Destination cities and regions across Indonesia" },
      { value: "4", label: "Travel styles: history, shopping, culinary, nature" },
      { value: "2", label: "Languages: Indonesian and English" },
      { value: "~1 min", label: "From the first question to a finished itinerary" },
    ],
    whyTitle: "Why Lokamate.id?",
    why: [
      {
        icon: RouteIcon,
        title: "Every itinerary built just for you by AI",
        body: "Every plan is composed for your answers, not copied from someone else's trip. Change your style or budget and the plan changes with it.",
      },
      {
        icon: Wallet,
        title: "Transparent cost estimates",
        body: "Every activity carries a price estimate in rupiah, plus a full trip breakdown, so you know where your money goes before you leave.",
      },
      {
        icon: MapPin,
        title: "Routes that make sense on the map",
        body: "Activities are ordered to keep your trip efficient, and every stop is visible on an interactive map.",
      },
      {
        icon: Languages,
        title: "Built for groups too",
        body: "Solo, as a couple, or with the whole family: adults and children are factored into recommendations and cost estimates.",
      },
    ],
    howTitle: "How it works",
    cta: "Start planning your trip",
  },
} as const;

function AboutPage() {
  const { t, lang } = useI18n();
  const c = copy[lang];

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={bromoImage}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-ink/55" aria-hidden="true" />
        <div className="mx-auto flex min-h-[420px] w-full max-w-6xl flex-col justify-center px-4 py-24 sm:px-6">
          <p className="font-display text-4xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl">
            lokamate
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-2xl font-bold text-primary-foreground sm:text-3xl">
            {c.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-primary-foreground/85">{c.heroSub}</p>
        </div>
      </section>

      {/* Who is Lokamate.id */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl shadow-lift">
            <img
              src={borobudurImage}
              alt={lang === "id" ? "Candi Borobudur, Jawa Tengah" : "Borobudur Temple, Central Java"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
              {c.whoTitle}
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">{c.whoBody}</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">{c.whoBody2}</p>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-primary py-14">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-xl font-extrabold text-primary-foreground sm:text-2xl">
            {c.statsTitle}
          </h2>
          <dl className="mt-8 grid grid-cols-2 gap-8 lg:grid-cols-4">
            {c.stats.map((stat) => (
              <div key={stat.label}>
                <dd className="font-display text-4xl font-extrabold text-primary-foreground sm:text-5xl">
                  {stat.value}
                </dd>
                <dt className="mt-2 text-sm font-medium text-primary-foreground/80">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Why Lokamate.id */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          {c.whyTitle}
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.why.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <item.icon className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
        <h2 className="font-display text-2xl font-extrabold text-foreground">{c.howTitle}</h2>
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

        <div className="mt-12">
          <Button asChild size="lg" className="rounded-full px-7 shadow-soft">
            <Link to="/planner">
              {c.cta}
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

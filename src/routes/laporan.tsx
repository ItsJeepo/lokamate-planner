import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3, CalendarDays, MapPin, RotateCcw, Wallet } from "lucide-react";
import { useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { formatIDR, useI18n, type Lang } from "@/lib/i18n";
import { filterReportRecords, summarizeItineraries, type ReportPeriod } from "@/lib/reporting";
import { listItineraries } from "@/lib/itinerary.functions";

const PERIODS = ["7", "30", "all"] as const;
const STYLE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];
const STYLE_COLOR_CLASSES = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

function isReportPeriod(value: unknown): value is ReportPeriod {
  return value === "7" || value === "30" || value === "all";
}

function styleLabel(style: string, lang: Lang): string {
  const labels: Record<string, { id: string; en: string }> = {
    santai: { id: "Santai", en: "Relaxed" },
    petualangan: { id: "Petualangan", en: "Adventure" },
    kuliner: { id: "Kuliner", en: "Food" },
    keluarga: { id: "Keluarga", en: "Family" },
    romantis: { id: "Romantis", en: "Romantic" },
    budaya: { id: "Budaya", en: "Culture" },
    hemat: { id: "Hemat", en: "Budget" },
    fotogenik: { id: "Fotogenik", en: "Photo-friendly" },
  };
  const known = labels[style.toLowerCase()];
  if (known) return lang === "id" ? known.id : known.en;
  return style ? style.charAt(0).toLocaleUpperCase() + style.slice(1) : "—";
}

function shortDate(date: string, lang: Lang): string {
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function colorForStyle(index: number): string {
  return STYLE_COLORS[index % STYLE_COLORS.length] ?? "var(--color-chart-1)";
}

function colorClassForStyle(index: number): string {
  return STYLE_COLOR_CLASSES[index % STYLE_COLOR_CLASSES.length] ?? "bg-chart-1";
}

export const Route = createFileRoute("/laporan")({
  validateSearch: (search: Record<string, unknown>) => ({
    period: isReportPeriod(search["period"]) ? search["period"] : "30",
    city:
      typeof search["city"] === "string" && search["city"].length <= 80
        ? search["city"]
        : "",
    style:
      typeof search["style"] === "string" && search["style"].length <= 40
        ? search["style"]
        : "",
  }),
  head: () => ({
    meta: [
      { title: "Laporan Perjalanan | Lokamate.id" },
      {
        name: "description",
        content: "Pantau anggaran, destinasi, dan rencana perjalanan yang tersimpan di akun Lokamate.",
      },
      { property: "og:title", content: "Laporan Perjalanan | Lokamate.id" },
      {
        property: "og:description",
        content: "Ringkasan dan grafik dari itinerary perjalanan yang tersimpan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { lang } = useI18n();
  const { session, loading } = useAuth();
  const navigate = useNavigate({ from: "/laporan" });
  const search = Route.useSearch();
  const load = useServerFn(listItineraries);
  const query = useQuery({
    queryKey: ["itinerary-report"],
    enabled: Boolean(session),
    queryFn: () => load(),
  });

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/auth", search: { next: "/laporan" }, replace: true });
    }
  }, [loading, session, navigate]);

  const copy =
    lang === "id"
      ? {
          title: "Laporan Perjalanan",
          subtitle: "Ringkasan dari rencana perjalanan yang tersimpan di akunmu.",
          period: "Periode",
          destination: "Destinasi",
          style: "Gaya liburan",
          sevenDays: "7 hari terakhir",
          thirtyDays: "30 hari terakhir",
          allData: "Semua data tersedia",
          allDestinations: "Semua destinasi",
          allStyles: "Semua gaya",
          tripCount: "Jumlah itinerary",
          plannedBudget: "Total anggaran rencana",
          averageDuration: "Rata-rata durasi",
          topDestination: "Destinasi teratas",
          budgetChart: "Anggaran per destinasi",
          budgetChartSub: "Total budget yang direncanakan",
          timelineChart: "Rencana dibuat per hari",
          timelineChartSub: "Jumlah itinerary pada periode terpilih",
          styleChart: "Gaya liburan",
          styleChartSub: "Pembagian berdasarkan itinerary",
          trips: "itinerary",
          grouped: "Ringkasan per destinasi",
          destinationColumn: "Destinasi",
          plansColumn: "Itinerary",
          budgetColumn: "Total anggaran",
          daysColumn: "Rata-rata hari",
          emptyData: "Belum ada itinerary tersimpan untuk ditampilkan.",
          emptyChart: "Grafik akan muncul setelah ada itinerary yang tersimpan.",
          emptyFilter: "Tidak ada data yang cocok. Coba ubah atau hapus filter.",
          clearFilters: "Hapus filter",
          createTrip: "Buat itinerary",
          loadError: "Laporan belum dapat dimuat.",
          retry: "Coba lagi",
          noGroups: "Belum ada pengelompokan untuk ditampilkan.",
          reportTitle: "Anggaran rencana, bukan transaksi aktual",
          reportNote: "Angka berasal dari budget itinerary yang tersimpan.",
        }
      : {
          title: "Trip Reports",
          subtitle: "A summary of the travel plans saved to your account.",
          period: "Period",
          destination: "Destination",
          style: "Travel style",
          sevenDays: "Last 7 days",
          thirtyDays: "Last 30 days",
          allData: "All available data",
          allDestinations: "All destinations",
          allStyles: "All styles",
          tripCount: "Itineraries",
          plannedBudget: "Total planned budget",
          averageDuration: "Average duration",
          topDestination: "Top destination",
          budgetChart: "Planned budget by destination",
          budgetChartSub: "Total budget across saved plans",
          timelineChart: "Plans created per day",
          timelineChartSub: "Itineraries within the selected period",
          styleChart: "Travel styles",
          styleChartSub: "Share of saved itineraries",
          trips: "itineraries",
          grouped: "Destination summary",
          destinationColumn: "Destination",
          plansColumn: "Itineraries",
          budgetColumn: "Total budget",
          daysColumn: "Average days",
          emptyData: "No saved itineraries to report yet.",
          emptyChart: "Charts appear once you have saved an itinerary.",
          emptyFilter: "No data matches these filters. Try changing or clearing them.",
          clearFilters: "Clear filters",
          createTrip: "Create an itinerary",
          loadError: "The report could not be loaded.",
          retry: "Try again",
          noGroups: "There are no groups to display yet.",
          reportTitle: "Planned budget, not actual transactions",
          reportNote: "Figures come from the budgets saved with your itineraries.",
        };

  const records = query.data ?? [];
  const filtered = filterReportRecords(records, search);
  const report = summarizeItineraries(filtered, search.period);
  const cities = Array.from(new Set(records.map((record) => record.city))).sort((a, b) =>
    a.localeCompare(b),
  );
  const styles = Array.from(new Set(records.map((record) => record.style))).sort((a, b) =>
    a.localeCompare(b),
  );
  const styleChartConfig = report.byStyle.reduce<ChartConfig>((config, item, index) => {
    const label = styleLabel(item.style, lang);
    config[label] = { label, color: colorForStyle(index) };
    return config;
  }, {});
  const budgetChartConfig = {
    totalBudget: { label: copy.plannedBudget, color: "var(--color-chart-1)" },
  } satisfies ChartConfig;
  const timelineChartConfig = {
    trips: { label: copy.tripCount, color: "var(--color-chart-3)" },
  } satisfies ChartConfig;
  const periodLabel = search.period === "7" ? copy.sevenDays : search.period === "30" ? copy.thirtyDays : copy.allData;
  const activeFilters = search.period !== "30" || Boolean(search.city) || Boolean(search.style);

  function updateSearch(patch: Partial<{ period: ReportPeriod; city: string; style: string }>) {
    void navigate({
      search: (previous) => ({ ...previous, ...patch }),
      replace: true,
    });
  }

  if (loading || (session && query.isPending)) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6" aria-busy="true" aria-label="Memuat laporan">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1, 2].map((item) => <Skeleton key={item} className="h-80" />)}
        </div>
      </div>
    );
  }

  if (!session) return null;

  if (query.isError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <BarChart3 className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-bold text-foreground">{copy.loadError}</h1>
        <Button className="mt-6" onClick={() => void query.refetch()}>{copy.retry}</Button>
      </div>
    );
  }

  const currencyCompact = (value: number) =>
    new Intl.NumberFormat(lang === "id" ? "id-ID" : "en-ID", {
      style: "currency",
      currency: "IDR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  const dailyData = report.dailySeries.map((point) => ({
    ...point,
    label: shortDate(point.date, lang),
  }));
  const pieData = report.byStyle.map((item) => ({
    label: styleLabel(item.style, lang),
    value: item.trips,
  }));
  const hasRows = filtered.length > 0;
  const chartEmptyMessage = records.length === 0 ? copy.emptyChart : copy.emptyFilter;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Lokamate · {copy.title}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-foreground sm:text-4xl">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4 text-primary" />
          <span>{periodLabel}</span>
        </div>
      </header>

      <section className="mt-8 grid gap-3 border-y border-border py-5 sm:grid-cols-2 lg:grid-cols-4" aria-label={lang === "id" ? "Filter laporan" : "Report filters"}>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground" htmlFor="report-period">{copy.period}</label>
          <Select value={search.period} onValueChange={(value) => updateSearch({ period: isReportPeriod(value) ? value : "30" })}>
            <SelectTrigger id="report-period" aria-label={copy.period}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{copy.sevenDays}</SelectItem>
              <SelectItem value="30">{copy.thirtyDays}</SelectItem>
              <SelectItem value="all">{copy.allData}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground" htmlFor="report-city">{copy.destination}</label>
          <Select value={search.city || "__all__"} onValueChange={(value) => updateSearch({ city: value === "__all__" ? "" : value })}>
            <SelectTrigger id="report-city" aria-label={copy.destination}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{copy.allDestinations}</SelectItem>
              {cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground" htmlFor="report-style">{copy.style}</label>
          <Select value={search.style || "__all__"} onValueChange={(value) => updateSearch({ style: value === "__all__" ? "" : value })}>
            <SelectTrigger id="report-style" aria-label={copy.style}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{copy.allStyles}</SelectItem>
              {styles.map((style) => <SelectItem key={style} value={style}>{styleLabel(style, lang)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          {activeFilters ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => updateSearch({ period: "30", city: "", style: "" })}
            >
              <RotateCcw className="size-4" />
              {copy.clearFilters}
            </Button>
          ) : (
            <div className="flex items-center gap-2 pb-2 text-xs text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              {cities.length} {lang === "id" ? "destinasi" : "destinations"}
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={lang === "id" ? "Ringkasan laporan" : "Report summary"}>
        <article className="rounded-md border border-border bg-card p-4 sm:p-5">
          <p className="text-xs font-semibold text-muted-foreground">{copy.tripCount}</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <strong className="font-display text-3xl text-foreground">{report.trips}</strong>
            <BarChart3 className="mb-1 size-5 text-primary" />
          </div>
        </article>
        <article className="rounded-md border border-border bg-card p-4 sm:p-5">
          <p className="text-xs font-semibold text-muted-foreground">{copy.plannedBudget}</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <strong className="font-display text-xl font-bold text-foreground sm:text-2xl">{formatIDR(report.totalBudget, lang)}</strong>
            <Wallet className="mb-1 size-5 shrink-0 text-primary" />
          </div>
        </article>
        <article className="rounded-md border border-border bg-card p-4 sm:p-5">
          <p className="text-xs font-semibold text-muted-foreground">{copy.averageDuration}</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <strong className="font-display text-3xl text-foreground">{report.averageDays}</strong>
            <span className="mb-1 text-sm text-muted-foreground">{lang === "id" ? "hari" : "days"}</span>
          </div>
        </article>
        <article className="rounded-md border border-border bg-card p-4 sm:p-5">
          <p className="text-xs font-semibold text-muted-foreground">{copy.topDestination}</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <strong className="truncate font-display text-xl font-bold text-foreground sm:text-2xl">{report.topDestination ?? "—"}</strong>
            <MapPin className="mb-1 size-5 shrink-0 text-primary" />
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2" aria-label={lang === "id" ? "Grafik laporan" : "Report charts"}>
        <article className="min-w-0 rounded-md border border-border bg-card p-4 shadow-soft sm:p-5">
          <h2 className="font-display text-lg font-bold text-foreground">{copy.budgetChart}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{copy.budgetChartSub}</p>
          {hasRows ? (
            <ChartContainer config={budgetChartConfig} className="mt-4 h-[280px] w-full aspect-auto">
              <BarChart data={report.byDestination.slice(0, 8)} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="city" axisLine={false} tickLine={false} tickMargin={8} />
                <YAxis axisLine={false} tickLine={false} width={76} tickFormatter={currencyCompact} />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent formatter={(value) => formatIDR(Number(value), lang)} />}
                />
                <Bar dataKey="totalBudget" fill="var(--color-totalBudget)" radius={4} maxBarSize={52} />
              </BarChart>
            </ChartContainer>
          ) : (
            <ChartEmpty message={chartEmptyMessage} />
          )}
        </article>

        <article className="min-w-0 rounded-md border border-border bg-card p-4 shadow-soft sm:p-5">
          <h2 className="font-display text-lg font-bold text-foreground">{copy.timelineChart}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{copy.timelineChartSub}</p>
          {hasRows ? (
            <ChartContainer config={timelineChartConfig} className="mt-4 h-[280px] w-full aspect-auto">
              <LineChart data={dailyData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  interval={Math.max(0, Math.ceil(dailyData.length / 7) - 1)}
                />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                <Tooltip content={<ChartTooltipContent />} />
                <Line dataKey="trips" type="monotone" stroke="var(--color-trips)" strokeWidth={3} dot={false} />
              </LineChart>
            </ChartContainer>
          ) : (
            <ChartEmpty message={chartEmptyMessage} />
          )}
        </article>

        <article className="min-w-0 rounded-md border border-border bg-card p-4 shadow-soft sm:p-5 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.9fr)] sm:items-center">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">{copy.styleChart}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{copy.styleChartSub}</p>
              {hasRows ? (
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
                  {report.byStyle.map((item, index) => (
                    <li key={item.style} className="flex items-center gap-2 text-sm text-foreground">
                      <span className={`size-2.5 shrink-0 rounded-full ${colorClassForStyle(index)}`} />
                      <span>{styleLabel(item.style, lang)}</span>
                      <span className="text-xs text-muted-foreground">{item.trips}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-8 text-sm text-muted-foreground">{chartEmptyMessage}</p>
              )}
            </div>
            {hasRows ? (
              <ChartContainer config={styleChartConfig} className="mx-auto h-[250px] w-full max-w-[340px] aspect-auto">
                <PieChart>
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        nameKey="label"
                        formatter={(value) => `${value} ${copy.trips}`}
                      />
                    }
                  />
                  <Pie data={pieData} dataKey="value" nameKey="label" outerRadius={92} paddingAngle={2} stroke="var(--color-background)">
                    {pieData.map((item, index) => (
                      <Cell key={item.label} fill={colorForStyle(index)} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <ChartEmpty message={chartEmptyMessage} />
            )}
          </div>
        </article>
      </section>

      <section className="mt-10" aria-labelledby="report-groups-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="report-groups-title" className="font-display text-xl font-bold text-foreground">{copy.grouped}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{copy.reportNote}</p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{copy.reportTitle}</span>
        </div>
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{copy.destinationColumn}</TableHead>
                <TableHead className="text-right">{copy.plansColumn}</TableHead>
                <TableHead className="text-right">{copy.budgetColumn}</TableHead>
                <TableHead className="text-right">{copy.daysColumn}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.byDestination.map((item) => (
                <TableRow key={item.city}>
                  <TableCell className="font-medium text-foreground">{item.city}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.trips}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatIDR(item.totalBudget, lang)}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.averageDays}</TableCell>
                </TableRow>
              ))}
              {report.byDestination.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    {records.length === 0 ? copy.emptyData : copy.noGroups}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
        {records.length === 0 ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <p className="text-sm text-muted-foreground">{copy.emptyData}</p>
            <Button asChild>
              <Link to="/planner">{copy.createTrip}</Link>
            </Button>
          </div>
        ) : null}
        {records.length > 0 && !hasRows ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <p className="text-sm text-muted-foreground">{copy.emptyFilter}</p>
            <Button variant="outline" onClick={() => updateSearch({ period: "30", city: "", style: "" })}>
              <RotateCcw className="size-4" />
              {copy.clearFilters}
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="mt-4 grid h-[280px] place-items-center rounded-md bg-surface px-5 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
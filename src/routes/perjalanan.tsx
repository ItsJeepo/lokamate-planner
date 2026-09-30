import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, Download, Loader2, MapPin, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { formatIDR, useI18n } from "@/lib/i18n";
import { exportItineraries, listItineraries } from "@/lib/itinerary.functions";

export const Route = createFileRoute("/perjalanan")({
  head: () => ({
    meta: [
      { title: "Itinerary Saya — Lokamate" },
      {
        name: "description",
        content: "Semua itinerary liburan Indonesia yang pernah kamu buat di Lokamate, tersimpan rapi.",
      },
      { property: "og:title", content: "Itinerary Saya — Lokamate" },
      { property: "og:description", content: "Buka kembali rencana liburan yang sudah kamu susun." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TripsPage,
});

function TripsPage() {
  const { t, lang } = useI18n();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const load = useServerFn(listItineraries);
  const exportAll = useServerFn(exportItineraries);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/auth", search: { next: "/perjalanan" }, replace: true });
    }
  }, [loading, session, navigate]);

  const query = useQuery({
    queryKey: ["itineraries"],
    enabled: Boolean(session),
    queryFn: () => load(),
  });

  async function handleExport() {
    setExporting(true);
    try {
      const payload = await exportAll();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lokamate-itineraries-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t.trips.exported);
    } catch (error) {
      console.error(error);
      toast.error(t.trips.exportFailed);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 2xl:max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t.trips.title}
          </h1>
          <p className="mt-3 text-muted-foreground">{t.trips.sub}</p>
        </div>
        {query.data && query.data.length > 0 ? (
          <Button
            variant="outline"
            className="rounded-full"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {t.trips.export}
          </Button>
        ) : null}
      </div>


      {query.isPending || loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : query.data && query.data.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {query.data.map((trip) => (
            <div
              key={trip.id}
              className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <div>
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
                  <MapPin className="size-4 text-primary" />
                  {trip.city}
                </h2>
                <p className="mt-2 text-sm capitalize text-muted-foreground">{trip.style}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-foreground">
                    <CalendarDays className="size-3.5 text-primary" />
                    {trip.days} {t.trips.days}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-foreground">
                    <Wallet className="size-3.5 text-primary" />
                    {formatIDR(trip.budget, lang)}
                  </span>
                </div>
              </div>
              <Button asChild className="mt-6 w-full rounded-full">
                <Link to="/itinerary/$id" params={{ id: trip.id }}>
                  {t.trips.open}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
          <p className="text-foreground">{t.trips.empty}</p>
          <Button asChild className="mt-6 rounded-full px-6">
            <Link to="/planner">
              {t.trips.create}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

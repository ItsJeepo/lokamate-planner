import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Loader2, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ItineraryDay } from "@/lib/itinerary-types";
import { cn } from "@/lib/utils";

type Point = { n: number; title: string; time: string; lat: number; lng: number };
type Stop = { n: number; title: string; time: string; found: boolean };
type Leg = { minutes: number; km: number };

const CACHE_KEY = "lokamate.geocode.v2";

function readCache(): Record<string, [number, number] | null> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

async function geocode(query: string, near?: [number, number]): Promise<[number, number] | null> {
  const key = near ? `${query}@${near[0].toFixed(2)},${near[1].toFixed(2)}` : query;
  const cache = readCache();
  if (key in cache) return cache[key] ?? null;
  // Restrict search to ~60 km box around the destination so same-named places elsewhere are ignored.
  const box = near
    ? `&bounded=1&viewbox=${near[1] - 0.6},${near[0] + 0.6},${near[1] + 0.6},${near[0] - 0.6}`
    : "";
  let data: { lat: string; lon: string }[];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=id${box}&q=${encodeURIComponent(query)}`,
    );
    if (!res.ok) throw new Error(String(res.status));
    data = (await res.json()) as { lat: string; lon: string }[];
  } catch {
    // Network/rate-limit failure: do not cache, so the next visit retries.
    await new Promise((r) => setTimeout(r, 1500));
    return null;
  }
  const query_ = key;
  const hit = data[0] ? ([Number(data[0].lat), Number(data[0].lon)] as [number, number]) : null;
  cache[query_] = hit;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
  await new Promise((r) => setTimeout(r, 1000)); // respect free geocoder limit
  return hit;
}

export default function TripMap({ days, city, lang, compact = false }: { days: ItineraryDay[]; city: string; lang: "id" | "en"; compact?: boolean }) {
  const [activeDay, setActiveDay] = useState(days[0]?.day ?? 1);
  const [points, setPoints] = useState<Point[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [legs, setLegs] = useState<Leg[]>([]);
  const [loading, setLoading] = useState(false);
  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapEl.current || map.current) return;
    map.current = L.map(mapEl.current, { scrollWheelZoom: false }).setView([-2.5, 118], 5);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const day = days.find((d) => d.day === activeDay);
    if (!day) return;
    let cancelled = false;
    const acts = [...(day.morning ?? []), ...(day.afternoon ?? []), ...(day.evening ?? [])];
    (async () => {
      setLoading(true);
      setPoints([]);
      setStops([]);
      setLegs([]);
      const mainCity = city.split(/,| dan | and /i)[0]?.trim() ?? city;
      const center = await geocode(mainCity);
      if (cancelled) return;
      const found: Point[] = [];
      const allStops: Stop[] = [];
      for (const [idx, a] of acts.entries()) {
        const titlePlace = a.title.match(/((?:Pantai|Pulau|Masjid|Museum|Pasar|Candi|Gunung|Danau|Air Terjun|Taman|Bukit|Desa|Kampung|Benteng|Pura|Keraton|Jalan|Alun-alun|Bandara|Stasiun|Pelabuhan)\s[\w\s'-]+)/i)?.[1]?.trim();
        const parts = (a.location ?? "").split(",").map((x) => x.trim()).filter(Boolean);
        const candidates = [
          a.location,
          parts.slice(0, 2).join(", "),
          parts[0],
          titlePlace,
          parts[0] && `${parts[0]}, ${mainCity}`,
          parts[1] && `${parts[1]}, ${mainCity}`,
        ].filter((c, i, arr): c is string => Boolean(c && c.length > 2) && arr.indexOf(c) === i);
        let hit: [number, number] | null = null;
        for (const c of candidates) {
          hit = await geocode(c, center ?? undefined);
          if (cancelled) return;
          if (hit) break;
        }
        if (cancelled) return;
        allStops.push({ n: idx + 1, title: a.title, time: a.time, found: Boolean(hit) });
        if (hit) found.push({ n: idx + 1, title: a.title, time: a.time, lat: hit[0], lng: hit[1] });
      }
      let legList: Leg[] = [];
      let line: [number, number][] = found.map((p) => [p.lat, p.lng]);
      if (found.length > 1) {
        try {
          const coords = found.map((p) => `${p.lng},${p.lat}`).join(";");
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
          );
          const json = await res.json();
          const route = json.routes?.[0];
          if (route) {
            line = route.geometry.coordinates.map(([x, y]: [number, number]) => [y, x]);
            legList = route.legs.map((l: { duration: number; distance: number }) => ({
              minutes: Math.max(1, Math.round(l.duration / 60)),
              km: Math.round(l.distance / 100) / 10,
            }));
          }
        } catch {
          /* fall back to straight lines */
        }
      }
      if (cancelled) return;
      setPoints(found);
      setStops(allStops);
      setLegs(legList);
      setLoading(false);

      const group = layer.current;
      const m = map.current;
      if (!group || !m) return;
      group.clearLayers();
      if (line.length > 1) {
        L.polyline(line, { color: "#08519C", weight: 9, opacity: 0.25 }).addTo(group);
        L.polyline(line, { color: "#1E7FD8", weight: 5 }).addTo(group);
      }
      found.forEach((p, i) => {
        L.marker([p.lat, p.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div style="width:32px;height:32px;border-radius:9999px;background:#08519C;color:#fff;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,.3)">${p.n}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        })
          .bindTooltip(`${p.time} · ${p.title}`, { direction: "top", offset: [0, -14] })
          .addTo(group);
        const leg = legList[i];
        const next = found[i + 1];
        if (leg && next) {
          L.marker([(p.lat + next.lat) / 2, (p.lng + next.lng) / 2], {
            icon: L.divIcon({
              className: "",
              html: `<div style="white-space:nowrap;padding:4px 10px;border-radius:10px;background:#1E7FD8;color:#fff;font-size:12px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.25);transform:translate(-50%,-50%);display:inline-block">${leg.minutes} ${lang === "id" ? "mnt" : "min"}</div>`,
              iconSize: [0, 0],
            }),
            interactive: false,
          }).addTo(group);
        }
      });
      if (found.length) m.fitBounds(L.latLngBounds(found.map((p) => [p.lat, p.lng])), { padding: [50, 50], maxZoom: 15 });
    })();
    return () => {
      cancelled = true;
    };
  }, [activeDay, days, city, lang]);

  const totalMin = legs.reduce((s, l) => s + l.minutes, 0);
  const totalKm = Math.round(legs.reduce((s, l) => s + l.km, 0) * 10) / 10;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 p-4 sm:p-5">
        {days.map((d) => (
          <Button
            key={d.day}
            type="button"
            size="sm"
            variant={activeDay === d.day ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setActiveDay(d.day)}
          >
            {lang === "id" ? "Hari" : "Day"} {d.day}
          </Button>
        ))}
        <span className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground">
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> {lang === "id" ? "Menyusun rute…" : "Building route…"}
            </>
          ) : legs.length ? (
            <>
              <Navigation className="size-4 text-primary" /> {totalKm} km · ±{totalMin} {lang === "id" ? "menit perjalanan" : "min travel"}
            </>
          ) : null}
        </span>
      </div>
      <div ref={mapEl} className={cn("relative z-0 w-full", compact ? "h-[280px] sm:h-[390px]" : "h-[420px] sm:h-[480px]")} />
      {stops.length > 0 ? (
        <ol className="grid gap-2 p-4 text-sm sm:grid-cols-2 sm:p-5">
          {stops.map((st) => {
            const pi = points.findIndex((p) => p.n === st.n);
            const leg = pi >= 0 ? legs[pi] : undefined;
            return (
              <li key={`${st.title}-${st.n}`} className={cn("flex items-center gap-2", !st.found && "opacity-60")}>
                <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", st.found ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  {st.n}
                </span>
                <span className="text-foreground">{st.title}</span>
                {!st.found ? (
                  <span className="ml-auto text-xs text-muted-foreground">{lang === "id" ? "tidak ada di peta" : "not on map"}</span>
                ) : leg && pi < points.length - 1 ? (
                  <span className="ml-auto text-xs text-muted-foreground">→ {leg.minutes} {lang === "id" ? "mnt" : "min"}</span>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Loader2, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ItineraryDay } from "@/lib/itinerary-types";
import { cn } from "@/lib/utils";

type Point = { title: string; time: string; lat: number; lng: number };
type Leg = { minutes: number; km: number };

const CACHE_KEY = "lokamate.geocode";

function readCache(): Record<string, [number, number] | null> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

async function geocode(query: string): Promise<[number, number] | null> {
  const cache = readCache();
  if (query in cache) return cache[query] ?? null;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=id&q=${encodeURIComponent(query)}`,
  );
  const data = (await res.json()) as { lat: string; lon: string }[];
  const hit = data[0] ? ([Number(data[0].lat), Number(data[0].lon)] as [number, number]) : null;
  cache[query] = hit;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
  await new Promise((r) => setTimeout(r, 1000)); // respect free geocoder limit
  return hit;
}

export default function TripMap({ days, city, lang }: { days: ItineraryDay[]; city: string; lang: "id" | "en" }) {
  const [activeDay, setActiveDay] = useState(days[0]?.day ?? 1);
  const [points, setPoints] = useState<Point[]>([]);
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
      setLegs([]);
      const found: Point[] = [];
      for (const a of acts) {
        const mainCity = city.split(/,| dan | and /i)[0]?.trim() ?? city;
        const titlePlace = a.title.match(/((?:Pantai|Pulau|Masjid|Museum|Pasar|Candi|Gunung|Danau|Air Terjun|Taman|Bukit|Desa|Kampung|Benteng|Pura|Keraton|Jalan|Alun-alun)\s[\w\s'-]+)/i)?.[1]?.trim();
        const candidates = [
          a.location,
          a.location.split(",")[0]?.trim(),
          titlePlace,
          titlePlace && `${titlePlace}, ${mainCity}`,
          `${a.location.split(",")[0]?.trim()}, ${mainCity}`,
        ].filter((c, i, arr): c is string => Boolean(c && c.length > 2) && arr.indexOf(c) === i);
        let hit: [number, number] | null = null;
        for (const c of candidates) {
          hit = await geocode(c);
          if (cancelled) return;
          if (hit) break;
        }
        if (cancelled) return;
        if (hit) found.push({ title: a.title, time: a.time, lat: hit[0], lng: hit[1] });
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
            html: `<div style="width:32px;height:32px;border-radius:9999px;background:#08519C;color:#fff;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,.3)">${i + 1}</div>`,
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
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
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
      <div ref={mapEl} className={cn("relative z-0 h-[420px] w-full sm:h-[480px]")} />
      {points.length > 0 ? (
        <ol className="grid gap-2 p-4 text-sm sm:grid-cols-2 sm:p-5">
          {points.map((p, i) => (
            <li key={`${p.title}-${i}`} className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-foreground">{p.title}</span>
              {legs[i] ? (
                <span className="ml-auto text-xs text-muted-foreground">→ {legs[i].minutes} {lang === "id" ? "mnt" : "min"}</span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

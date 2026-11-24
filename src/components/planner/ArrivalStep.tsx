import { Check, Plane, Ship, TrainFront } from "lucide-react";

import { hubsFor, type ArrivalMode } from "@/lib/arrival-hubs";
import { cn } from "@/lib/utils";

const MODES: { id: ArrivalMode; icon: typeof Plane; id_: string; en: string }[] = [
  { id: "airport", icon: Plane, id_: "Bandara", en: "Airport" },
  { id: "station", icon: TrainFront, id_: "Stasiun", en: "Train station" },
  { id: "harbor", icon: Ship, id_: "Pelabuhan", en: "Harbor" },
];

export function ArrivalStep({
  lang,
  city,
  mode,
  hub,
  onChange,
}: {
  lang: "id" | "en";
  city: string;
  mode: ArrivalMode | "";
  hub: string;
  onChange: (mode: ArrivalMode, hub: string) => void;
}) {
  const id = lang === "id";
  const hubs = mode ? hubsFor(city, mode) : [];
  return (
    <div className="flex flex-1 flex-col py-8">
      <h1 className="text-center font-display text-3xl font-extrabold text-foreground">
        {id ? `Kamu tiba di ${city} lewat mana?` : `How will you arrive in ${city}?`}
      </h1>
      <p className="mt-3 text-center text-muted-foreground">
        {id ? "Pilih jenis kedatangan, lalu titik tibanya." : "Pick how you arrive, then where."}
      </p>
      <div className="mt-7 grid grid-cols-3 gap-3">
        {MODES.map((m) => {
          const available = hubsFor(city, m.id).length > 0;
          const active = mode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              disabled={!available}
              aria-pressed={active}
              onClick={() => onChange(m.id, "")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 bg-card px-2 py-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
                active ? "border-primary bg-secondary text-primary" : "border-border text-foreground hover:border-primary/50",
              )}
            >
              <Icon className="size-6" />
              {id ? m.id_ : m.en}
            </button>
          );
        })}
      </div>
      {mode ? (
        <div className="mt-5 space-y-2" role="listbox" aria-label={id ? "Titik kedatangan" : "Arrival point"}>
          <p className="text-sm font-semibold text-foreground">
            {id ? `Pilih di ${city}:` : `Choose in ${city}:`}
          </p>
          {hubs.map((h) => {
            const sel = hub === h;
            return (
              <button
                key={h}
                type="button"
                role="option"
                aria-selected={sel}
                onClick={() => onChange(mode, h)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition",
                  sel ? "border-primary bg-secondary font-semibold text-primary" : "border-border hover:bg-muted",
                )}
              >
                {h}
                {sel ? <Check className="size-4" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

import { Minus, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

function Counter({ label, sub, value, min, onChange }: { label: string; sub: string; value: number; min: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-4">
      <div>
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="icon" className="rounded-full" aria-label={`- ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
          <Minus />
        </Button>
        <span className="w-6 text-center font-display text-lg font-bold">{value}</span>
        <Button type="button" variant="outline" size="icon" className="rounded-full" aria-label={`+ ${label}`} disabled={value >= 20} onClick={() => onChange(value + 1)}>
          <Plus />
        </Button>
      </div>
    </div>
  );
}

export function TravelersStep({ lang, adults, children, onChange }: { lang: "id" | "en"; adults: number; children: number; onChange: (a: number, c: number) => void }) {
  const id = lang === "id";
  return (
    <div className="flex flex-1 flex-col py-8">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
        <Users className="size-7" />
      </div>
      <h1 className="mt-6 text-center font-display text-3xl font-extrabold text-foreground">
        {id ? "Berlibur bersama berapa orang?" : "How many people are travelling?"}
      </h1>
      <p className="mt-3 text-center text-muted-foreground">
        {id ? "Termasuk kamu sendiri. Minimal 1 orang dewasa." : "Including yourself. At least 1 adult."}
      </p>
      <div className="mt-7 space-y-3">
        <Counter label={id ? "Dewasa" : "Adults"} sub={id ? "Usia 13 tahun ke atas" : "Age 13+"} value={adults} min={0} onChange={(v) => onChange(v, children)} />
        <Counter label={id ? "Anak-anak" : "Children"} sub={id ? "Usia 0–12 tahun" : "Age 0–12"} value={children} min={0} onChange={(v) => onChange(adults, v)} />
      </div>
      {adults < 1 ? (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {id ? "Minimal harus ada 1 orang dewasa." : "At least 1 adult is required."}
        </p>
      ) : null}
    </div>
  );
}

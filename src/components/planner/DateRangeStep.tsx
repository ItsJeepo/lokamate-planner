import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  lang: string;
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
};

const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1);
};

export function DateRangeStep({ lang, start, end, onChange }: Props) {
  const locale = lang === "en" ? "en-GB" : "id-ID";
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayKey = toKey(today);
  const initial = start ? fromKey(start) : today;
  const [view, setView] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const minView = new Date(today.getFullYear(), today.getMonth(), 1);
  const canPrev = view > minView;

  const weekdays = useMemo(() => {
    const base = new Date(2024, 0, 1); // Monday
    return Array.from({ length: 7 }, (_, i) =>
      new Date(base.getFullYear(), 0, 1 + i).toLocaleDateString(locale, { weekday: "short" }),
    );
  }, [locale]);

  const fmt = (k: string) =>
    k
      ? fromKey(k).toLocaleDateString(locale, { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
      : "—";

  function pick(k: string) {
    if (!start || (start && end) || k < start) onChange(k, "");
    else if (k === start) onChange(k, "");
    else onChange(start, k);
  }

  const nights = start && end ? Math.round((fromKey(end).getTime() - fromKey(start).getTime()) / 86400000) : 0;

  function Month({ month, className }: { month: Date; className?: string }) {
    const y = month.getFullYear();
    const m = month.getMonth();
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;
    const count = new Date(y, m + 1, 0).getDate();
    const cells: (Date | null)[] = [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: count }, (_, i) => new Date(y, m, i + 1)),
    ];
    return (
      <div className={className}>
        <p className="mb-3 px-1 font-display text-base font-bold text-foreground">
          {month.toLocaleDateString(locale, { month: "long", year: "numeric" })}
        </p>
        <div className="grid grid-cols-7 border-b border-border pb-2 text-center text-xs text-muted-foreground">
          {weekdays.map((w, i) => (
            <span key={w} className={cn(i === 6 && "text-destructive")}>{w}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-y-1 text-sm">
          {cells.map((d, i) => {
            if (!d) return <span key={`e${i}`} />;
            const k = toKey(d);
            const past = k < todayKey;
            const isStart = k === start;
            const isEnd = k === end;
            const inRange = start && end && k > start && k < end;
            const sunday = d.getDay() === 0;
            return (
              <div
                key={k}
                className={cn(
                  "flex h-10 items-center justify-center",
                  inRange && "bg-primary",
                  isStart && end && "rounded-l-full bg-primary",
                  isEnd && "rounded-r-full bg-primary",
                )}
              >
                <button
                  type="button"
                  disabled={past}
                  onClick={() => pick(k)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                    past && "cursor-not-allowed text-muted-foreground/40",
                    !past && !inRange && !isStart && !isEnd && "hover:bg-primary/10",
                    !past && sunday && !inRange && "text-destructive",
                    inRange && "text-primary-foreground",
                    (isStart || isEnd) && "border-2 border-primary bg-background font-bold text-primary",
                    k === todayKey && !isStart && !isEnd && "underline underline-offset-4 font-semibold",
                  )}
                >
                  {d.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const next = new Date(view.getFullYear(), view.getMonth() + 1, 1);

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {lang === "en" ? "When is your holiday?" : "Kapan liburanmu?"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {lang === "en" ? "Pick your arrival and departure dates." : "Pilih tanggal berangkat dan pulang."}
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="grid grid-cols-2 border-b border-border">
          <div className="p-4">
            <p className="text-xs text-muted-foreground">{lang === "en" ? "Departure" : "Berangkat"}</p>
            <p className="text-sm font-bold text-foreground">{fmt(start)}</p>
          </div>
          <div className="border-l border-border p-4">
            <p className="text-xs text-muted-foreground">{lang === "en" ? "Return" : "Pulang"}</p>
            <p className="text-sm font-bold text-foreground">{fmt(end)}</p>
          </div>
        </div>
        <div className="relative p-4">
          <div className="absolute right-4 top-3 flex gap-1">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canPrev}
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              className="rounded-full p-1.5 text-primary hover:bg-primary/10 disabled:text-muted-foreground/40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setView(next)}
              className="rounded-full p-1.5 text-primary hover:bg-primary/10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Month month={view} />
            <Month month={next} className="hidden sm:block" />
          </div>
        </div>
        {nights > 0 ? (
          <div className="bg-primary px-4 py-3 text-center font-display text-lg font-bold text-primary-foreground">
            {nights + 1} {lang === "en" ? "days" : "hari"} · {nights} {lang === "en" ? "nights" : "malam"}
          </div>
        ) : null}
      </div>
    </div>
  );
}

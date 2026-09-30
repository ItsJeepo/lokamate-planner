import { Loader2, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

export const CURRENCIES = [
  { code: "IDR", name: "Rupiah Indonesia" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "MYR", name: "Ringgit Malaysia" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "KRW", name: "Korean Won" },
] as const;

type Rates = Record<string, number>; // currency -> IDR per 1 unit

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export function BudgetStep({
  lang,
  currency,
  amount,
  onCurrency,
  onAmount,
  onIdr,
}: {
  lang: "id" | "en";
  currency: string;
  amount: string;
  onCurrency: (c: string) => void;
  onAmount: (a: string) => void;
  onIdr: (v: number) => void;
}) {
  const [rates, setRates] = useState<Rates | null>(null);
  const [date, setDate] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const symbols = CURRENCIES.map((c) => c.code).filter((c) => c !== "USD").join(",");
    fetch(`https://api.frankfurter.dev/v1/latest?base=USD&symbols=${symbols}`)
      .then((r) => r.json())
      .then((d: { date: string; rates: Record<string, number> }) => {
        const idrPerUsd = d.rates["IDR"];
        if (!idrPerUsd) throw new Error("no rate");
        const next: Rates = { IDR: 1, USD: idrPerUsd };
        for (const [code, v] of Object.entries(d.rates)) if (code !== "IDR") next[code] = idrPerUsd / v;
        setRates(next);
        setDate(d.date);
      })
      .catch(() => setFailed(true));
  }, []);

  const rate = rates?.[currency] ?? (currency === "IDR" ? 1 : 0);
  const value = Number(amount) || 0;
  const converted = Math.round(value * rate);

  useEffect(() => onIdr(converted), [converted, onIdr]);

  const en = lang === "en";

  return (
    <div className="flex flex-1 flex-col py-8">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
        <Wallet className="size-7" />
      </div>
      <h1 className="mt-6 text-center font-display text-3xl font-extrabold text-foreground">
        {en ? "What's your budget?" : "Berapa budget liburanmu?"}
      </h1>
      <p className="mt-3 text-center text-muted-foreground">
        {en
          ? "Enter it in your own currency — we'll convert it to Rupiah automatically."
          : "Masukkan dalam mata uangmu, kami konversi otomatis ke Rupiah."}
      </p>

      <div className="mt-7 overflow-hidden rounded-2xl border border-input bg-background shadow-sm">
        {/* Budget */}
        <div className="px-4 py-4">
          <label htmlFor="budget" className="text-sm font-semibold text-foreground">
            {en ? "Total budget" : "Total budget"}
          </label>
          <div className="mt-2 flex h-12 overflow-hidden rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
            <Input
              id="budget"
              inputMode="decimal"
              value={amount}
              placeholder="0"
              onChange={(e) => onAmount(e.target.value.replace(/[^\d.]/g, ""))}
              className="h-full flex-1 rounded-none border-0 px-4 text-base shadow-none focus-visible:ring-0"
            />
            <select
              aria-label={en ? "Change currency" : "Ubah mata uang"}
              value={currency}
              onChange={(e) => onCurrency(e.target.value)}
              className="border-l border-input bg-muted px-3 text-sm font-bold text-foreground focus-visible:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          {/* Kurs — realtime di bawah total budget */}
          <div className="mt-3 rounded-lg bg-secondary px-4 py-2.5 text-sm text-secondary-foreground">
            {failed && currency !== "IDR" ? (
              en ? "Exchange rate unavailable right now. Try again later." : "Kurs belum bisa dimuat. Coba lagi nanti."
            ) : !rates && currency !== "IDR" ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> {en ? "Loading rate…" : "Memuat kurs…"}
              </span>
            ) : (
              <>
                <span className="font-bold">1 {currency} = {idr(rate)}</span>
                {date ? (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({en ? "official ECB rate" : "kurs resmi ECB"}, {date})
                  </span>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Hasil konversi */}
        <div className="bg-primary px-4 py-4 text-center">
          {value > 0 && rate > 0 ? (
            <p className="font-display text-2xl font-extrabold text-primary-foreground sm:text-3xl">
              ≈ {idr(converted)}
            </p>
          ) : (
            <p className="text-sm font-medium text-primary-foreground/80">
              {en ? "Enter your budget to see it in Rupiah" : "Isi budget untuk melihat jumlah Rupiah"}
            </p>
          )}
        </div>
      </div>

      {value > 0 && rate > 0 && converted < 1_000_000 ? (
        <p className="mt-3 text-center text-sm font-semibold text-destructive" role="alert">
          {en
            ? "Minimum budget is Rp 1.000.000 to continue."
            : "Budget minimal Rp 1.000.000 untuk melanjutkan."}
        </p>
      ) : null}
    </div>
  );
}

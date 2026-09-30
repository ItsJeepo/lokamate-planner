import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useI18n, formatIDR } from "@/lib/i18n";
import { DRAFT_KEY } from "@/lib/itinerary-types";
import { cn } from "@/lib/utils";

const POPULAR = ["Yogyakarta", "Bali", "Bandung", "Labuan Bajo", "Malang", "Danau Toba"];
const BUDGET_PRESETS = [1000000, 2500000, 5000000, 10000000];

export function TripForm() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [step, setStep] = useState(0);
  const [style, setStyle] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState(3);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const budgetNumber = Number(budget.replace(/\D/g, "")) || 0;

  function validate(current: number) {
    if (current === 0 && !style) return t.form.errors.style;
    if (current === 1 && city.trim().length < 2) return t.form.errors.city;
    if (current === 2 && budgetNumber < 100000) return t.form.errors.budget;
    if (current === 3 && (days < 1 || days > 14)) return t.form.errors.days;
    return "";
  }

  function next() {
    const message = validate(step);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((s) => Math.min(3, s + 1));
  }

  function submit() {
    for (let i = 0; i <= 3; i += 1) {
      const message = validate(i);
      if (message) {
        setError(message);
        setStep(i);
        return;
      }
    }
    setError("");
    const draft = { style, city: city.trim(), budget: budgetNumber, days, notes: notes.trim(), lang };
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
    if (session) navigate({ to: "/membuat" });
    else navigate({ to: "/auth", search: { next: "/membuat" } });
  }

  return (
    <div id="rencana" className="scroll-mt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t.form.heading}
        </h2>
        <p className="mt-3 text-muted-foreground">{t.form.sub}</p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-lift sm:p-9">
        <ol className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2">
          {t.form.steps.map((label, index) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-bold",
                  index <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  index === step ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              {index < 3 ? <span className="hidden h-px w-6 bg-border sm:block" /> : null}
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <div className="space-y-4">
            <Label className="text-base">{t.form.styleLabel}</Label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {t.form.styles.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setStyle(option.id);
                    setError("");
                  }}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all hover:border-primary/60 hover:shadow-soft",
                    style === option.id
                      ? "border-primary bg-secondary shadow-soft"
                      : "border-border bg-background",
                  )}
                >
                  <span className="block text-sm font-bold text-foreground">{option.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{option.desc}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <Label htmlFor="city" className="text-base">
              {t.form.cityLabel}
            </Label>
            <Input
              id="city"
              value={city}
              placeholder={t.form.cityPlaceholder}
              onChange={(event) => {
                setCity(event.target.value);
                setError("");
              }}
              className="h-12 rounded-xl text-base"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{t.form.cityPopular}</span>
              {POPULAR.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCity(item);
                    setError("");
                  }}
                  className="rounded-full border border-border px-3 py-1 text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <Label htmlFor="budget" className="text-base">
              {t.form.budgetLabel}
            </Label>
            <Input
              id="budget"
              inputMode="numeric"
              value={budget}
              placeholder={t.form.budgetPlaceholder}
              onChange={(event) => {
                setBudget(event.target.value.replace(/\D/g, ""));
                setError("");
              }}
              className="h-12 rounded-xl text-base"
            />
            {budgetNumber > 0 ? (
              <p className="text-sm font-semibold text-primary">{formatIDR(budgetNumber, lang)}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {BUDGET_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setBudget(String(preset));
                    setError("");
                  }}
                  className="rounded-full border border-border px-3 py-1 text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {formatIDR(preset, lang)}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{t.form.budgetHelp}</p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base">{t.form.daysLabel}</Label>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 14 }, (_, index) => index + 1).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDays(value)}
                    className={cn(
                      "size-11 rounded-xl border text-sm font-semibold transition-colors",
                      days === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/60",
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {days} {t.form.day}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base">
                {t.form.notesLabel}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                placeholder={t.form.notesPlaceholder}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-24 rounded-xl"
                maxLength={500}
              />
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-5 text-sm font-medium text-destructive">{error}</p> : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-full"
          >
            <ArrowLeft className="mr-1 size-4" />
            {t.form.back}
          </Button>

          {step < 3 ? (
            <Button type="button" onClick={next} className="rounded-full px-6 shadow-soft">
              {t.form.next}
              <ArrowRight className="ml-1 size-4" />
            </Button>
          ) : (
            <Button type="button" onClick={submit} size="lg" className="rounded-full px-7 shadow-lift">
              <Sparkles className="mr-2 size-4" />
              {t.form.submit}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

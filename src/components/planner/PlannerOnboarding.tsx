import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Compass,
  LogIn,
  MapPin,
  MapPinned,
  MessageCircle,
  Route,
  Search,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { DESTINATIONS } from "@/lib/destinations";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ArrivalStep } from "./ArrivalStep";
import { BudgetStep } from "./BudgetStep";
import { TravelersStep } from "./TravelersStep";
import type { ArrivalMode } from "@/lib/arrival-hubs";
import { hubsFor } from "@/lib/arrival-hubs";
import { DateRangeStep } from "./DateRangeStep";
import culinaryImg from "@/assets/style-kuliner.jpg";
import historyImg from "@/assets/style-historikal.jpg";
import sceneryImg from "@/assets/style-scenery.jpg";
import shoppingImg from "@/assets/style-shopping.jpg";

const STORAGE_KEY = "lokamate.planner-profile";

const INTRO_STEP_ICONS = [Compass, Route, MessageCircle, MapPinned] as const;


const TRAVEL_STYLES = [
  { id: "history", image: historyImg },
  { id: "shopping", image: shoppingImg },
  { id: "culinary", image: culinaryImg },
  { id: "scenery", image: sceneryImg },
] as const;
type TravelStyle = (typeof TRAVEL_STYLES)[number]["id"];


type SavedPlannerProfile = { nickname?: string; destination?: string; styles?: TravelStyle[]; currency?: string; amount?: string; budgetIdr?: number; startDate?: string; endDate?: string; arrivalMode?: ArrivalMode; arrivalHub?: string; adults?: number; children?: number };

export function PlannerOnboarding({ initialDestination }: { initialDestination?: string | undefined }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { session } = useAuth();
  const loggedIn = Boolean(session);
  const lastStep = loggedIn ? 10 : 11;
  const presetDestination = initialDestination && DESTINATIONS.some((d) => d.city === initialDestination) ? initialDestination : "";
  const skipDestination = Boolean(presetDestination);
  const total = lastStep + 1 - (skipDestination ? 1 : 0);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const [nickname, setNickname] = useState("");
  const [destination, setDestination] = useState(presetDestination);
  const [query, setQuery] = useState("");
  const [destinationOpen, setDestinationOpen] = useState(true);
  const [styles, setStyles] = useState<TravelStyle[]>([]);
  const [currency, setCurrency] = useState("IDR");
  const [amount, setAmount] = useState("");
  const [budgetIdr, setBudgetIdr] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [arrivalMode, setArrivalMode] = useState<ArrivalMode | "">("");
  const [arrivalHub, setArrivalHub] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const handleIdr = useCallback((v: number) => setBudgetIdr(v), []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const profile = JSON.parse(raw) as SavedPlannerProfile;
      setNickname(profile.nickname ?? "");
      setDestination(profile.destination ?? "");
      if (profile.currency) setCurrency(profile.currency);
      if (profile.amount) setAmount(profile.amount);
      if (profile.startDate) setStartDate(profile.startDate);
      if (profile.endDate) setEndDate(profile.endDate);
      if (profile.arrivalMode) setArrivalMode(profile.arrivalMode);
      if (profile.arrivalHub) setArrivalHub(profile.arrivalHub);
      if (typeof profile.adults === "number") setAdults(profile.adults);
      if (typeof profile.children === "number") setChildren(profile.children);
      if (Array.isArray(profile.styles)) setStyles(profile.styles.filter((s) => TRAVEL_STYLES.some((o) => o.id === s)));
    } catch {
      // A fresh planner is fine if browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ nickname, destination, styles, currency, amount, budgetIdr, startDate, endDate, arrivalMode, arrivalHub, adults, children }));
    } catch {
      // The flow remains usable without browser storage.
    }
  }, [nickname, destination, styles, currency, amount, budgetIdr, startDate, endDate, arrivalMode, arrivalHub, adults, children]);

  const filteredDestinations = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("id");
    if (!normalized) return DESTINATIONS;
    return DESTINATIONS.filter(({ city, region }) =>
      `${city} ${region}`.toLocaleLowerCase("id").includes(normalized),
    );
  }, [query]);

  function moveTo(nextStep: number, nextDirection: "forward" | "back") {
    setDirection(nextDirection);
    let target = Math.max(0, Math.min(lastStep, nextStep));
    // Destination is pre-selected from the destinations page, so skip that question.
    if (skipDestination && target === 5) target = nextDirection === "forward" ? 6 : 4;
    setStep(target);
  }


  const MIN_BUDGET_IDR = 1_000_000;

  const canContinue =
    step < 4 ||
    (step === 4
      ? nickname.trim().length >= 2
      : step === 5
        ? Boolean(destination)
        : step === 6
          ? Boolean(arrivalMode && arrivalHub && hubsFor(destination, arrivalMode).includes(arrivalHub))
          : step === 7
            ? adults >= 1
            : step === 8
          ? styles.length > 0
          : step === 9
            ? budgetIdr >= MIN_BUDGET_IDR
            : step === 10
              ? Boolean(startDate && endDate)
              : true);

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface px-0 py-0 sm:px-6 sm:py-12">
      <div className={cn(step === 10 ? "max-w-3xl" : "max-w-xl", "flex min-h-[calc(100vh-4rem)] w-full flex-col transition-[max-width] bg-card px-5 py-6 sm:min-h-[720px] sm:rounded-2xl sm:border sm:border-border sm:px-8 sm:py-7 sm:shadow-lift")}>
        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => moveTo(step - 1, "back")}
            disabled={step === 0}
            className="-ml-2 min-w-24 justify-start"
          >
            <ArrowLeft />
            {t.planner.back}
          </Button>
          <span className="text-xs font-semibold text-muted-foreground">
            {t.planner.stepCounter.replace("{current}", String(step + 1 - (skipDestination && step > 5 ? 1 : 0))).replace("{total}", String(total))}
          </span>

        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>

        <div key={step} className={cn("flex flex-1 flex-col", direction === "forward" ? "planner-step-forward" : "planner-step-back")}>
          {step < 4 && t.planner.introSteps[step] ? (
            <IntroStep step={t.planner.introSteps[step]} support={t.planner.introSupport} icon={INTRO_STEP_ICONS[step] ?? Compass} />
          ) : null}
          {step === 4 ? (
            <div className="flex flex-1 flex-col justify-center py-10 text-center">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-secondary text-primary">
                <UserRound className="size-9" />
              </div>
              <h1 className="mt-8 font-display text-3xl font-extrabold text-foreground">{t.planner.nickname.title}</h1>
              <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted-foreground">
                {t.planner.nickname.description}
              </p>
              <label htmlFor="nickname" className="mt-8 text-left text-sm font-semibold text-foreground">
                {t.planner.nickname.label}
              </label>
              <Input
                id="nickname"
                autoFocus
                value={nickname}
                maxLength={40}
                placeholder={t.planner.nickname.placeholder}
                onChange={(event) => setNickname(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && nickname.trim().length >= 2) moveTo(5, "forward");
                }}
                className="mt-2 h-12 rounded-lg px-4 text-base"
              />
              {nickname.length > 0 && nickname.trim().length < 2 ? (
                <p className="mt-2 text-left text-xs text-destructive">{t.planner.nickname.error}</p>
              ) : null}
            </div>
          ) : null}
          {step === 5 ? (
            <div className="flex flex-1 flex-col py-8">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
                <MapPin className="size-7" />
              </div>
              <h1 className="mt-6 text-center font-display text-3xl font-extrabold text-foreground">
                {t.planner.destination.title.replace("{name}", nickname.trim() || t.planner.destination.fallbackName)}
              </h1>
              <p className="mt-3 text-center text-muted-foreground">{t.planner.destination.description}</p>

              <div className="relative mt-7">
                <Button
                  type="button"
                  variant="outline"
                  aria-expanded={destinationOpen}
                  onClick={() => setDestinationOpen((current) => !current)}
                  className="h-12 w-full justify-between rounded-lg px-4 text-left text-sm"
                >
                  <span className={destination ? "text-foreground" : "text-muted-foreground"}>
                    {destination || t.planner.destination.select}
                  </span>
                  <ChevronDown className={cn("transition-transform", destinationOpen && "rotate-180")} />
                </Button>

                {destinationOpen ? (
                  <div className="mt-2 overflow-hidden rounded-lg border border-border bg-popover shadow-lift">
                    <div className="relative border-b border-border p-3">
                      <Search className="absolute left-6 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={t.planner.destination.search}
                        aria-label={t.planner.destination.search}
                        className="h-10 rounded-md pl-9"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1.5" role="listbox" aria-label={t.planner.destination.listLabel}>
                      {filteredDestinations.map((item) => {
                        const selected = destination === item.city;
                        return (
                          <Button
                            key={item.city}
                            type="button"
                            variant="ghost"
                            role="option"
                            aria-selected={selected}
                            onClick={() => {
                              setDestination(item.city); if (item.city !== destination) { setArrivalMode(""); setArrivalHub(""); }
                              setDestinationOpen(false);
                            }}
                            className={cn(
                              "h-auto w-full justify-start rounded-md px-3 py-2.5 text-left",
                              selected && "bg-secondary text-secondary-foreground",
                            )}
                          >
                            <span className="text-xl" aria-hidden="true">{item.icon}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-semibold">{item.city}</span>
                              <span className="block truncate text-xs font-normal text-muted-foreground">{item.region}</span>
                            </span>
                            {selected ? <Check className="ml-auto text-primary" /> : null}
                          </Button>
                        );
                      })}
                      {filteredDestinations.length === 0 ? (
                        <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t.planner.destination.empty}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

            </div>
          ) : null}
          {step === 6 ? (
            <ArrivalStep
              lang={lang}
              city={destination}
              mode={arrivalMode}
              hub={arrivalHub}
              onChange={(m, h) => { setArrivalMode(m); setArrivalHub(h); }}
            />
          ) : null}
          {step === 7 ? (
            <TravelersStep
              lang={lang}
              adults={adults}
              children={children}
              onChange={(a, c) => { setAdults(a); setChildren(c); }}
            />
          ) : null}
          {step === 8 ? (
            <div className="flex flex-1 flex-col py-8">
              <h1 className="text-center font-display text-3xl font-extrabold text-foreground">
                {t.planner.styles.title.replace("{city}", destination)}
              </h1>
              <p className="mt-3 text-center text-muted-foreground">{t.planner.styles.description}</p>
              <div className="mt-7 grid grid-cols-2 gap-3" role="group" aria-label={t.planner.styles.description}>
                {TRAVEL_STYLES.map((item) => {
                  const active = styles.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setStyles((cur) => (cur.includes(item.id) ? cur.filter((s) => s !== item.id) : [...cur, item.id]));
                      }}
                      className={cn(
                        "group relative aspect-[4/3] overflow-hidden rounded-xl border-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active ? "border-primary shadow-lift" : "border-transparent",
                      )}
                    >
                      <img src={item.image} alt="" loading="lazy" width={1024} height={768} className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                      <span className="absolute bottom-3 left-3 font-display text-lg font-bold text-primary-foreground">
                        {t.planner.styles.options[item.id]}
                      </span>
                      <span className={cn("absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full border-2 border-primary-foreground transition", active ? "bg-primary" : "bg-ink/30")}>
                        {active ? <Check className="size-4 text-primary-foreground" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
                {t.planner.styles.selectedCount.replace("{count}", String(styles.length))}
              </p>
            </div>
          ) : null}
          {step === 9 ? (
            <>
              <BudgetStep
                lang={lang}
                currency={currency}
                amount={amount}
                onCurrency={(c) => { setCurrency(c); }}
                onAmount={(a) => { setAmount(a); }}
                onIdr={handleIdr}
              />
            </>
          ) : null}
          {step === 10 ? (
            <>
              <DateRangeStep
                lang={lang}
                start={startDate}
                end={endDate}
                onChange={(a, b) => { setStartDate(a); setEndDate(b); }}
              />
            </>
          ) : null}
          {step === 11 && !loggedIn ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-secondary text-primary">
                <LogIn className="size-9" />
              </div>
              <h1 className="mt-8 font-display text-3xl font-extrabold text-foreground">{t.planner.loginStep.title}</h1>
              <p className="mt-4 font-display text-lg font-bold text-primary sm:text-xl">{t.planner.loginStep.message}</p>
              <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted-foreground">{t.planner.loginStep.description}</p>
            </div>
          ) : null}
        </div>

        <Button
          type="button"
          size="lg"
          disabled={!canContinue}
          onClick={() => {
            if (step < lastStep) {
              moveTo(step + 1, "forward");
              return;
            }
            const days = Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000) + 1);
            const draft = {
              style: styles.join(", "),
              city: destination,
              budget: budgetIdr,
              days: Math.min(days, 14),
              notes: `${nickname.trim()} · ${startDate} – ${endDate} · ${arrivalHub} · ${adults} dewasa, ${children} anak`,
              lang,
              nickname: nickname.trim() || undefined,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
              arrivalMode: arrivalMode || undefined,
              arrivalHub: arrivalHub || undefined,
              adults,
              children,
            };
            try {
              window.localStorage.setItem("tripmate.draft", JSON.stringify(draft));
            } catch {
              /* ignore */
            }
            if (!loggedIn) {
              navigate({ to: "/auth", search: { next: "/membuat" } });
              return;
            }
            navigate({ to: "/membuat" });
          }}
          className="mt-6 h-12 w-full rounded-lg text-base font-bold shadow-soft"
        >
          {step === lastStep && !loggedIn ? t.planner.loginStep.button : step === lastStep ? t.destinations.plan : t.planner.next}
          {step === lastStep && !loggedIn ? <LogIn /> : <ArrowRight />}
        </Button>

      </div>
    </section>
  );
}

function IntroStep({
  step,
  support,
  icon: Icon,
}: {
  step: { title: string; description: string; visualTitle: string; visualItems: readonly string[] };
  support: string;
  icon: typeof Compass;
}) {
  return (
    <div className="flex flex-1 flex-col justify-between py-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 items-center justify-center">
        <div className="w-full rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-foreground">{step.visualTitle}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{support}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {step.visualItems.map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pt-9 text-center">
        <h1 className="text-balance font-display text-3xl font-extrabold leading-tight text-foreground">{step.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-balance leading-relaxed text-muted-foreground">{step.description}</p>
      </div>
    </div>
  );
}

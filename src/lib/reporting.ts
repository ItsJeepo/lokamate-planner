import type { ItineraryRecord } from "@/lib/itinerary-types";

export type ReportPeriod = "7" | "30" | "all";
export type ReportRecord = Pick<
  ItineraryRecord,
  "id" | "city" | "style" | "budget" | "days" | "created_at"
>;

export type ReportFilters = {
  period: ReportPeriod;
  city: string;
  style: string;
};

export type ItineraryReport = {
  trips: number;
  totalBudget: number;
  averageBudget: number;
  averageDays: number;
  topDestination: string | null;
  byDestination: Array<{
    city: string;
    trips: number;
    totalBudget: number;
    averageDays: number;
  }>;
  byStyle: Array<{ style: string; trips: number }>;
  dailySeries: Array<{ date: string; trips: number }>;
};

const DAY_MS = 86_400_000;

export function filterReportRecords(
  records: readonly ReportRecord[],
  filters: ReportFilters,
  now = new Date(),
): ReportRecord[] {
  const periodDays = filters.period === "7" ? 7 : filters.period === "30" ? 30 : null;
  const cutoff = periodDays === null ? null : now.getTime() - periodDays * DAY_MS;

  return records.filter((record) => {
    const createdAt = Date.parse(record.created_at);
    if (!Number.isFinite(createdAt)) return false;
    if (cutoff !== null && createdAt < cutoff) return false;
    if (filters.city && record.city !== filters.city) return false;
    if (filters.style && record.style !== filters.style) return false;
    return true;
  });
}

export function summarizeItineraries(
  records: readonly ReportRecord[],
  period: ReportPeriod,
  now = new Date(),
): ItineraryReport {
  const cityGroups = new Map<string, { trips: number; totalBudget: number; totalDays: number }>();
  const styleGroups = new Map<string, number>();
  const dailyCounts = new Map<string, number>();
  let totalBudget = 0;
  let totalDays = 0;

  for (const record of records) {
    totalBudget += record.budget;
    totalDays += record.days;

    const city = cityGroups.get(record.city) ?? { trips: 0, totalBudget: 0, totalDays: 0 };
    city.trips += 1;
    city.totalBudget += record.budget;
    city.totalDays += record.days;
    cityGroups.set(record.city, city);

    styleGroups.set(record.style, (styleGroups.get(record.style) ?? 0) + 1);

    const timestamp = Date.parse(record.created_at);
    if (Number.isFinite(timestamp)) {
      const date = new Date(timestamp).toISOString().slice(0, 10);
      dailyCounts.set(date, (dailyCounts.get(date) ?? 0) + 1);
    }
  }

  const byDestination = Array.from(cityGroups, ([city, group]) => ({
    city,
    trips: group.trips,
    totalBudget: group.totalBudget,
    averageDays: Math.round((group.totalDays / group.trips) * 10) / 10,
  })).sort((a, b) => b.totalBudget - a.totalBudget || a.city.localeCompare(b.city));

  const byStyle = Array.from(styleGroups, ([style, trips]) => ({ style, trips })).sort(
    (a, b) => b.trips - a.trips || a.style.localeCompare(b.style),
  );

  const periodDays = period === "7" ? 7 : 30;
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  const dailySeries = Array.from({ length: periodDays }, (_, index) => {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - (periodDays - index - 1));
    const date = day.toISOString().slice(0, 10);
    return { date, trips: dailyCounts.get(date) ?? 0 };
  });

  const topDestination = [...byDestination].sort(
    (a, b) => b.trips - a.trips || b.totalBudget - a.totalBudget,
  )[0]?.city ?? null;

  return {
    trips: records.length,
    totalBudget,
    averageBudget: records.length > 0 ? Math.round(totalBudget / records.length) : 0,
    averageDays: records.length > 0 ? Math.round((totalDays / records.length) * 10) / 10 : 0,
    topDestination,
    byDestination,
    byStyle,
    dailySeries,
  };
}
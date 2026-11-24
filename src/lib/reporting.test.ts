import { describe, expect, it } from "vitest";

import { filterReportRecords, summarizeItineraries } from "@/lib/reporting";
import type { ReportRecord } from "@/lib/reporting";

const records: ReportRecord[] = [
  {
    id: "bandung-1",
    city: "Bandung",
    style: "kuliner",
    budget: 1_000_000,
    days: 2,
    created_at: "2026-11-22T08:00:00.000Z",
  },
  {
    id: "bandung-2",
    city: "Bandung",
    style: "kuliner",
    budget: 2_000_000,
    days: 3,
    created_at: "2026-11-20T08:00:00.000Z",
  },
  {
    id: "bali-1",
    city: "Bali",
    style: "santai",
    budget: 3_000_000,
    days: 4,
    created_at: "2026-11-10T08:00:00.000Z",
  },
];

describe("itinerary reporting", () => {
  const now = new Date("2026-11-23T12:00:00.000Z");

  it("filters the selected 7-day period, destination, and travel style", () => {
    const filtered = filterReportRecords(
      records,
      { period: "7", city: "Bandung", style: "kuliner" },
      now,
    );

    expect(filtered.map((record) => record.id)).toEqual(["bandung-1", "bandung-2"]);
  });

  it("groups filtered plans and totals their planned budgets", () => {
    const filtered = filterReportRecords(
      records,
      { period: "7", city: "Bandung", style: "kuliner" },
      now,
    );
    const report = summarizeItineraries(filtered, "7", now);

    expect(report.trips).toBe(2);
    expect(report.totalBudget).toBe(3_000_000);
    expect(report.averageDays).toBe(2.5);
    expect(report.topDestination).toBe("Bandung");
    expect(report.byDestination).toEqual([
      { city: "Bandung", trips: 2, totalBudget: 3_000_000, averageDays: 2.5 },
    ]);
    expect(report.byStyle).toEqual([{ style: "kuliner", trips: 2 }]);
    expect(report.dailySeries.find((day) => day.date === "2026-11-22")?.trips).toBe(1);
  });
});
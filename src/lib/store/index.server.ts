import type { ItineraryRecord, ItineraryResult, TripDraft, TripPrefs } from "../itinerary-types";

// One storage layer, two paths:
// - "lovable" (default): Lovable Cloud database, works when hosted on Lovable.
// - "mysql": a MySQL database you run on your own computer — only reachable
//   when Lokamate.id itself runs locally (see HOSTING.md). The hosted preview
//   cannot reach MySQL on your machine.
export type StoreContext = {
  // Supabase client authenticated as the caller (Lovable path only).
  supabase?: { from: (table: string) => unknown } | undefined;
  userId: string;
};

export type TripInsert = TripDraft & { result: ItineraryResult; prefs?: TripPrefs | undefined };

export interface ItineraryStore {
  insert(trip: TripInsert): Promise<string>;
  get(id: string): Promise<ItineraryRecord | null>;
  list(): Promise<ItineraryRecord[]>;
  remove(id: string): Promise<void>;
}

export function dataSource(): "mysql" | "lovable" {
  return (process.env["DATA_SOURCE"] ?? "lovable").trim().toLowerCase() === "mysql"
    ? "mysql"
    : "lovable";
}

export async function getStore(ctx: StoreContext): Promise<ItineraryStore> {
  if (dataSource() === "mysql") {
    const mod = await import("./mysql.server");
    return mod.createMysqlStore(ctx);
  }
  const mod = await import("./lovable.server");
  return mod.createLovableStore(ctx);
}

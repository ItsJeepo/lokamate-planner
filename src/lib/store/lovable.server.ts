import type { SupabaseClient } from "@supabase/supabase-js";

import type { ItineraryRecord } from "../itinerary-types";
import type { ItineraryStore, StoreContext, TripInsert } from "./index.server";

// Lovable Cloud path: rows live in public.itineraries, protected by RLS so
// each user only sees their own.
export function createLovableStore(ctx: StoreContext): ItineraryStore {
  const supabase = ctx.supabase as SupabaseClient | undefined;
  if (!supabase) throw new Error("STORE_AUTH");

  return {
    async insert(trip: TripInsert) {
      const { data: inserted, error } = await supabase
        .from("itineraries")
        .insert({
          user_id: ctx.userId,
          city: trip.city,
          style: trip.style,
          budget: trip.budget,
          days: trip.days,
          notes: trip.notes || null,
          result: trip.result as unknown as never,
        })
        .select("id")
        .single();
      if (error || !inserted) {
        console.error("Insert itinerary failed", error);
        throw new Error("SAVE_FAILED");
      }
      return inserted.id as string;
    },

    async get(id: string) {
      const { data: row, error } = await supabase
        .from("itineraries")
        .select("id, city, style, budget, days, notes, created_at, result")
        .eq("id", id)
        .maybeSingle();
      if (error) {
        console.error("Fetch itinerary failed", error);
        throw new Error("LOAD_FAILED");
      }
      return (row as ItineraryRecord | null) ?? null;
    },

    async list() {
      const { data: rows, error } = await supabase
        .from("itineraries")
        .select("id, city, style, budget, days, notes, created_at, result")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) {
        console.error("List itineraries failed", error);
        throw new Error("LOAD_FAILED");
      }
      return (rows ?? []) as ItineraryRecord[];
    },
  };
}

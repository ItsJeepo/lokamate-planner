import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAppAuth } from "./app-auth.middleware";
import type { ItineraryRecord } from "./itinerary-types";
import { dataSource, getStore, type StoreContext } from "./store/index.server";

const inputSchema = z.object({
  style: z.string().trim().min(1).max(40),
  city: z.string().trim().min(2).max(80),
  budget: z.number().int().min(100000).max(2000000000),
  days: z.number().int().min(1).max(14),
  notes: z.string().trim().max(500).optional().default(""),
  lang: z.enum(["id", "en"]).default("id"),
  nickname: z.string().trim().max(60).optional(),
  startDate: z.string().trim().max(20).optional(),
  endDate: z.string().trim().max(20).optional(),
  arrivalMode: z.enum(["airport", "station", "harbor"]).optional(),
  arrivalHub: z.string().trim().max(120).optional(),
  adults: z.number().int().min(1).max(20).optional(),
  children: z.number().int().min(0).max(20).optional(),
});

function storeContext(context: { supabase: unknown; userId: string }): StoreContext {
  return { supabase: context.supabase as StoreContext["supabase"], userId: context.userId };
}

export const generateItinerary = createServerFn({ method: "POST" })
  .middleware([requireAppAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const store0 = await getStore(storeContext(context));
    if ((await store0.list()).length >= 2) throw new Error("ITINERARY_LIMIT");
    const { generateItineraryWithAi } = await import("./ai-provider.server");
    const result = await generateItineraryWithAi(data);

    const store = await getStore(storeContext(context));
    const prefs = {
      nickname: data.nickname,
      startDate: data.startDate,
      endDate: data.endDate,
      arrivalMode: data.arrivalMode,
      arrivalHub: data.arrivalHub,
      adults: data.adults,
      children: data.children,
    };
    const id = await store.insert({ ...data, result, prefs });
    return { id };
  });

export const getItinerary = createServerFn({ method: "GET" })
  .middleware([requireAppAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const store = await getStore(storeContext(context));
    return store.get(data.id);
  });

export const getItineraryDestinationPhoto = createServerFn({ method: "GET" })
  .middleware([requireAppAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const store = await getStore(storeContext(context));
    const trip = await store.get(data.id);
    if (!trip) return null;
    const { findDestinationPhoto } = await import("./destination-photo.server");
    return findDestinationPhoto(trip.result.city || trip.city);
  });

export const listItineraries = createServerFn({ method: "GET" })
  .middleware([requireAppAuth])
  .handler(async ({ context }) => {
    const store = await getStore(storeContext(context));
    const rows = await store.list();
    return rows.map((row) => ({
      id: row.id,
      city: row.city,
      style: row.style,
      budget: row.budget,
      days: row.days,
      created_at: row.created_at,
    }));
  });

// Download everything you own as JSON, so the data can move between MySQL and
// Lovable storage without being locked in either.
export const exportItineraries = createServerFn({ method: "GET" })
  .middleware([requireAppAuth])
  .handler(async ({ context }) => {
    const store = await getStore(storeContext(context));
    const rows = await store.list();
    return {
      app: "Lokamate.id",
      source: dataSource(),
      exportedAt: new Date().toISOString(),
      itineraries: rows as ItineraryRecord[],
    };
  });

export const deleteItinerary = createServerFn({ method: "POST" })
  .middleware([requireAppAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const store = await getStore(storeContext(context));
    await store.remove(data.id);
    return { ok: true };
  });

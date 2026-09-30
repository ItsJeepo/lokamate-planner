import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ItineraryRecord } from "./itinerary-types";
import { dataSource, getStore, type StoreContext } from "./store/index.server";

const inputSchema = z.object({
  style: z.string().trim().min(1).max(40),
  city: z.string().trim().min(2).max(80),
  budget: z.number().int().min(100000).max(2000000000),
  days: z.number().int().min(1).max(14),
  notes: z.string().trim().max(500).optional().default(""),
  lang: z.enum(["id", "en"]).default("id"),
});

function storeContext(context: { supabase: unknown; userId: string }): StoreContext {
  return { supabase: context.supabase as StoreContext["supabase"], userId: context.userId };
}

export const generateItinerary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { generateItineraryWithAi } = await import("./ai-provider.server");
    const result = await generateItineraryWithAi(data);

    const store = await getStore(storeContext(context));
    const id = await store.insert({ ...data, result });
    return { id };
  });

export const getItinerary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const store = await getStore(storeContext(context));
    return store.get(data.id);
  });

export const listItineraries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
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
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const store = await getStore(storeContext(context));
    const rows = await store.list();
    return {
      app: "Lokamate",
      source: dataSource(),
      exportedAt: new Date().toISOString(),
      itineraries: rows as ItineraryRecord[],
    };
  });

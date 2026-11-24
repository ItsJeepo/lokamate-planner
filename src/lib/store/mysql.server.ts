import type { ItineraryRecord } from "../itinerary-types";
import type { ItineraryStore, StoreContext, TripInsert } from "./index.server";

// MySQL path: runs only when Lokamate.id runs locally on the same computer that
// hosts the MySQL database (see HOSTING.md). Reads connection details from
// DATABASE_URL, e.g. mysql://tripmate:password@localhost:3306/tripmate
//
// Driver note: this uses a plain TCP connection via the "mysql2" package,
// which needs a full Node.js runtime — one more reason this path is local-only
// and never active on the hosted preview.

type Queryable = {
  execute: (sql: string, params: unknown[]) => Promise<[unknown, unknown]>;
  end: () => Promise<void>;
};

async function connect(): Promise<Queryable> {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("STORE_NOT_CONFIGURED");
  const mysql = (await import("mysql2/promise")) as unknown as {
    createConnection: (uri: string) => Promise<Queryable>;
  };
  return mysql.createConnection(url);
}

type Row = {
  id: string;
  user_id: string;
  city: string;
  style: string;
  budget: number;
  days: number;
  notes: string | null;
  result: string;
  created_at: string | Date;
};

function toRecord(row: Row): ItineraryRecord {
  return {
    id: row.id,
    city: row.city,
    style: row.style,
    budget: Number(row.budget),
    days: Number(row.days),
    notes: row.notes,
    created_at:
      typeof row.created_at === "string" ? row.created_at : row.created_at.toISOString(),
    result: typeof row.result === "string" ? JSON.parse(row.result) : row.result,
  };
}

export function createMysqlStore(ctx: StoreContext): ItineraryStore {
  return {
    async insert(trip: TripInsert) {
      const conn = await connect();
      try {
        await conn.execute(`DELETE FROM itineraries WHERE created_at < NOW() - INTERVAL 30 DAY`, []);
        const [countRows] = await conn.execute(
          `SELECT COUNT(*) AS n FROM itineraries WHERE user_id = ?`,
          [ctx.userId],
        );
        if (Number((countRows as { n: number }[])[0]?.n ?? 0) >= 2) throw new Error("ITINERARY_LIMIT");
        const id = crypto.randomUUID();
        await conn.execute(
          `INSERT INTO itineraries (id, user_id, city, style, budget, days, notes, result)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            ctx.userId,
            trip.city,
            trip.style,
            trip.budget,
            trip.days,
            trip.notes || null,
            JSON.stringify(trip.result),
          ],
        );
        return id;
      } catch (error) {
        if (error instanceof Error && error.message === "ITINERARY_LIMIT") throw error;
        console.error("MySQL insert failed", error);
        throw new Error("SAVE_FAILED");
      } finally {
        await conn.end();
      }
    },

    async get(id: string) {
      const conn = await connect();
      try {
        const [rows] = await conn.execute(
          `SELECT id, user_id, city, style, budget, days, notes, result, created_at
           FROM itineraries WHERE id = ? AND user_id = ? LIMIT 1`,
          [id, ctx.userId],
        );
        const list = rows as Row[];
        return list[0] ? toRecord(list[0]) : null;
      } catch (error) {
        console.error("MySQL fetch failed", error);
        throw new Error("LOAD_FAILED");
      } finally {
        await conn.end();
      }
    },

    async list() {
      const conn = await connect();
      try {
        const [rows] = await conn.execute(
          `SELECT id, user_id, city, style, budget, days, notes, result, created_at
           FROM itineraries WHERE user_id = ? AND created_at >= NOW() - INTERVAL 30 DAY ORDER BY created_at DESC LIMIT 50`,
          [ctx.userId],
        );
        return (rows as Row[]).map(toRecord);
      } catch (error) {
        console.error("MySQL list failed", error);
        throw new Error("LOAD_FAILED");
      } finally {
        await conn.end();
      }
    },
  
    async remove(id: string) {
      const conn = await connect();
      try {
        await conn.execute(`DELETE FROM itineraries WHERE id = ? AND user_id = ?`, [id, ctx.userId]);
      } catch (error) {
        console.error("MySQL delete failed", error);
        throw new Error("DELETE_FAILED");
      } finally {
        await conn.end();
      }
    },
  };
}

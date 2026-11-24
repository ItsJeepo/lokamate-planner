import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const creds = z.object({ email: z.string().trim().toLowerCase().min(1).max(255), password: z.string().min(1).max(200) });

function normalize(id: string) {
  return id.includes("@") ? id : `${id.replace(/[^a-z0-9._-]/g, "")}@lokamate.local`;
}

export const localMe = createServerFn({ method: "GET" }).handler(async () => {
  const a = await import("./local-auth.server");
  const id = await a.sessionUserId();
  if (!id) return null;
  const conn = await a.db();
  try {
    const [rows] = await conn.execute(`SELECT id, email, full_name, role FROM users WHERE id = ? LIMIT 1`, [id]);
    return ((rows as import("./local-auth.server").LocalUser[])[0] ?? null);
  } finally { await conn.end(); }
});

export const localSignIn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => creds.parse(d))
  .handler(async ({ data }) => {
    const a = await import("./local-auth.server");
    const conn = await a.db();
    try {
      const [rows] = await conn.execute(`SELECT id, password_hash FROM users WHERE email = ? LIMIT 1`, [normalize(data.email)]);
      const row = (rows as { id: string; password_hash: string | null }[])[0];
      if (!row?.password_hash || !(await a.verifyPassword(data.password, row.password_hash))) {
        return { error: "Email/username atau kata sandi salah" };
      }
      await a.startSession(row.id);
      return { error: null };
    } finally { await conn.end(); }
  });

export const localSignUp = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => creds.extend({ email: z.string().trim().toLowerCase().email(), password: z.string().min(8).max(200), name: z.string().trim().max(100).optional() }).parse(d))
  .handler(async ({ data }) => {
    const a = await import("./local-auth.server");
    const conn = await a.db();
    try {
      const [rows] = await conn.execute(`SELECT id FROM users WHERE email = ? LIMIT 1`, [data.email]);
      if ((rows as unknown[]).length) return { error: "Email sudah terdaftar" };
      const id = crypto.randomUUID();
      await conn.execute(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, 'user')`,
        [id, data.email, await a.hashPassword(data.password), data.name || null]);
      await a.startSession(id);
      return { error: null };
    } finally { await conn.end(); }
  });

export const localSignOut = createServerFn({ method: "POST" }).handler(async () => {
  const a = await import("./local-auth.server");
  a.endSession();
  return { ok: true };
});

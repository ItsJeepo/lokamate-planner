// Self-hosted login (DATA_SOURCE=mysql): accounts live in the local MySQL
// `users` table and sessions are HMAC-signed HTTP-only cookies.
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

export const SESSION_COOKIE = "lokamate_session";
const enc = new TextEncoder();

function b64(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function unb64(s: string) {
  return Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0));
}

export async function hashPassword(password: string, salt = crypto.getRandomValues(new Uint8Array(16)), iter = 100000) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, key, 256);
  return `pbkdf2$${iter}$${b64(salt)}$${b64(bits)}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [kind, iter, salt, hash] = stored.split("$");
  if (kind !== "pbkdf2" || !iter || !salt || !hash) return false;
  const again = await hashPassword(password, unb64(salt), Number(iter));
  return again.split("$")[3] === hash;
}

function secret() {
  const s = process.env["LOCAL_AUTH_SECRET"];
  if (!s || s.length < 16) throw new Error("LOCAL_AUTH_SECRET belum diisi di .env (minimal 16 karakter)");
  return s;
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
}

export async function startSession(userId: string) {
  const payload = `${userId}.${Date.now() + 30 * 24 * 3600 * 1000}`;
  setCookie(SESSION_COOKIE, `${payload}.${await sign(payload)}`, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 30 * 24 * 3600,
    secure: process.env["NODE_ENV"] === "production",
  });
}

export function endSession() {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export async function sessionUserId(): Promise<string | null> {
  const raw = getCookie(SESSION_COOKIE);
  if (!raw) return null;
  const [id, exp, sig] = raw.split(".");
  if (!id || !exp || !sig || Number(exp) < Date.now()) return null;
  return (await sign(`${id}.${exp}`)) === sig ? id : null;
}

type Conn = { execute: (sql: string, p: unknown[]) => Promise<[unknown, unknown]>; end: () => Promise<void> };
export async function db(): Promise<Conn> {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL belum diisi di .env");
  const mysql = (await import("mysql2/promise")) as unknown as { createConnection: (u: string) => Promise<Conn> };
  return mysql.createConnection(url);
}

export type LocalUser = { id: string; email: string; full_name: string | null; role: string };

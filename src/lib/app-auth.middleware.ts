import { createMiddleware } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Self-hosted (DATA_SOURCE=mysql): trust the local signed session cookie.
// Otherwise fall through to the hosted login check.
const localOrSkip = createMiddleware({ type: "function" }).server(async ({ next }) => {
  if ((process.env["DATA_SOURCE"] ?? "").trim().toLowerCase() !== "mysql") {
    return next({ context: { localUserId: null as string | null } });
  }
  const { sessionUserId } = await import("./local-auth.server");
  const id = await sessionUserId();
  if (!id) throw new Error("Unauthorized");
  return next({ context: { localUserId: id as string | null } });
});

const hostedOrSkip = createMiddleware({ type: "function" })
  .middleware([localOrSkip])
  .server(async (args) => {
    if (args.context.localUserId) {
      return args.next({ context: { supabase: undefined as unknown, userId: args.context.localUserId } });
    }
    // Run the hosted check inline.
    const server = (requireSupabaseAuth as unknown as { options: { server: (a: unknown) => unknown } }).options.server;
    return server(args) as ReturnType<typeof args.next<{ supabase: unknown; userId: string }>>;
  });

export const requireAppAuth = hostedOrSkip;

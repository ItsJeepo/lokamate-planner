import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { localMe, localSignOut } from "@/lib/local-auth.functions";

// Self-hosted builds set VITE_AUTH_MODE=local to use the MySQL login.
export const LOCAL_AUTH = import.meta.env["VITE_AUTH_MODE"] === "local";

const listeners = new Set<() => void>();
export function refreshLocalAuth() {
  listeners.forEach((fn) => fn());
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (LOCAL_AUTH) {
      const load = () =>
        localMe()
          .then((u) => {
            setSession(
              u
                ? ({
                    access_token: "local",
                    user: {
                      id: u.id,
                      email: u.email,
                      user_metadata: { full_name: u.full_name ?? "", role: u.role },
                      app_metadata: { role: u.role },
                      identities: [{ provider: "email" }],
                    },
                  } as unknown as Session)
                : null,
            );
          })
          .catch(() => setSession(null))
          .finally(() => setLoading(false));
      listeners.add(load);
      load();
      return () => void listeners.delete(load);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    session,
    user: (session?.user ?? null) as User | null,
    loading,
    signOut: async (): Promise<{ error: Error | null }> => {
      if (LOCAL_AUTH) {
        await localSignOut();
        refreshLocalAuth();
        return { error: null };
      }
      return supabase.auth.signOut();
    },
  };
}

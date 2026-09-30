import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

function safePath(value: unknown): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/planner";
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({ next: safePath(search["next"]) }),
  head: () => ({
    meta: [
      { title: "Masuk atau Daftar — Lokamate" },
      {
        name: "description",
        content:
          "Masuk ke Lokamate untuk melihat dan menyimpan itinerary liburanmu di destinasi lokal Indonesia.",
      },
      { property: "og:title", content: "Masuk ke Lokamate" },
      {
        property: "og:description",
        content: "Simpan dan buka kembali itinerary liburan Indonesia yang sudah kamu buat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { session } = useAuth();
  const { next } = Route.useSearch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) return;
    window.location.replace(next);
  }, [session, next]);

  async function signIn() {
    setBusy(true);
    // Accept a plain username (e.g. the admin account) as well as an email.
    const id = email.trim().toLowerCase();
    const loginEmail = id.includes("@") ? id : `${id.replace(/[^a-z0-9._-]/g, "")}@lokamate.local`;
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    setBusy(false);
    if (error) toast.error(error.message);
  }

  async function signUp() {
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}${next}`,
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(data.session ? t.auth.signUpSuccess : t.auth.checkEmail);
  }

  async function google() {
    try {
      localStorage.setItem("tripmate.next", next);
    } catch {
      /* ignore */
    }
    // On Lovable domains use the managed broker; when self-hosted elsewhere,
    // fall back to direct Google OAuth (needs your own Google Client ID set
    // in the backend auth settings + this domain added as redirect URL).
    const onLovable = /(\.lovable\.app|\.lovableproject\.com)$/.test(window.location.hostname);
    if (onLovable) {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) toast.error(t.common.error);
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(t.common.error);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-20 sm:px-6">
      <h1 className="text-center font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        {t.auth.title}
      </h1>
      <p className="mt-3 text-center text-sm text-muted-foreground">{t.auth.subtitle}</p>

      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-lift">
        <Button variant="outline" className="w-full rounded-full" onClick={google} disabled={busy}>
          {t.auth.google}
        </Button>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t.auth.or}
          <span className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t.auth.tabSignIn}</TabsTrigger>
            <TabsTrigger value="signup">{t.auth.tabSignUp}</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-in">{t.auth.email}</Label>
              <Input
                id="email-in"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass-in">{t.auth.password}</Label>
              <Input
                id="pass-in"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <Button className="w-full rounded-full" onClick={signIn} disabled={busy}>
              {t.auth.submitSignIn}
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name-up">{t.auth.name}</Label>
              <Input
                id="name-up"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-up">{t.auth.email}</Label>
              <Input
                id="email-up"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass-up">{t.auth.password}</Label>
              <Input
                id="pass-up"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <Button className="w-full rounded-full" onClick={signUp} disabled={busy}>
              {t.auth.submitSignUp}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

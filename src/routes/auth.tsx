import { Link, createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LOCAL_AUTH, refreshLocalAuth, useAuth } from "@/hooks/useAuth";
import { localSignIn, localSignUp } from "@/lib/local-auth.functions";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

function safePath(value: unknown): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/planner";
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: safePath(search["next"]),
    ...(search["tab"] === "signup" ? { tab: "signup" as const } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Masuk atau Daftar | Lokamate.id" },
      {
        name: "description",
        content:
          "Masuk ke Lokamate.id untuk melihat dan menyimpan itinerary liburanmu di destinasi lokal Indonesia.",
      },
      { property: "og:title", content: "Masuk ke Lokamate.id" },
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
  const { t, lang } = useI18n();
  const { session } = useAuth();
  const { next, tab } = Route.useSearch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [adult, setAdult] = useState(false);

  useEffect(() => {
    if (!session) return;
    window.location.replace(next);
  }, [session, next]);

  async function signIn() {
    setBusy(true);
    // Accept a plain username (e.g. the admin account) as well as an email.
    const id = email.trim().toLowerCase();
    const loginEmail = id.includes("@") ? id : `${id.replace(/[^a-z0-9._-]/g, "")}@lokamate.local`;
    if (LOCAL_AUTH) {
      try {
        const res = await localSignIn({ data: { email: loginEmail, password } });
        if (res.error) toast.error(res.error);
        else refreshLocalAuth();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t.common.error);
      }
      setBusy(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    setBusy(false);
    if (error) toast.error(error.message);
  }

  async function signUp() {
    if (!adult) {
      toast.error(lang === "en" ? "You must be 18 or older to sign up." : "Kamu harus berusia minimal 18 tahun untuk mendaftar.");
      return;
    }
    setBusy(true);
    if (LOCAL_AUTH) {
      try {
        const res = await localSignUp({ data: { email, password, name } });
        if (res.error) toast.error(res.error);
        else { toast.success(t.auth.signUpSuccess); refreshLocalAuth(); }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t.common.error);
      }
      setBusy(false);
      return;
    }
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

        <Tabs defaultValue={tab ?? "signin"}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t.auth.tabSignIn}</TabsTrigger>
            <TabsTrigger value="signup">{t.auth.tabSignUp}</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-in">{t.auth.email}</Label>
              <Input
                id="email-in"
                type="text" autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass-in">{t.auth.password}</Label>
              <div className="relative">
                <Input
                  id="pass-in"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  aria-label={showPass ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
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
              <div className="relative">
                <Input
                  id="pass-up"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  aria-label={showPass ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={adult}
                onChange={(event) => setAdult(event.target.checked)}
                className="mt-0.5 size-4 accent-primary"
              />
              {lang === "en" ? "I confirm I am 18 years or older." : "Saya menyatakan berusia 18 tahun atau lebih."}
            </label>
            <p className="text-xs text-muted-foreground">
              {lang === "en" ? "By signing up you agree to the " : "Dengan mendaftar, kamu menyetujui "}
              <Link to="/syarat" className="underline hover:text-primary">{lang === "en" ? "Terms" : "Syarat & Ketentuan"}</Link>
              {lang === "en" ? " and " : " dan "}
              <Link to="/privasi" className="underline hover:text-primary">{lang === "en" ? "Privacy Policy" : "Kebijakan Privasi"}</Link>.
            </p>
            <Button className="w-full rounded-full" onClick={signUp} disabled={busy || !adult}>
              {t.auth.submitSignUp}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

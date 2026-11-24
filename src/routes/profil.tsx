import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2, LogOut, Mail, Map, Save, Settings, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/profil")({
  head: () => ({ meta: [
    { title: "Profil & Pengaturan Akun | Lokamate.id" },
    { name: "description", content: "Kelola data pribadi dan keamanan akun perjalanan Lokamate.id kamu." },
    { property: "og:title", content: "Profil & Pengaturan Akun | Lokamate.id" },
    { property: "og:description", content: "Data pribadi, email, dan keamanan akun Lokamate.id dalam satu tempat." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: ProfilePage,
});

const copy = {
  id: {
    title: "Pengaturan", account: "Profil saya", trips: "Itinerary saya", logout: "Keluar", traveler: "Akun Lokamate.id",
    info: "Informasi akun", security: "Kata sandi & keamanan", personal: "Data pribadi", name: "Nama lengkap",
    gender: "Jenis kelamin", choose: "Pilih", male: "Laki-laki", female: "Perempuan", private: "Tidak ingin menyebutkan",
    birthday: "Tanggal lahir", city: "Kota tempat tinggal", cancel: "Batal", save: "Simpan perubahan", saved: "Profil berhasil disimpan",
    failed: "Perubahan belum tersimpan. Silakan coba lagi.", email: "Email akun", verified: "Terverifikasi", pending: "Belum terverifikasi",
    password: "Ubah kata sandi", current: "Kata sandi saat ini", next: "Kata sandi baru", confirm: "Ulangi kata sandi baru",
    update: "Perbarui kata sandi", changed: "Kata sandi berhasil diperbarui", mismatch: "Kata sandi baru tidak sama.",
    wrong: "Kata sandi saat ini tidak sesuai.", google: "Akun terhubung dengan Google", googleSecurity: "Keamanan masuk akun ini dikelola melalui akun Google kamu.",
    show: "Tampilkan kata sandi", hide: "Sembunyikan kata sandi", loading: "Memuat profil", method: "Metode masuk",
  },
  en: {
    title: "Settings", account: "My profile", trips: "My itineraries", logout: "Log out", traveler: "Lokamate.id account",
    info: "Account information", security: "Password & security", personal: "Personal data", name: "Full name",
    gender: "Gender", choose: "Select", male: "Male", female: "Female", private: "Prefer not to say",
    birthday: "Date of birth", city: "City of residence", cancel: "Cancel", save: "Save changes", saved: "Profile saved",
    failed: "Changes could not be saved. Please try again.", email: "Account email", verified: "Verified", pending: "Unverified",
    password: "Change password", current: "Current password", next: "New password", confirm: "Confirm new password",
    update: "Update password", changed: "Password updated", mismatch: "New passwords do not match.",
    wrong: "The current password is incorrect.", google: "Account connected to Google", googleSecurity: "Sign-in security for this account is managed through your Google account.",
    show: "Show password", hide: "Hide password", loading: "Loading profile", method: "Sign-in method",
  },
};

type PersonalData = { full_name: string; gender: string; birthdate: string; city: string };

function ProfilePage() {
  const { lang } = useI18n();
  const c = copy[lang];
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<PersonalData>({ full_name: "", gender: "", birthdate: "", city: "" });
  const [saved, setSaved] = useState(form);
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [securityBusy, setSecurityBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { next: "/profil" }, replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata ?? {};
    const text = (value: unknown) => typeof value === "string" ? value : "";
    const data = { full_name: text(meta['full_name'] || meta['name']), gender: text(meta['gender']), birthdate: text(meta['birthdate']), city: text(meta['city']) };
    setForm(data);
    setSaved(data);
  }, [user]);

  const dirty = Object.keys(form).some(key => form[key as keyof PersonalData] !== saved[key as keyof PersonalData]);
  const displayName = saved.full_name || user?.email?.split("@")[0] || "Lokamate.id";
  const initials = displayName.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();
  const emailLogin = user?.identities?.some(identity => identity.provider === "email") ?? false;

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!user || busy) return;
    setBusy(true);
    try {
      const data = { ...form, full_name: form.full_name.trim(), city: form.city.trim() };
      const { error } = await supabase.auth.updateUser({ data });
      if (error) throw error;
      setForm(data);
      setSaved(data);
      toast.success(c.saved);
    } catch { toast.error(c.failed); }
    finally { setBusy(false); }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    if (!user?.email || securityBusy) return;
    if (password !== confirm) { toast.error(c.mismatch); return; }
    setSecurityBusy(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
      if (authError) { toast.error(c.wrong); return; }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) { toast.error(error.message); return; }
      setCurrent(""); setPassword(""); setConfirm("");
      toast.success(c.changed);
    } catch { toast.error(c.failed); }
    finally { setSecurityBusy(false); }
  }

  async function logout() {
    const { error } = await signOut();
    if (error) { toast.error(c.failed); return; }
    navigate({ to: "/" });
  }

  if (loading || !user) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 aria-label={c.loading} className="size-7 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface">
      <div className="mx-auto grid max-w-6xl gap-7 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-9">
        <aside className="self-start overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border p-5">
            <Avatar className="size-14 shrink-0 border border-border"><AvatarFallback className="bg-secondary font-display text-lg font-bold text-primary">{initials}</AvatarFallback></Avatar>
            <div className="min-w-0"><p className="truncate font-semibold">{displayName}</p><p className="mt-1 text-xs text-muted-foreground">{c.traveler}</p></div>
          </div>
          <nav aria-label={c.account} className="space-y-1 p-2">
            <Button variant="ghost" asChild className="h-11 w-full justify-start rounded-md"><Link to="/perjalanan"><Map className="text-primary" />{c.trips}</Link></Button>
            <Button variant="secondary" asChild className="h-11 w-full justify-start rounded-md"><Link to="/profil" aria-current="page"><Settings />{c.account}</Link></Button>
            <div className="my-2 border-t border-border" />
            <Button variant="ghost" onClick={logout} className="h-11 w-full justify-start rounded-md text-muted-foreground"><LogOut />{c.logout}</Button>
          </nav>
        </aside>

        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{c.title}</h1>
          <Tabs defaultValue="personal" className="mt-5 gap-0">
            <TabsList className="h-auto w-full justify-start gap-2 rounded-none border-b border-border bg-transparent p-0">
              <TabsTrigger value="personal" className="min-w-0 flex-none rounded-none border-b-2 border-transparent px-2 py-3 text-xs shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:px-4 sm:text-sm">{c.info}</TabsTrigger>
              <TabsTrigger value="security" className="min-w-0 flex-none rounded-none border-b-2 border-transparent px-2 py-3 text-xs shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:px-4 sm:text-sm">{c.security}</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="mt-5 space-y-5">
              <section className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
                <h2 className="flex items-center gap-2 border-b border-border px-5 py-4 text-sm font-bold sm:px-6"><UserRound className="size-4 text-primary" />{c.personal}</h2>
                <form onSubmit={saveProfile} className="space-y-5 p-5 sm:p-6">
                  <div className="space-y-2"><Label htmlFor="profile-name">{c.name}</Label><Input id="profile-name" autoComplete="name" required maxLength={100} value={form.full_name} disabled={busy} onChange={e => setForm({ ...form, full_name: e.target.value })} className="h-11 rounded-md" /></div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="profile-gender">{c.gender}</Label><Select value={form.gender} disabled={busy} onValueChange={gender => setForm({ ...form, gender })}><SelectTrigger id="profile-gender" className="h-11 w-full rounded-md"><SelectValue placeholder={c.choose} /></SelectTrigger><SelectContent><SelectItem value="male">{c.male}</SelectItem><SelectItem value="female">{c.female}</SelectItem><SelectItem value="private">{c.private}</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label htmlFor="profile-birthday">{c.birthday}</Label><Input id="profile-birthday" type="date" autoComplete="bday" value={form.birthdate} disabled={busy} onChange={e => setForm({ ...form, birthdate: e.target.value })} className="h-11 min-w-0 rounded-md" /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="profile-city">{c.city}</Label><Input id="profile-city" autoComplete="address-level2" maxLength={100} value={form.city} disabled={busy} onChange={e => setForm({ ...form, city: e.target.value })} className="h-11 rounded-md" /></div>
                  <div className="flex flex-wrap justify-end gap-2 pt-1"><Button type="button" variant="ghost" disabled={!dirty || busy} onClick={() => setForm(saved)}>{c.cancel}</Button><Button type="submit" disabled={!dirty || busy || !form.full_name.trim()} className="rounded-md">{busy ? <Loader2 className="animate-spin" /> : <Save />}{c.save}</Button></div>
                </form>
              </section>
              <section className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
                <h2 className="flex items-center gap-2 border-b border-border px-5 py-4 text-sm font-bold sm:px-6"><Mail className="size-4 text-primary" />{c.email}</h2>
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6"><span className="min-w-0 break-all text-sm font-medium">{user.email}</span><span className="flex items-center gap-1.5 text-xs text-muted-foreground">{user.email_confirmed_at ? <CheckCircle2 className="size-4 text-success" /> : null}{user.email_confirmed_at ? c.verified : c.pending}</span></div>
              </section>
            </TabsContent>
            <TabsContent value="security" className="mt-5">
              <section className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
                <h2 className="flex items-center gap-2 border-b border-border px-5 py-4 text-sm font-bold sm:px-6"><ShieldCheck className="size-4 text-primary" />{emailLogin ? c.password : c.method}</h2>
                {emailLogin ? <form onSubmit={changePassword} className="space-y-5 p-5 sm:p-6">
                  {[{ id: "current-password", label: c.current, value: current, set: setCurrent, autoComplete: "current-password" }, { id: "new-password", label: c.next, value: password, set: setPassword, autoComplete: "new-password" }, { id: "confirm-password", label: c.confirm, value: confirm, set: setConfirm, autoComplete: "new-password" }].map(field => <div className="space-y-2" key={field.id}><Label htmlFor={field.id}>{field.label}</Label><Input id={field.id} type={visible ? "text" : "password"} autoComplete={field.autoComplete} required value={field.value} disabled={securityBusy} onChange={e => field.set(e.target.value)} className="h-11 rounded-md" /></div>)}
                  <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="ghost" type="button" onClick={() => setVisible(!visible)} className="px-0 text-muted-foreground">{visible ? <EyeOff /> : <Eye />}{visible ? c.hide : c.show}</Button><Button type="submit" disabled={securityBusy || !current || !password || !confirm} className="rounded-md">{securityBusy ? <Loader2 className="animate-spin" /> : <ShieldCheck />}{c.update}</Button></div>
                </form> : <div className="p-5 sm:p-6"><p className="font-semibold">{c.google}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.googleSecurity}</p></div>}
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
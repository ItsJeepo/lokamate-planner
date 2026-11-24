import { Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, LogIn, LogOut, Map, Menu, User, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import flagGB from "@/assets/flags/gb.svg";
import flagID from "@/assets/flags/id.svg";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Lokamate.id"
      className={cn(
        "font-display text-xl font-extrabold tracking-tight text-primary transition-opacity hover:opacity-80 sm:text-2xl",
        className,
      )}
    >
      Lokamate.id
    </Link>
  );
}

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // After a social sign-in the browser returns to the app origin; continue to
  // whatever page the visitor was heading for.
  useEffect(() => {
    if (!session) return;
    let target: string | null = null;
    try {
      target = window.localStorage.getItem("tripmate.next");
      window.localStorage.removeItem("tripmate.next");
    } catch {
      target = null;
    }
    if (target && target.startsWith("/") && !target.startsWith("//") && target !== window.location.pathname) {
      window.location.replace(target);
    }
  }, [session]);

  const user = session?.user ?? null;
  const meta = (user?.user_metadata ?? {}) as { full_name?: string; name?: string };
  const displayName = meta.full_name || meta.name || user?.email || "";
  const email = user?.email ?? "";
  const initial = displayName ? displayName.trim().charAt(0).toUpperCase() : "";

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    navigate({ to: "/" });
  }

  const links = (
    <>
      <Link
        to="/destinasi"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        activeProps={{ className: "text-primary" }}
        onClick={() => setOpen(false)}
      >
        {t.nav.explore}
      </Link>
      <Link
        to="/tentang"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        activeProps={{ className: "text-primary" }}
        onClick={() => setOpen(false)}
      >
        {t.nav.about}
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">{links}</nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {session ? (
            <Button asChild size="sm" className="rounded-full px-2 shadow-soft sm:px-5" title={t.nav.myTrips}>
              <Link to="/perjalanan" aria-label={t.nav.myTrips}><Map className="sm:hidden" /><span className="hidden sm:inline">{t.nav.myTrips}</span></Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="hidden rounded-full px-5 shadow-soft sm:inline-flex">
              <Link to="/planner">{t.nav.start}</Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 rounded-full px-2 text-foreground" aria-label={t.footer.language} title={t.footer.language}>
                <img src={lang === "id" ? flagID : flagGB} alt="" className="h-3.5 w-[19px] rounded-[1px] object-cover" />
                <span className="text-xs font-bold">{lang.toUpperCase()}</span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              {(["id", "en"] as const satisfies readonly Lang[]).map((option) => (
                <DropdownMenuItem key={option} onSelect={() => setLang(option)} className="cursor-pointer">
                  <img src={option === "id" ? flagID : flagGB} alt="" className="h-3.5 w-[19px] rounded-[1px] object-cover" />
                  <span>{option === "id" ? "Indonesia" : "English"}</span>
                  {lang === option ? <Check className="ml-auto size-4" /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={user ? t.profile.account : t.nav.signIn}
                className="rounded-full"
              >
                <Avatar className="size-8 border border-border/60">
                  <AvatarFallback className="bg-muted text-foreground font-semibold">

                    {user ? (
                      <span className="text-sm">{initial}</span>
                    ) : (
                      <User className="size-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user ? (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-semibold text-foreground">{displayName}</p>
                    {email && email !== displayName ? (
                      <p className="truncate text-xs text-muted-foreground">{email}</p>
                    ) : null}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/laporan"
                      search={{ period: "30", city: "", style: "" }}
                      className="cursor-pointer"
                    >
                      {lang === "id" ? "Laporan perjalanan" : "Trip reports"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profil" className="cursor-pointer">
                      <User className="size-4" />
                      {lang === "id" ? "Profil saya" : "My profile"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="size-4" />
                    {t.nav.signOut}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                    {t.profile.guest}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/auth" search={{ next: "/planner" }} className="cursor-pointer">
                      <LogIn className="size-4" />
                      {t.nav.signIn}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/auth" search={{ next: "/planner", tab: "signup" }} className="cursor-pointer">
                      <UserPlus className="size-4" />
                      {t.auth.submitSignUp}
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
            {links}
            {session ? (
              <button
                className="text-left text-sm font-medium text-muted-foreground"
                onClick={handleSignOut}
              >
                {t.nav.signOut}
              </button>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

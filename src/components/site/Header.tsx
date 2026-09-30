import { Link, useNavigate } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Lokamate"
      className={cn(
        "font-display text-xl font-extrabold tracking-tight text-primary transition-opacity hover:opacity-80 sm:text-2xl",
        className,
      )}
    >
      Lokamate
    </Link>
  );
}

export function Header() {
  const { t } = useI18n();
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
      {session ? (
        <Link
          to="/perjalanan"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          activeProps={{ className: "text-primary" }}
          onClick={() => setOpen(false)}
        >
          {t.nav.myTrips}
        </Link>
      ) : null}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">{links}</nav>
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                {t.nav.signOut}
              </Button>
              <Button asChild size="sm" className="rounded-full px-5">
                <Link to="/perjalanan">{t.nav.myTrips}</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-foreground">
                <Link to="/auth" search={{ next: "/planner" }}>
                  {t.nav.signIn}
                </Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-5 shadow-soft">
                <Link to="/planner">
                  {t.nav.start}
                </Link>
              </Button>
            </>
          )}
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
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                  navigate({ to: "/" });
                }}
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

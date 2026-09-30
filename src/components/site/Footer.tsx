import { Link } from "@tanstack/react-router";
import { Globe, Instagram, Music2 } from "lucide-react";

import { Logo } from "@/components/site/Header";
import { useI18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

function Placeholder({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground">
      {label}
    </span>
  );
}

export function Footer() {
  const { t, lang, setLang } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-20 mt-24 border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{t.footer.tagline}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">{t.footer.addressTitle}</h3>
            <Placeholder label={t.footer.placeholder} />
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">{t.footer.contactTitle}</h3>
              <Placeholder label={t.footer.placeholder} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground">{t.footer.socialTitle}</h3>
              <div className="flex gap-2">
                <span className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground">
                  <Instagram className="size-4" />
                </span>
                <span className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground">
                  <Music2 className="size-4" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {t.footer.links.map((item) => (
              <li key={item}>{item}</li>
            ))}
            <li>
              <Link to="/tentang" className="transition-colors hover:text-primary">
                {t.nav.about}
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-2">
            <Globe className="size-4 text-muted-foreground" />
            <label className="sr-only" htmlFor="lang-select">
              {t.footer.language}
            </label>
            <select
              id="lang-select"
              value={lang}
              onChange={(event) => setLang(event.target.value as Lang)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {year} Lokamate. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}

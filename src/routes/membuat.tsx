import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { generateItinerary } from "@/lib/itinerary.functions";
import { DRAFT_KEY, type TripDraft } from "@/lib/itinerary-types";

export const Route = createFileRoute("/membuat")({
  head: () => ({
    meta: [
      { title: "Menyusun Itinerary — Lokamate" },
      {
        name: "description",
        content: "Lokamate sedang menyusun rencana harian, biaya, dan rekomendasi lokal untuk liburanmu.",
      },
      { property: "og:title", content: "Menyusun itinerary liburanmu" },
      { property: "og:description", content: "Tunggu sebentar, rencana liburanmu sedang disusun." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GeneratingPage,
});

function GeneratingPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const run = useServerFn(generateItinerary);

  const [status, setStatus] = useState<"idle" | "working" | "error" | "nodraft">("idle");
  const started = useRef(false);

  useEffect(() => {
    if (loading || started.current) return;
    if (!session) {
      navigate({ to: "/auth", search: { next: "/membuat" }, replace: true });
      return;
    }

    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(DRAFT_KEY);
    } catch {
      raw = null;
    }
    if (!raw) {
      setStatus("nodraft");
      return;
    }

    started.current = true;
    setStatus("working");
    const draft = JSON.parse(raw) as TripDraft;

    run({ data: draft })
      .then((res) => {
        navigate({ to: "/itinerary/$id", params: { id: res.id }, replace: true });
      })
      .catch((error: unknown) => {
        console.error(error);
        started.current = false;
        setStatus("error");
      });
  }, [loading, session, navigate, run]);

  if (status === "nodraft") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <p className="text-foreground">{t.generating.noDraft}</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/planner">
            {t.generating.backHome}
          </Link>
        </Button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-xl font-bold text-foreground">{t.generating.failed}</h1>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            className="rounded-full"
            onClick={() => {
              setStatus("idle");
              started.current = false;
            }}
          >
            {t.generating.retry}
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/planner">
              {t.generating.backHome}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center sm:px-6">
      <Loader2 className="size-10 animate-spin text-primary" />
      <h1 className="mt-6 font-display text-2xl font-extrabold text-foreground">{t.generating.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.generating.sub}</p>
    </div>
  );
}

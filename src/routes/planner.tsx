import { createFileRoute } from "@tanstack/react-router";

import { PlannerOnboarding } from "@/components/planner/PlannerOnboarding";

export const Route = createFileRoute("/planner")({
  validateSearch: (search: Record<string, unknown>): { kota?: string } => {
    const kota = search["kota"];
    return typeof kota === "string" && kota.trim() ? { kota: kota.trim() } : {};
  },
  head: () => ({
    meta: [
      { title: "Planner Liburan Indonesia | Lokamate.id" },
      {
        name: "description",
        content: "Kenalkan preferensi liburanmu dan pilih destinasi Indonesia untuk mulai menyusun perjalanan bersama Lokamate.id.",
      },
      { property: "og:title", content: "Planner Liburan Indonesia | Lokamate.id" },
      {
        property: "og:description",
        content: "Mulai rencana liburan Indonesia yang sesuai preferensi, waktu, dan gaya perjalananmu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const { kota } = Route.useSearch();
  return <PlannerOnboarding initialDestination={kota} />;
}
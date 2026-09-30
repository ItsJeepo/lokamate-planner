import { createFileRoute } from "@tanstack/react-router";

import { PlannerOnboarding } from "@/components/planner/PlannerOnboarding";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Planner Liburan Indonesia — Lokamate" },
      {
        name: "description",
        content: "Kenalkan preferensi liburanmu dan pilih destinasi Indonesia untuk mulai menyusun perjalanan bersama Lokamate.",
      },
      { property: "og:title", content: "Planner Liburan Indonesia — Lokamate" },
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
  return <PlannerOnboarding />;
}
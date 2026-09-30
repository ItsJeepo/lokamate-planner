import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { useI18n } from "@/lib/i18n";

export function OfflineBanner() {
  const { t } = useI18n();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground">
      <WifiOff className="size-4 shrink-0" />
      {t.trips.offline}
    </div>
  );
}

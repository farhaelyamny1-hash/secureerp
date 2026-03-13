import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useEffect, useState } from "react";
import { getQueue } from "@/lib/offlineSync";

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  const [queueCount, setQueueCount] = useState(0);
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setQueueCount(getQueue().length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOnline) {
      setShowOnline(true);
      const t = setTimeout(() => setShowOnline(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isOnline]);

  if (isOnline && !showOnline && queueCount === 0) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all ${
        isOnline
          ? "bg-green-500 text-white"
          : "bg-destructive text-destructive-foreground"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>تم الاتصال بالإنترنت{queueCount > 0 ? ` — جاري مزامنة ${queueCount} عنصر...` : " ✓"}</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>أنت غير متصل بالإنترنت{queueCount > 0 ? ` — ${queueCount} عنصر في الانتظار` : ""}</span>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;

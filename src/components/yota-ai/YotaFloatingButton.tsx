import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import YotaChat from "./YotaChat";
import { Link } from "react-router-dom";

const YotaFloatingButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="فتح مساعد Yota AI"
          className="fixed bottom-6 left-6 z-40 group"
        >
          <div className="relative">
            <div className="absolute inset-0 gradient-primary rounded-full blur-xl opacity-60 group-hover:opacity-90 transition-opacity animate-pulse" />
            <div className="relative w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
              AI
            </span>
          </div>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-foreground text-background text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            اسأل Yota AI
          </span>
        </button>
      )}

      {/* Popup Panel */}
      {open && (
        <div className="fixed bottom-6 left-6 z-50 w-[calc(100vw-3rem)] sm:w-[420px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          <div className="absolute top-3 right-3 z-10 flex gap-1">
            <Link to="/yota-ai">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px]"
                onClick={() => setOpen(false)}
              >
                توسيع ↗
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <YotaChat variant="popup" onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
};

export default YotaFloatingButton;

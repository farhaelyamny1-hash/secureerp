import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Play, Sparkles, ShieldCheck, Star, X } from "lucide-react";
import heroIllustration from "@/assets/hero-illustration.png";

const HeroSection = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary">
      {/* Decorative blobs */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 -right-20 w-96 h-96 rounded-full bg-accent/40 blur-[120px]" />
        <div className="absolute bottom-10 -left-20 w-[500px] h-[500px] rounded-full bg-secondary/50 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full bg-primary-foreground/10 blur-[100px]" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Right column (RTL first) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary-foreground">
                مدعوم بالذكاء الاصطناعي · Yota AI
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.15] mb-6 text-primary-foreground">
              ساعد مشروعك
              <br />
              <span className="relative inline-block">
                <span className="text-accent">لكي ينجح!</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 9 Q 100 -2 198 9"
                    stroke="hsl(var(--accent))"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-xl text-primary-foreground/85">
              SecureERP — منصة محاسبة سحابية متكاملة لإدارة الفواتير، نقاط البيع،
              المخزون، العملاء والتقارير. كل ما تحتاجه في مكان واحد.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-heading font-bold px-8 h-12 text-base shadow-xl"
                >
                  جرب SecureERP مجاناً
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-12 text-base border-primary-foreground/40 bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground font-heading"
                onClick={() => setVideoOpen(true)}
              >
                <Play className="w-4 h-4 ml-2" fill="currentColor" />
                شاهد العرض التوضيحي
              </Button>
            </div>

            {/* Trust badges (Fatora-style) */}
            <div className="flex flex-wrap items-center gap-6 mt-10">
              <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15 rounded-xl px-4 py-2">
                <Star className="w-4 h-4 text-accent" fill="currentColor" />
                <div className="leading-tight">
                  <p className="text-xs text-primary-foreground/70">تقييم العملاء</p>
                  <p className="text-sm font-bold text-primary-foreground">4.9 / 5</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15 rounded-xl px-4 py-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <div className="leading-tight">
                  <p className="text-xs text-primary-foreground/70">آمن ومشفر</p>
                  <p className="text-sm font-bold text-primary-foreground">SSL 256-bit</p>
                </div>
              </div>
              <div className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15 rounded-xl px-4 py-2">
                <p className="text-xs text-primary-foreground/70">شركات تستخدم النظام</p>
                <p className="text-sm font-bold text-primary-foreground">+2,000 شركة</p>
              </div>
            </div>
          </motion.div>

          {/* Left column - illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Floating badge - English video CTA */}
              <button
                onClick={() => setVideoOpen(true)}
                className="absolute top-4 right-4 z-20 bg-primary-foreground/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-2xl hover:scale-105 transition-transform group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <Play className="w-4 h-4 text-primary-foreground mr-[-2px]" fill="currentColor" />
                    <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-50" />
                  </div>
                  <div className="text-right leading-tight">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Watch Demo</p>
                    <p className="text-sm font-bold text-foreground">English Tour</p>
                  </div>
                </div>
              </button>

              <img
                src={heroIllustration}
                alt="SecureERP — نظام محاسبة سحابي شامل مع POS وفواتير ومخزون"
                width={1024}
                height={1024}
                className="w-full h-auto drop-shadow-2xl relative z-10"
              />

              {/* Floating mini cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-8 left-0 z-20 bg-card rounded-2xl shadow-xl p-3 border border-border"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
                    <span className="text-success text-lg">↑</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">مبيعات اليوم</p>
                    <p className="text-sm font-bold text-foreground">+24.5%</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-1/3 -left-2 z-20 bg-card rounded-2xl shadow-xl p-3 border border-border"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Yota AI</p>
                    <p className="text-sm font-bold text-foreground">جاهز للمساعدة</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* English Video Dialog */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="sm:max-w-4xl p-0 bg-black border-none overflow-hidden">
          <button
            onClick={() => setVideoOpen(false)}
            aria-label="Close"
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-background/20 hover:bg-background/40 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative w-full aspect-video">
            <video
              src="/secureerp-demo-en.mp4"
              controls
              autoPlay
              className="w-full h-full object-contain"
              poster=""
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;

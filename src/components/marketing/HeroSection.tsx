import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Play, Shield, Zap, BarChart3, X } from "lucide-react";
import logo from "@/assets/securetech-logo.png";

const HeroSection = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary/30 blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-secondary/20 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-primary-foreground/80">نظام ERP سحابي متكامل</span>
            </div>

            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6" style={{ color: 'hsl(0, 0%, 100%)' }}>
              أدِر أعمالك بالكامل
              <br />
              <span className="text-gradient">من مكان واحد</span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-lg" style={{ color: 'hsl(220, 10%, 70%)' }}>
              SecureERP يوفر لك كل ما تحتاجه لإدارة المبيعات، المخزون، الفواتير، العملاء والمزيد. ابدأ الآن وانقل عملك للمستوى التالي.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" className="gradient-primary text-primary-foreground font-heading font-semibold px-8 h-12 text-base">
                  ابدأ تجربة مجانية
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-12 text-base border-primary/30 font-heading"
                style={{ color: 'hsl(0, 0%, 90%)' }}
                onClick={() => setVideoOpen(true)}
              >
                <Play className="w-4 h-4 ml-2" />
                شاهد العرض التوضيحي
              </Button>
            </div>

            <div className="flex items-center gap-8 mt-10">
              {[
                { icon: Shield, label: "آمن 100%", value: "256-bit" },
                { icon: BarChart3, label: "شركة تستخدمنا", value: "+2,000" },
                { icon: Zap, label: "وقت التشغيل", value: "99.9%" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-xl font-bold font-heading" style={{ color: 'hsl(172, 66%, 50%)' }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: 'hsl(220, 10%, 55%)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative cursor-pointer group" onClick={() => setVideoOpen(true)}>
              <div className="bg-card/10 backdrop-blur-md border border-primary/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                {/* Logo watermark */}
                <div className="absolute top-4 left-4 z-10">
                  <img src={logo} alt="SecureTech" className="w-12 h-12 object-contain opacity-80" />
                </div>

                {/* Mock Dashboard Preview */}
                <div className="bg-card rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-heading font-semibold text-foreground text-sm">لوحة التحكم</span>
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                      <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                      <div className="w-2.5 h-2.5 rounded-full bg-success" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "المبيعات", value: "٢٤,٥٠٠", color: "bg-primary/10 text-primary" },
                      { label: "العملاء", value: "١,٢٣٤", color: "bg-secondary/10 text-secondary" },
                      { label: "الفواتير", value: "٨٥٦", color: "bg-accent/10 text-accent" },
                    ].map((card, i) => (
                      <div key={i} className={`rounded-lg p-3 ${card.color}`}>
                        <p className="text-xs font-medium opacity-70">{card.label}</p>
                        <p className="text-lg font-bold font-heading">{card.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-32 bg-muted rounded-lg flex items-end p-3 gap-1">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div key={i} className="flex-1 gradient-primary rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                {/* Play overlay */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors rounded-2xl flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Play className="w-7 h-7 text-primary-foreground mr-[-2px]" fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="sm:max-w-4xl p-0 bg-black border-none overflow-hidden">
          <div className="relative w-full aspect-video">
            <video
              src="/demo-video.mp4"
              controls
              autoPlay
              className="w-full h-full object-contain"
              poster=""
            />
            {/* Logo overlay on video */}
            <div className="absolute top-4 right-4 pointer-events-none">
              <img src={logo} alt="SecureTech" className="w-10 h-10 object-contain opacity-70" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;

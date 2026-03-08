import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-secondary/30 blur-[80px]" />
        <div className="absolute bottom-10 left-20 w-80 h-80 rounded-full bg-primary/30 blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4" style={{ color: 'hsl(0, 0%, 100%)' }}>
            جاهز لتطوير أعمالك؟
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'hsl(220, 10%, 70%)' }}>
            انضم لأكثر من 2,000 شركة تثق بـ SecureTech ERP لإدارة أعمالها
          </p>
          <Link to="/register">
            <Button size="lg" className="gradient-accent text-primary-foreground font-heading font-semibold px-10 h-12 text-base">
              ابدأ تجربتك المجانية الآن
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

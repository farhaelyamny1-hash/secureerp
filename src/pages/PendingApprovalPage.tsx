import { motion } from "framer-motion";
import { Shield, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import whatsappIcon from "@/assets/whatsapp.png";

const WHATSAPP_NUMBER = "201222350580";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "مرحبًا، لقد قمت بالتسجيل في SecureERP وأود تفعيل حسابي. شكرًا لكم."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

const PendingApprovalPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg text-center"
      >
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-2xl text-foreground">SecureERP</span>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="font-heading font-bold text-2xl text-foreground">
              تم التسجيل بنجاح! 🎉
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              شكرًا لتسجيلك في <strong className="text-foreground">SecureERP</strong>.
              حسابك قيد المراجعة حاليًا من قبل فريق الإدارة.
            </p>
          </div>

          <div className="bg-muted rounded-xl p-5 space-y-3">
            <h3 className="font-heading font-semibold text-foreground text-sm">
              ⏳ في انتظار التفعيل
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              لضمان أمان النظام وجودة الخدمة، نقوم بمراجعة كل حساب جديد يدويًا قبل التفعيل.
              سواء كنت ترغب في الباقة المجانية أو المدفوعة، يُرجى التواصل معنا لتسريع عملية التفعيل.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              تواصل معنا الآن عبر الواتساب لتفعيل حسابك:
            </p>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl text-white font-heading font-semibold text-base transition-all hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: "#25D366" }}
            >
              <img src={whatsappIcon} alt="WhatsApp" className="w-6 h-6" />
              تواصل معنا على الواتساب
            </a>

            <p className="text-xs text-muted-foreground mt-2">
              أو أرسل رسالة مباشرة إلى الرقم: <span dir="ltr" className="font-semibold">+20 122 235 0580</span>
            </p>
          </div>

          <div className="border-t border-border pt-4 text-sm text-muted-foreground">
            <p>
              بعد الموافقة على حسابك، ستتمكن من تسجيل الدخول والوصول إلى جميع ميزات النظام
              بما في ذلك إدارة الفواتير والعملاء والمنتجات والتقارير.
            </p>
          </div>

          <Link to="/login">
            <Button variant="outline" className="w-full">
              العودة لتسجيل الدخول
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingApprovalPage;

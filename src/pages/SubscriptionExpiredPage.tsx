import { motion } from "framer-motion";
import { AlertTriangle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/securetech-logo.png";
import whatsappIcon from "@/assets/whatsapp.png";

const WHATSAPP_NUMBER = "201010891984";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "مرحبًا، انتهت فترة اشتراكي في SecureERP وأرغب في تجديد الاشتراك."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

interface Props {
  type: "trial" | "expired";
}

const SubscriptionExpiredPage = ({ type }: Props) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg text-center"
      >
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src={logo} alt="SecureERP" className="w-10 h-10 object-contain" />
            <span className="font-heading font-bold text-2xl text-foreground">SecureERP</span>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>

          <div className="space-y-2">
            <h1 className="font-heading font-bold text-2xl text-foreground">
              {type === "trial"
                ? "انتهت فترة التجربة المجانية"
                : "انتهى اشتراكك"}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {type === "trial"
                ? "انتهت فترة التجربة المجانية لحسابك. يرجى الاشتراك للاستمرار في استخدام SecureERP."
                : "انتهت صلاحية اشتراكك. يرجى تجديد الاشتراك للوصول إلى لوحة التحكم."}
            </p>
          </div>

          <div className="space-y-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl text-white font-heading font-semibold text-base transition-all hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: "#25D366" }}
            >
              <img src={whatsappIcon} alt="WhatsApp" className="w-6 h-6" />
              تواصل معنا للاشتراك
            </a>
            <p className="text-xs text-muted-foreground">
              أو اتصل بنا: <span dir="ltr" className="font-semibold">01010891984</span>
            </p>
          </div>

          <Link to="/">
            <Button variant="outline" className="w-full mt-4">
              العودة للرئيسية
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          SecureERP from Yota IT
        </p>
      </motion.div>
    </div>
  );
};

export default SubscriptionExpiredPage;

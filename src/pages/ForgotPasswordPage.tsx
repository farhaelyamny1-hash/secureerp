import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Shield, ArrowRight, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast.error("حدث خطأ: " + error.message);
      return;
    }

    setSent(true);
    toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-2xl text-foreground">SecureERP</span>
          </Link>
          <h1 className="font-heading font-bold text-2xl text-foreground">نسيت كلمة المرور</h1>
          <p className="text-muted-foreground text-sm mt-1">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
        </div>

        {sent ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-heading font-semibold text-lg text-foreground">تم الإرسال ✅</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              تم إرسال رابط إعادة تعيين كلمة المرور إلى <strong className="text-foreground">{email}</strong>.
              يرجى التحقق من بريدك الإلكتروني.
            </p>

            {/* WhatsApp CTA */}
            <div className="bg-[hsl(142_70%_95%)] border border-[hsl(142_70%_80%)] rounded-xl p-5 space-y-3">
              <p className="font-heading font-semibold text-foreground text-sm">
                تحتاج مساعدة؟ برجاء التواصل معنا عبر الواتساب
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://wa.me/201010891984"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-[hsl(142_70%_45%)] hover:bg-[hsl(142_70%_38%)] text-white font-heading font-semibold text-sm transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  تواصل عبر واتساب
                </a>
                <a
                  href="https://wa.me/201222350580"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-lg border border-[hsl(142_70%_45%)] text-[hsl(142_70%_35%)] hover:bg-[hsl(142_70%_95%)] font-heading font-medium text-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  رقم احتياطي
                </a>
              </div>
            </div>

            <Link to="/login">
              <Button variant="outline" className="w-full gap-2 mt-1">
                <ArrowRight className="w-4 h-4" />
                العودة لتسجيل الدخول
              </Button>
            </Link>
          </div>
        ) : (
          <form
            className="bg-card border border-border rounded-2xl p-8 space-y-4"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">البريد الإلكتروني</label>
              <Input
                type="email"
                placeholder="example@company.com"
                className="font-body"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-primary-foreground font-heading h-11"
            >
              {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              تذكرت كلمة المرور؟{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">سجل دخول</Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error("خطأ: " + error.message);
      return;
    }

    toast.success("تم تغيير كلمة المرور بنجاح ✅");
    navigate("/login");
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="font-heading font-bold text-xl text-foreground">رابط غير صالح</h2>
          <p className="text-muted-foreground text-sm">يرجى استخدام الرابط المرسل إلى بريدك الإلكتروني</p>
          <Link to="/forgot-password">
            <Button variant="outline">طلب رابط جديد</Button>
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="font-heading font-bold text-2xl text-foreground">تعيين كلمة مرور جديدة</h1>
        </div>

        <form
          className="bg-card border border-border rounded-2xl p-8 space-y-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">كلمة المرور الجديدة</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="font-body"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">تأكيد كلمة المرور</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="font-body"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-primary-foreground font-heading h-11"
          >
            {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;

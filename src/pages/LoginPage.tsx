import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error("خطأ في تسجيل الدخول: " + error.message);
    } else {
      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/dashboard");
    }
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
          <h1 className="font-heading font-bold text-2xl text-foreground">تسجيل الدخول</h1>
          <p className="text-muted-foreground text-sm mt-1">أدخل بياناتك للوصول إلى حسابك</p>
        </div>

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
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">كلمة المرور</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="font-body"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-primary-foreground font-heading h-11"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">سجل الآن</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const LoginPage = () => {
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
            <span className="font-heading font-bold text-2xl text-foreground">SecureTech</span>
          </Link>
          <h1 className="font-heading font-bold text-2xl text-foreground">تسجيل الدخول</h1>
          <p className="text-muted-foreground text-sm mt-1">أدخل بياناتك للوصول إلى حسابك</p>
        </div>

        <form
          className="bg-card border border-border rounded-2xl p-8 space-y-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">البريد الإلكتروني</label>
            <Input type="email" placeholder="example@company.com" className="font-body" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">كلمة المرور</label>
            <Input type="password" placeholder="••••••••" className="font-body" />
          </div>
          <Button className="w-full gradient-primary text-primary-foreground font-heading h-11">دخول</Button>
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

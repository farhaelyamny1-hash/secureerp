import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
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
          <h1 className="font-heading font-bold text-2xl text-foreground">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground text-sm mt-1">ابدأ تجربتك المجانية لمدة 14 يوم</p>
        </div>

        <form
          className="bg-card border border-border rounded-2xl p-8 space-y-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">الاسم الأول</label>
              <Input placeholder="أحمد" className="font-body" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">اسم العائلة</label>
              <Input placeholder="العلي" className="font-body" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">اسم الشركة</label>
            <Input placeholder="شركتي" className="font-body" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">البريد الإلكتروني</label>
            <Input type="email" placeholder="example@company.com" className="font-body" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">كلمة المرور</label>
            <Input type="password" placeholder="••••••••" className="font-body" />
          </div>
          <Button className="w-full gradient-primary text-primary-foreground font-heading h-11">إنشاء الحساب</Button>
          <p className="text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">سجل دخول</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

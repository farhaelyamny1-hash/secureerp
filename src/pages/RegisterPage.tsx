import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, {
      first_name: firstName,
      last_name: lastName,
    });

    if (error) {
      toast.error("خطأ في التسجيل: " + error.message);
      setLoading(false);
      return;
    }

    // Create company after signup
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Get starter plan
      const { data: plan } = await supabase
        .from("plans")
        .select("id")
        .eq("slug", "starter")
        .single();

      const { data: company } = await supabase
        .from("companies")
        .insert({
          owner_id: user.id,
          name: companyName || `شركة ${firstName}`,
          plan_id: plan?.id,
        })
        .select()
        .single();

      if (company && plan) {
        await supabase.from("subscriptions").insert({
          company_id: company.id,
          plan_id: plan.id,
          status: "trial",
          billing_cycle: "monthly",
        });
      }
    }

    setLoading(false);
    toast.success("تم إنشاء الحساب بنجاح!");
    navigate("/dashboard");
  };

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
            <span className="font-heading font-bold text-2xl text-foreground">SecureERP</span>
          </Link>
          <h1 className="font-heading font-bold text-2xl text-foreground">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground text-sm mt-1">ابدأ تجربتك المجانية لمدة 14 يوم</p>
        </div>

        <form
          className="bg-card border border-border rounded-2xl p-8 space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">الاسم الأول</label>
              <Input placeholder="أحمد" className="font-body" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">اسم العائلة</label>
              <Input placeholder="العلي" className="font-body" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">اسم الشركة</label>
            <Input placeholder="شركتي" className="font-body" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">البريد الإلكتروني</label>
            <Input type="email" placeholder="example@company.com" className="font-body" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">كلمة المرور</label>
            <Input type="password" placeholder="••••••••" className="font-body" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-primary-foreground font-heading h-11"
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
          </Button>
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

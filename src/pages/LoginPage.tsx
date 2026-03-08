import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const ensureCompanySetup = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [ownerCompanyRes, memberCompanyRes] = await Promise.all([
      supabase.from("companies").select("id").eq("owner_id", user.id).maybeSingle(),
      supabase.from("company_members").select("company_id").eq("user_id", user.id).maybeSingle(),
    ]);

    if (ownerCompanyRes.data || memberCompanyRes.data) return;

    const { data: plan } = await supabase
      .from("plans")
      .select("id")
      .eq("slug", "starter")
      .maybeSingle();

    const firstName = typeof user.user_metadata?.first_name === "string"
      ? user.user_metadata.first_name.trim()
      : "";
    const metadataCompany = typeof user.user_metadata?.company_name === "string"
      ? user.user_metadata.company_name.trim()
      : "";

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        owner_id: user.id,
        name: metadataCompany || (firstName ? `شركة ${firstName}` : "شركتي"),
        plan_id: plan?.id ?? null,
      })
      .select("id")
      .single();

    if (companyError || !company) return;

    if (plan?.id) {
      await supabase.from("subscriptions").insert({
        company_id: company.id,
        plan_id: plan.id,
        status: "trial",
        billing_cycle: "monthly",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      setLoading(false);
      if (error.message?.toLowerCase().includes("email not confirmed")) {
        toast.error("يرجى تفعيل البريد الإلكتروني أولًا قبل تسجيل الدخول.");
        return;
      }
      toast.error("خطأ في تسجيل الدخول: " + error.message);
      return;
    }

    await ensureCompanySetup();
    setLoading(false);
    toast.success("تم تسجيل الدخول بنجاح");
    navigate("/dashboard");
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

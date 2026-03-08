import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Check, ArrowRight, Copy, Send, Globe, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import vodafoneCashImg from "@/assets/vodafone-cash.png";
import instapayImg from "@/assets/instapay.png";
import whatsappImg from "@/assets/whatsapp.png";

const PHONE_NUMBER = "01222350580";
const WHATSAPP_NUMBER = "2001222350580";

const plans = [
  { slug: "starter", name: "المبتدئ", priceMonthly: 49, priceYearly: 470 },
  { slug: "professional", name: "الاحترافي", priceMonthly: 99, priceYearly: 950 },
  { slug: "enterprise", name: "المؤسسات", priceMonthly: 199, priceYearly: 1900 },
];

type PaymentMethod = "vodafone_cash" | "instapay" | "whatsapp" | "web_form";
type BillingCycle = "monthly" | "yearly";

const paymentMethods: { id: PaymentMethod; label: string; icon: string | null; desc: string; color: string }[] = [
  {
    id: "vodafone_cash",
    label: "Vodafone Cash",
    icon: vodafoneCashImg,
    desc: `أرسل المبلغ إلى رقم ${PHONE_NUMBER}`,
    color: "border-destructive/40 hover:border-destructive bg-destructive/5",
  },
  {
    id: "instapay",
    label: "InstaPay",
    icon: instapayImg,
    desc: `حوّل المبلغ عبر InstaPay إلى ${PHONE_NUMBER}`,
    color: "border-primary/40 hover:border-primary bg-primary/5",
  },
  {
    id: "whatsapp",
    label: "واتساب",
    icon: whatsappImg,
    desc: "أرسل إيصال الدفع عبر واتساب",
    color: "border-success/40 hover:border-success bg-success/5",
  },
  {
    id: "web_form",
    label: "إرسال عبر الموقع",
    icon: null,
    desc: "أرسل بيانات الدفع عبر النموذج هنا",
    color: "border-secondary/40 hover:border-secondary bg-secondary/5",
  },
];

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const planSlug = searchParams.get("plan") || "starter";
  const selectedPlan = plans.find((p) => p.slug === planSlug) || plans[0];

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Web form state
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const price = billingCycle === "monthly" ? selectedPlan.priceMonthly : selectedPlan.priceYearly;

  const copyNumber = () => {
    navigator.clipboard.writeText(PHONE_NUMBER);
    toast.success("تم نسخ الرقم");
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `مرحباً، أريد الاشتراك في خطة ${selectedPlan.name} (${billingCycle === "monthly" ? "شهري" : "سنوي"}) بمبلغ $${price}.\nاسم المرسل: ${senderName || "—"}\nرقم الهاتف: ${senderPhone || "—"}\nرقم المعاملة: ${transactionRef || "—"}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleWebSubmit = async () => {
    if (!senderName || !senderPhone) {
      toast.error("يرجى ملء الاسم ورقم الهاتف");
      return;
    }
    setSubmitting(true);

    // Store payment request in notifications or a simple approach
    if (user) {
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (company) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          company_id: company.id,
          title: "طلب اشتراك جديد",
          message: `خطة: ${selectedPlan.name} | ${billingCycle === "monthly" ? "شهري" : "سنوي"} | $${price} | الطريقة: ${selectedMethod} | المرسل: ${senderName} | الهاتف: ${senderPhone} | المرجع: ${transactionRef} | ملاحظات: ${notes}`,
          type: "payment",
        });
      }
    }

    setSubmitting(false);
    setStep(3);
    toast.success("تم إرسال طلب الاشتراك بنجاح!");
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-2xl text-foreground">SecureTech</span>
          </Link>
          <h1 className="font-heading font-bold text-3xl text-foreground">إتمام الاشتراك</h1>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { n: 1, label: "اختر الطريقة" },
            { n: 2, label: "أرسل الدفع" },
            { n: 3, label: "تأكيد" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-heading transition-all ${
                  step >= s.n
                    ? "gradient-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.n ? <Check className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${step >= s.n ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i < 2 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Plan summary */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground">الخطة المختارة</p>
              <p className="font-heading font-bold text-xl text-foreground">{selectedPlan.name}</p>
            </div>

            {/* Billing toggle */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                شهري
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  billingCycle === "yearly"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                سنوي <span className="text-success text-xs font-bold">وفّر 20%</span>
              </button>
            </div>

            <div className="text-left">
              <p className="font-heading font-bold text-3xl text-foreground">${price}</p>
              <p className="text-xs text-muted-foreground">
                {billingCycle === "monthly" ? "/ شهرياً" : "/ سنوياً"}
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Choose payment method */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="font-heading font-semibold text-lg text-foreground mb-4">اختر طريقة الدفع</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`relative rounded-xl border-2 p-5 text-right transition-all duration-200 ${
                      selectedMethod === method.id
                        ? method.color + " ring-2 ring-offset-2 ring-primary/30"
                        : "border-border hover:border-muted-foreground/30 bg-card"
                    }`}
                  >
                    {selectedMethod === method.id && (
                      <div className="absolute top-3 left-3 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      {method.icon ? (
                        <img src={method.icon} alt={method.label} className="w-10 h-10 rounded-lg object-contain" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-secondary" />
                        </div>
                      )}
                      <span className="font-heading font-bold text-foreground">{method.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{method.desc}</p>
                  </button>
                ))}
              </div>

              <Button
                className="w-full gradient-primary text-primary-foreground font-heading h-12 mt-6"
                disabled={!selectedMethod}
                onClick={() => setStep(2)}
              >
                متابعة
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <button onClick={() => setStep(1)} className="text-sm text-primary hover:underline font-medium">
                ← تغيير طريقة الدفع
              </button>

              {/* Payment instructions */}
              {(selectedMethod === "vodafone_cash" || selectedMethod === "instapay") && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedMethod === "vodafone_cash" ? vodafoneCashImg : instapayImg}
                      alt=""
                      className="w-10 h-10 rounded-lg object-contain"
                    />
                    <h3 className="font-heading font-bold text-lg text-foreground">
                      {selectedMethod === "vodafone_cash" ? "Vodafone Cash" : "InstaPay"}
                    </h3>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">أرسل المبلغ <strong className="text-foreground">${price}</strong> إلى الرقم:</p>
                    <div className="flex items-center gap-3">
                      <span className="font-heading font-bold text-2xl text-foreground tracking-wider" dir="ltr">
                        {PHONE_NUMBER}
                      </span>
                      <button
                        onClick={copyNumber}
                        className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        title="نسخ الرقم"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    بعد إتمام التحويل، أرسل إيصال الدفع عبر واتساب أو أدخل بيانات المعاملة أدناه
                  </p>
                </div>
              )}

              {/* Sender info form */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="font-heading font-semibold text-foreground">بيانات الدفع</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">اسم المرسل *</label>
                    <Input
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="أحمد محمد"
                      className="font-body"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">رقم الهاتف *</label>
                    <Input
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="font-body"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">رقم المعاملة / المرجع</label>
                  <Input
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="اختياري"
                    className="font-body"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">ملاحظات</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي تفاصيل إضافية..."
                    rows={3}
                    className="font-body"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* WhatsApp button */}
                <Button
                  onClick={openWhatsApp}
                  className="h-12 font-heading text-base gap-2"
                  style={{ backgroundColor: "hsl(134, 61%, 41%)", color: "white" }}
                >
                  <img src={whatsappImg} alt="WhatsApp" className="w-6 h-6" />
                  إرسال عبر واتساب
                </Button>

                {/* Web submit */}
                <Button
                  onClick={handleWebSubmit}
                  disabled={submitting}
                  className="h-12 font-heading text-base gradient-primary text-primary-foreground gap-2"
                >
                  <Send className="w-5 h-5" />
                  {submitting ? "جاري الإرسال..." : "إرسال عبر الموقع"}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-3">تم إرسال طلبك بنجاح!</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                سنراجع دفعتك وسيتم تفعيل اشتراكك خلال ساعات قليلة. ستصلك رسالة تأكيد.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => navigate("/")}>
                  العودة للرئيسية
                </Button>
                <Button className="gradient-primary text-primary-foreground font-heading" onClick={() => navigate("/dashboard")}>
                  الذهاب للوحة التحكم
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CheckoutPage;

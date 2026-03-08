import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CURRENCY_OPTIONS } from "@/lib/currency";
import { getCompanyProfile } from "@/lib/company";

const SettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    tax_number: "",
    currency: "EGP",
  });

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const company = await getCompanyProfile(user.id);
        if (!company) {
          toast.error("لا توجد شركة مرتبطة بحسابك");
          return;
        }

        setCompanyId(company.id);
        setForm({
          name: company.name || "",
          email: company.email || "",
          phone: company.phone || "",
          address: company.address || "",
          tax_number: company.tax_number || "",
          currency: company.currency || "EGP",
        });
      } catch {
        toast.error("تعذر تحميل إعدادات الشركة");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [user]);

  const handleSave = async () => {
    if (!companyId) return;
    if (!form.name.trim()) {
      toast.error("اسم الشركة مطلوب");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("companies")
      .update({
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        tax_number: form.tax_number || null,
        currency: form.currency,
      })
      .eq("id", companyId);

    setSaving(false);

    if (error) {
      toast.error("تعذر حفظ الإعدادات");
      return;
    }

    toast.success("تم حفظ إعدادات الشركة");
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">جاري تحميل الإعدادات...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground">إعدادات الشركة</h1>
        <p className="text-sm text-muted-foreground">حدّث بيانات الشركة والعملة الافتراضية للنظام</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading">البيانات الأساسية</CardTitle>
          <CardDescription>هذه المعلومات تظهر في الفواتير والتقارير والطباعة.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="اسم الشركة"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Select
              value={form.currency}
              onValueChange={(value) => setForm((prev) => ({ ...prev, currency: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر العملة" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.code} value={option.code}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="البريد الإلكتروني"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <Input
              placeholder="رقم الهاتف"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </div>

          <Input
            placeholder="الرقم الضريبي"
            value={form.tax_number}
            onChange={(event) => setForm((prev) => ({ ...prev, tax_number: event.target.value }))}
          />

          <Textarea
            placeholder="العنوان"
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          />

          <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground">
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CURRENCY_OPTIONS } from "@/lib/currency";
import { getCompanyProfile } from "@/lib/company";

interface BusinessCategory {
  id: string;
  name_ar: string;
  name_en: string;
}

const SettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    tax_number: "",
    currency: "EGP",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const company = await getCompanyProfile(user.id);
        if (!company) {
          toast.error("لا توجد شركة مرتبطة بحسابك");
          return;
        }
        setCompanyId(company.id);
        setLogoUrl(company.logo_url);
        setForm({
          name: company.name || "",
          email: company.email || "",
          phone: company.phone || "",
          address: company.address || "",
          tax_number: company.tax_number || "",
          currency: company.currency || "EGP",
        });

        // Fetch business category
        const { data: companyData } = await supabase
          .from("companies")
          .select("business_category_id")
          .eq("id", company.id)
          .maybeSingle();
        setSelectedCategoryId(companyData?.business_category_id || null);

        // Fetch all categories
        const { data: cats } = await supabase
          .from("business_categories")
          .select("id, name_ar, name_en")
          .order("created_at");
        setBusinessCategories(cats || []);
      } catch {
        toast.error("تعذر تحميل إعدادات الشركة");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;
    if (!file.type.startsWith("image/")) { toast.error("يرجى اختيار ملف صورة"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("حجم الصورة يجب ألا يتجاوز 2 ميجابايت"); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${companyId}/logo.${ext}`;
    const { error: uploadError } = await supabase.storage.from("company-logos").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("تعذر رفع الشعار"); setUploading(false); return; }

    const { data: publicUrlData } = supabase.storage.from("company-logos").getPublicUrl(path);
    const newUrl = publicUrlData.publicUrl + "?t=" + Date.now();
    const { error: updateError } = await supabase.from("companies").update({ logo_url: publicUrlData.publicUrl }).eq("id", companyId);
    setUploading(false);
    if (updateError) { toast.error("تعذر حفظ رابط الشعار"); return; }
    setLogoUrl(newUrl);
    toast.success("تم رفع الشعار بنجاح");
  };

  const handleRemoveLogo = async () => {
    if (!companyId) return;
    await supabase.from("companies").update({ logo_url: null }).eq("id", companyId);
    setLogoUrl(null);
    toast.success("تم إزالة الشعار");
  };

  const handleCategoryChange = async (categoryId: string) => {
    if (!companyId) return;
    setSelectedCategoryId(categoryId);

    const { error } = await supabase
      .from("companies")
      .update({ business_category_id: categoryId })
      .eq("id", companyId);

    if (error) {
      toast.error("تعذر تحديث نوع النشاط");
      return;
    }

    // Suggest adding new default categories
    const { data: cat } = await supabase
      .from("business_categories")
      .select("default_product_categories, default_services")
      .eq("id", categoryId)
      .maybeSingle();

    if (cat) {
      const productCats = Array.isArray(cat.default_product_categories) ? (cat.default_product_categories as string[]) : [];
      const serviceCats = Array.isArray(cat.default_services) ? (cat.default_services as string[]) : [];

      // Get existing categories
      const { data: existing } = await supabase
        .from("categories")
        .select("name")
        .eq("company_id", companyId);

      const existingNames = new Set((existing || []).map(c => c.name));
      const newCats = [
        ...productCats.filter(n => !existingNames.has(n)).map(name => ({ company_id: companyId, name, type: "product" })),
        ...serviceCats.filter(n => !existingNames.has(n)).map(name => ({ company_id: companyId, name, type: "service" })),
      ];

      if (newCats.length > 0) {
        await supabase.from("categories").insert(newCats);
        toast.success(`تم إضافة ${newCats.length} فئة جديدة مقترحة`);
      } else {
        toast.success("تم تحديث نوع النشاط");
      }
    }
  };

  const handleSave = async () => {
    if (!companyId) return;
    if (!form.name.trim()) { toast.error("اسم الشركة مطلوب"); return; }
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
    if (error) { toast.error("تعذر حفظ الإعدادات"); return; }
    toast.success("تم حفظ إعدادات الشركة");
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">جاري تحميل الإعدادات...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground">إعدادات الشركة</h1>
        <p className="text-sm text-muted-foreground">حدّث بيانات الشركة والعملة والشعار ونوع النشاط</p>
      </div>

      {/* Business Category */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading">نوع النشاط التجاري</CardTitle>
          <CardDescription>اختر نوع نشاطك التجاري لتخصيص النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCategoryId || ""} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="اختر نوع النشاط" />
            </SelectTrigger>
            <SelectContent>
              {businessCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name_ar} ({cat.name_en})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Logo Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading">شعار الشركة</CardTitle>
          <CardDescription>يظهر الشعار في الفواتير والتقارير المطبوعة (الحد الأقصى 2 ميجابايت)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <div className="relative">
                <img src={logoUrl} alt="شعار الشركة" className="w-24 h-24 object-contain rounded-lg border border-border bg-muted p-2" />
                <button onClick={handleRemoveLogo} className="absolute -top-2 -left-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:opacity-80">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                <Upload className="w-8 h-8" />
              </div>
            )}
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
              <Button variant="outline" asChild disabled={uploading}>
                <span>{uploading ? "جاري الرفع..." : "رفع شعار"}</span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading">البيانات الأساسية</CardTitle>
          <CardDescription>هذه المعلومات تظهر في الفواتير والتقارير والطباعة.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="اسم الشركة" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <Select value={form.currency} onValueChange={(v) => setForm((p) => ({ ...p, currency: v }))}>
              <SelectTrigger><SelectValue placeholder="اختر العملة" /></SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((o) => (
                  <SelectItem key={o.code} value={o.code}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            <Input placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <Input placeholder="الرقم الضريبي" value={form.tax_number} onChange={(e) => setForm((p) => ({ ...p, tax_number: e.target.value }))} />
          <Textarea placeholder="العنوان" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground">
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;

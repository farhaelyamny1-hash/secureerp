import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Camera, Monitor, Network, Zap, ShoppingCart, Pill, Stethoscope, UtensilsCrossed, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getUserCompanyId } from "@/lib/company";
import { toast } from "sonner";
import logo from "@/assets/securetech-logo.png";

interface BusinessCategory {
  id: string;
  name_ar: string;
  name_en: string;
  icon: string;
  default_product_categories: string[];
  default_services: string[];
}

const iconMap: Record<string, React.ElementType> = {
  Camera, Monitor, Network, Zap, ShoppingCart, Pill, Stethoscope, UtensilsCrossed, Store,
};

const BusinessSetupPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("business_categories")
        .select("*")
        .order("created_at");
      if (data) {
        setCategories(data.map(c => ({
          ...c,
          default_product_categories: Array.isArray(c.default_product_categories) ? c.default_product_categories as string[] : [],
          default_services: Array.isArray(c.default_services) ? c.default_services as string[] : [],
        })));
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const handleContinue = async () => {
    if (!selected || !user) return;
    setSaving(true);

    try {
      const companyId = await getUserCompanyId(user.id);
      if (!companyId) {
        toast.error("لا توجد شركة مرتبطة بحسابك");
        setSaving(false);
        return;
      }

      const category = categories.find(c => c.id === selected);
      if (!category) return;

      // Update company with business category
      await supabase
        .from("companies")
        .update({
          business_category_id: selected,
          setup_completed: true,
        })
        .eq("id", companyId);

      // Create default product categories
      const productCats = category.default_product_categories.map(name => ({
        company_id: companyId,
        name,
        type: "product",
      }));
      const serviceCats = category.default_services.map(name => ({
        company_id: companyId,
        name,
        type: "service",
      }));

      const allCats = [...productCats, ...serviceCats];
      if (allCats.length > 0) {
        await supabase.from("categories").insert(allCats);
      }

      toast.success("تم إعداد نشاطك التجاري بنجاح!");
      navigate("/dashboard");
    } catch {
      toast.error("حدث خطأ أثناء الإعداد");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div className="text-center mb-8">
          <img src={logo} alt="SecureERP" className="w-12 h-12 object-contain mx-auto mb-4" />
          <h1 className="font-heading font-bold text-2xl text-foreground">اختر نوع نشاطك التجاري</h1>
          <p className="text-muted-foreground text-sm mt-2">
            سيتم إعداد النظام تلقائياً بالفئات والخدمات المناسبة لنشاطك
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {categories.map((cat) => {
            const IconComp = iconMap[cat.icon || ""] || Store;
            const isSelected = selected === cat.id;
            return (
              <Card
                key={cat.id}
                onClick={() => setSelected(cat.id)}
                className={`cursor-pointer p-4 text-center transition-all hover:shadow-md ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <p className="font-heading font-semibold text-sm text-foreground">{cat.name_ar}</p>
                <p className="text-xs text-muted-foreground mt-1">{cat.name_en}</p>
                {isSelected && (
                  <div className="absolute top-2 left-2">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-5 mb-6"
          >
            <h3 className="font-heading font-semibold text-foreground mb-3">
              سيتم إنشاء الفئات التالية تلقائياً:
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                ...categories.find(c => c.id === selected)!.default_product_categories,
                ...categories.find(c => c.id === selected)!.default_services,
              ].map((name, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selected || saving}
            className="gradient-primary text-primary-foreground px-8"
          >
            {saving ? "جاري الإعداد..." : "متابعة"}
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              if (!user) return;
              const companyId = await getUserCompanyId(user.id);
              if (companyId) {
                await supabase.from("companies").update({ setup_completed: true }).eq("id", companyId);
              }
              navigate("/dashboard");
            }}
          >
            تخطي
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default BusinessSetupPage;

import { motion } from "framer-motion";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "عرض التشجيع",
    nameEn: "Starter",
    slug: "starter",
    price: "١٦٩",
    period: "شهرياً",
    desc: "مثالي للأعمال الصغيرة والمبتدئين",
    features: [
      "حتى 3 مستخدمين",
      "100 فاتورة شهرياً",
      "إدارة العملاء",
      "إدارة المنتجات",
      "تقارير أساسية",
      "دعم بالبريد الإلكتروني",
    ],
    popular: false,
  },
  {
    name: "الاحترافي",
    nameEn: "Professional",
    slug: "professional",
    price: "٣٢٩",
    period: "شهرياً",
    desc: "للشركات المتوسطة التي تحتاج مميزات متقدمة",
    features: [
      "حتى 15 مستخدم",
      "فواتير غير محدودة",
      "إدارة المخزون",
      "عروض الأسعار",
      "تقارير متقدمة",
      "تصدير Excel و PDF",
      "دعم أولوية",
      "تكاملات API",
    ],
    popular: true,
  },
  {
    name: "المؤسسات",
    nameEn: "Enterprise",
    slug: "enterprise",
    price: "٦٤٩",
    period: "شهرياً",
    desc: "للشركات الكبيرة مع احتياجات متقدمة",
    features: [
      "مستخدمين غير محدودين",
      "كافة المميزات",
      "صلاحيات متقدمة",
      "قوالب فواتير مخصصة",
      "تقارير مخصصة",
      "مدير حساب مخصص",
      "SLA مضمون",
      "تدريب الفريق",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-secondary font-heading">الأسعار</span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mt-2 mb-4">
            خطط تناسب جميع الأعمال
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            ابدأ مجاناً لمدة 14 يوم. بدون بطاقة ائتمان. قم بالترقية في أي وقت.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-card rounded-2xl p-8 border ${
                plan.popular
                  ? "border-primary shadow-xl shadow-primary/10 scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  الأكثر شعبية
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-heading font-bold text-xl text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
              </div>

              <div className="mb-6">
                <span className="font-heading font-bold text-4xl text-foreground">${plan.price}</span>
                <span className="text-muted-foreground text-sm mr-1">/ {plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link to={`/checkout?plan=${plan.slug}`}>
                <Button
                  className={`w-full font-heading ${
                    plan.popular
                      ? "gradient-primary text-primary-foreground"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  ابدأ الآن
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

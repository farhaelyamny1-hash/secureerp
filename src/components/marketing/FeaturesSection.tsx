import { motion } from "framer-motion";
import {
  Users, Package, FileText, CreditCard, BarChart3, ShoppingCart,
  Warehouse, Receipt, Shield, Bell, Search, Settings
} from "lucide-react";

const features = [
  { icon: BarChart3, title: "لوحة تحكم ذكية", desc: "إحصائيات فورية ورسوم بيانية تفاعلية لمتابعة أداء أعمالك" },
  { icon: Users, title: "إدارة العملاء", desc: "قاعدة بيانات شاملة للعملاء مع سجل كامل للتعاملات" },
  { icon: Package, title: "إدارة المنتجات", desc: "كتالوج متكامل للمنتجات مع التصنيفات وإدارة المخزون" },
  { icon: Warehouse, title: "إدارة المخزون", desc: "تتبع المخزون بدقة مع تنبيهات المخزون المنخفض" },
  { icon: FileText, title: "عروض الأسعار", desc: "إنشاء عروض أسعار احترافية وتحويلها لفواتير بنقرة" },
  { icon: Receipt, title: "الفواتير", desc: "فواتير احترافية مع الضرائب والخصومات وتحميل PDF" },
  { icon: CreditCard, title: "المدفوعات", desc: "تسجيل ومتابعة المدفوعات وربطها بالفواتير" },
  { icon: ShoppingCart, title: "المصروفات", desc: "تتبع المصروفات وتصنيفها لتحليل التكاليف" },
  { icon: BarChart3, title: "التقارير", desc: "تقارير مفصلة للمبيعات والأرباح والمصروفات" },
  { icon: Shield, title: "الأمان", desc: "تشفير متقدم وصلاحيات مخصصة لكل مستخدم" },
  { icon: Bell, title: "التنبيهات", desc: "تنبيهات فورية للفواتير المتأخرة والمخزون المنخفض" },
  { icon: Search, title: "بحث شامل", desc: "بحث سريع وشامل عبر كافة أقسام النظام" },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-secondary font-heading">المميزات</span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mt-2 mb-4">
            كل ما تحتاجه في مكان واحد
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            أكثر من 12 وحدة متكاملة تغطي جميع احتياجات إدارة أعمالك من المبيعات والمشتريات وحتى التقارير والتحليلات
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:gradient-primary transition-all duration-300">
                <feature.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

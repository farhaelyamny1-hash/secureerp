import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";

const docs = [
  { title: "دليل بدء الاستخدام", desc: "خطوات إعداد حسابك وإنشاء أول فاتورة." },
  { title: "إدارة المنتجات والمخزون", desc: "كيفية إضافة المنتجات وتتبع المخزون بفعالية." },
  { title: "نظام الفواتير", desc: "إنشاء وإدارة الفواتير وعروض الأسعار." },
  { title: "التقارير والتحليلات", desc: "فهم التقارير المالية واستخدامها لتحسين أعمالك." },
  { title: "إدارة المستخدمين والصلاحيات", desc: "إعداد فريق العمل وتحديد صلاحيات كل مستخدم." },
  { title: "الأمان والنسخ الاحتياطي", desc: "حماية بياناتك وإنشاء نسخ احتياطية منتظمة." },
];

const DocumentationPage = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-heading font-bold text-4xl text-foreground mb-4">الوثائق والأدلة</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            أدلة شاملة لمساعدتك على استخدام جميع مميزات SecureERP بكفاءة.
          </p>
        </motion.div>

        <div className="space-y-4">
          {docs.map((doc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-foreground">{doc.title}</h3>
                <p className="text-sm text-muted-foreground">{doc.desc}</p>
              </div>
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/contact">
            <Button variant="outline" className="font-heading">هل تحتاج مساعدة إضافية؟ تواصل معنا</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;

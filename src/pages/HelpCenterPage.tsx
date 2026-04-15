import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle, FileText, HelpCircle, Mail, Phone } from "lucide-react";

const helpTopics = [
  { icon: BookOpen, title: "بدء الاستخدام", desc: "تعلم كيفية إعداد حسابك وبدء استخدام SecureERP لأول مرة.", link: null },
  { icon: FileText, title: "إدارة الفواتير", desc: "كيفية إنشاء الفواتير وإرسالها وتتبع حالة الدفع.", link: null },
  { icon: HelpCircle, title: "إدارة المخزون", desc: "تتبع المنتجات والمخزون وإعداد تنبيهات المخزون المنخفض.", link: null },
  { icon: MessageCircle, title: "إدارة العملاء", desc: "إضافة العملاء وإدارة بياناتهم وسجل تعاملاتهم.", link: null },
];

const HelpCenterPage = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-heading font-bold text-4xl text-foreground mb-4">مركز المساعدة</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            ابحث عن إجابات لأسئلتك أو تواصل مع فريق الدعم. نحن هنا لمساعدتك على تحقيق أقصى استفادة من SecureERP.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {helpTopics.map((topic, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-lg transition-all"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <topic.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{topic.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{topic.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-8 text-center"
        >
          <h2 className="font-heading font-semibold text-2xl text-foreground mb-3">لم تجد ما تبحث عنه؟</h2>
          <p className="text-muted-foreground mb-6">تواصل مع فريق الدعم وسنساعدك في أقرب وقت ممكن.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button className="gradient-primary text-primary-foreground font-heading gap-2">
                <Mail className="w-4 h-4" />
                تواصل معنا
              </Button>
            </Link>
            <a href="tel:01010891984">
              <Button variant="outline" className="font-heading gap-2">
                <Phone className="w-4 h-4" />
                اتصل بنا: 01010891984
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpCenterPage;

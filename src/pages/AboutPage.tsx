import { motion } from "framer-motion";
import { Shield, Target, Users, Globe } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-heading font-bold text-4xl text-foreground mb-4">عن SecureERP</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            نحن فريق شغوف بتطوير حلول تقنية تساعد الشركات على النمو والنجاح
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {[
            { icon: Target, title: "رؤيتنا", desc: "أن نكون المنصة الرائدة لإدارة الأعمال في المنطقة العربية" },
            { icon: Shield, title: "مهمتنا", desc: "تمكين الشركات من إدارة أعمالها بكفاءة وأمان عبر تقنيات حديثة" },
            { icon: Users, title: "فريقنا", desc: "أكثر من 50 مطور ومصمم يعملون على تحسين النظام بشكل مستمر" },
            { icon: Globe, title: "تواجدنا", desc: "نخدم أكثر من 2,000 شركة في أكثر من 15 دولة عربية" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-8"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

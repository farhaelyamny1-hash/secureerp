import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "أحمد العلي",
    role: "مدير عام، شركة النور",
    text: "SecureERP غيّر طريقة إدارتنا للأعمال بالكامل. أصبح كل شيء منظم وسريع. أنصح به بشدة.",
  },
  {
    name: "سارة الخالدي",
    role: "مديرة المالية، مجموعة الوفاء",
    text: "الفواتير والتقارير أصبحت أسهل بكثير. وفّرنا أكثر من 20 ساعة أسبوعياً في العمل الإداري.",
  },
  {
    name: "محمد الراشد",
    role: "صاحب متجر إلكتروني",
    text: "إدارة المخزون والعملاء في مكان واحد. النظام سهل الاستخدام ودعمهم الفني ممتاز.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-secondary font-heading">آراء العملاء</span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mt-2 mb-4">
            عملاؤنا يحبون SecureERP
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-8"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm">"{t.text}"</p>
              <div>
                <p className="font-heading font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

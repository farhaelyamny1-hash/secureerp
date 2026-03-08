import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  { q: "هل يمكنني تجربة النظام مجاناً؟", a: "نعم، نوفر تجربة مجانية لمدة 14 يوم بدون الحاجة لبطاقة ائتمان." },
  { q: "هل بياناتي آمنة؟", a: "نعم، نستخدم تشفير 256-bit ونطبق أعلى معايير الأمان لحماية بياناتك." },
  { q: "هل يمكنني تغيير خطتي لاحقاً؟", a: "بالطبع، يمكنك الترقية أو تخفيض خطتك في أي وقت من إعدادات حسابك." },
  { q: "هل يدعم النظام اللغة العربية؟", a: "نعم، النظام مصمم بالكامل باللغة العربية مع دعم كامل لاتجاه RTL." },
  { q: "كيف يمكنني الحصول على الدعم؟", a: "نوفر دعم عبر البريد الإلكتروني والدردشة المباشرة. خطة المؤسسات تتضمن مدير حساب مخصص." },
  { q: "هل يمكنني تصدير بياناتي؟", a: "نعم، يمكنك تصدير التقارير إلى Excel والفواتير إلى PDF في أي وقت." },
];

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-secondary font-heading">الأسئلة الشائعة</span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mt-2">
            إجابات لأسئلتك
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-right"
              >
                <span className="font-heading font-semibold text-foreground">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

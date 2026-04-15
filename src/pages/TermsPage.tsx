import { motion } from "framer-motion";

const TermsPage = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading font-bold text-4xl text-foreground mb-8">الشروط والأحكام</h1>
          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-foreground font-medium">آخر تحديث: أبريل 2026</p>

            <section className="space-y-3">
              <h2 className="font-heading font-semibold text-2xl text-foreground">١. القبول بالشروط</h2>
              <p>باستخدامك لمنصة SecureERP المقدمة من شركة Yota IT، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا لم توافق على أي جزء منها، يرجى عدم استخدام المنصة.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading font-semibold text-2xl text-foreground">٢. وصف الخدمة</h2>
              <p>SecureERP هي منصة سحابية لإدارة الأعمال تشمل إدارة الفواتير، المخزون، العملاء، المصروفات، والتقارير المالية. تُقدم الخدمة عبر نموذج اشتراك شهري أو سنوي.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading font-semibold text-2xl text-foreground">٣. الحسابات والأمان</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك.</li>
                <li>يجب إبلاغنا فوراً عن أي استخدام غير مصرح به لحسابك.</li>
                <li>نحتفظ بالحق في تعليق أو إنهاء الحسابات التي تنتهك هذه الشروط.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading font-semibold text-2xl text-foreground">٤. الاشتراكات والدفع</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>تُجدد الاشتراكات تلقائياً ما لم يتم إلغاؤها قبل تاريخ التجديد.</li>
                <li>الأسعار قابلة للتغيير مع إشعار مسبق لا يقل عن 30 يوماً.</li>
                <li>لا تُسترد المبالغ المدفوعة عن الفترات المستخدمة.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading font-semibold text-2xl text-foreground">٥. الملكية الفكرية</h2>
              <p>جميع حقوق الملكية الفكرية للمنصة والتصميم والكود مملوكة لشركة Yota IT. بياناتك تبقى ملكاً لك بالكامل.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading font-semibold text-2xl text-foreground">٦. حدود المسؤولية</h2>
              <p>نبذل قصارى جهدنا لضمان استمرارية الخدمة بنسبة 99.9%، لكننا لا نتحمل المسؤولية عن الأضرار الناتجة عن انقطاعات خارجة عن إرادتنا.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading font-semibold text-2xl text-foreground">٧. التواصل</h2>
              <p>لأي استفسارات حول الشروط والأحكام: info@yotait.com | هاتف: 01010891984</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;

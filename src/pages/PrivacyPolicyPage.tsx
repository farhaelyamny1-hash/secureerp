import { motion } from "framer-motion";

const PrivacyPolicyPage = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading font-bold text-4xl text-foreground mb-8">سياسة الخصوصية</h1>
          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-foreground font-medium">آخر تحديث: أبريل 2026</p>

            <section className="space-y-3">
              <h2 className="font-heading font-semibold text-2xl text-foreground">١. المقدمة</h2>
              <p>نحن في SecureERP (المقدم من شركة Yota IT) نقدّر خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها عند استخدام منصتنا السحابية لإدارة الأعمال.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading font-semibold text-2xl text-foreground">٢. البيانات التي نجمعها</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>بيانات التسجيل: الاسم، البريد الإلكتروني، رقم الهاتف.</li>
                <li>بيانات الشركة: اسم الشركة، العنوان، الرقم الضريبي.</li>
                <li>بيانات الاستخدام: سجلات الدخول، الصفحات المزارة، الإجراءات المتخذة.</li>
                <li>بيانات مالية: الفواتير، المدفوعات، المصروفات (مشفرة بالكامل).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading font-semibold text-2xl text-foreground">٣. كيف نستخدم بياناتك</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>توفير خدمات إدارة الأعمال وتحسينها.</li>
                <li>إرسال إشعارات مهمة متعلقة بحسابك.</li>
                <li>تحليل الأداء لتحسين تجربة المستخدم.</li>
                <li>الامتثال للمتطلبات القانونية والتنظيمية.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading font-semibold text-2xl text-foreground">٤. حماية البيانات</h2>
              <p>نستخدم تشفير 256-bit SSL لجميع البيانات المنقولة والمخزنة. خوادمنا محمية بأحدث تقنيات الأمان وتتوافق مع معايير الأمان الدولية.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading font-semibold text-2xl text-foreground">٥. حقوقك</h2>
              <p>يحق لك طلب الوصول إلى بياناتك أو تعديلها أو حذفها في أي وقت عن طريق التواصل معنا عبر البريد الإلكتروني: info@yotait.com</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading font-semibold text-2xl text-foreground">٦. التواصل</h2>
              <p>لأي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا:</p>
              <p>البريد الإلكتروني: info@yotait.com | الهاتف: 01010891984</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

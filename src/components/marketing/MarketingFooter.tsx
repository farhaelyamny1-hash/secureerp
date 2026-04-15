import { Link } from "react-router-dom";
import { Code2 } from "lucide-react";
import logo from "@/assets/securetech-logo.png";

const footerSections = [
  {
    title: "المنتج",
    links: [
      { label: "المميزات", to: "/features" },
      { label: "الأسعار", to: "/pricing" },
      { label: "الوثائق", to: "/docs" },
    ],
  },
  {
    title: "الشركة",
    links: [
      { label: "عن النظام", to: "/about" },
      { label: "المدونة", to: "/blog" },
      { label: "تواصل معنا", to: "/contact" },
    ],
  },
  {
    title: "الدعم",
    links: [
      { label: "مركز المساعدة", to: "/help" },
      { label: "الشروط والأحكام", to: "/terms" },
      { label: "سياسة الخصوصية", to: "/privacy" },
    ],
  },
];

const MarketingFooter = () => {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="SecureERP — نظام حسابات سحابي" className="w-9 h-9 object-contain" />
              <span className="font-heading font-bold text-xl text-foreground">SecureERP</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              منصة سحابية متكاملة لإدارة الأعمال. نساعدك على تنظيم عملك وزيادة إنتاجيتك.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-heading font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Sitemap for SEO */}
        <nav aria-label="خريطة الموقع" className="mt-10 pt-6 border-t border-border">
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">الرئيسية</Link>
            <Link to="/features" className="hover:text-foreground transition-colors">المميزات</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">الأسعار</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">عن النظام</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">تواصل معنا</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">المدونة</Link>
            <Link to="/docs" className="hover:text-foreground transition-colors">الوثائق</Link>
            <Link to="/help" className="hover:text-foreground transition-colors">مركز المساعدة</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">الشروط والأحكام</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">سياسة الخصوصية</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">تسجيل الدخول</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">إنشاء حساب</Link>
          </div>
        </nav>

        <div className="mt-6 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2026 SecureERP from Yota IT. جميع الحقوق محفوظة.</p>
          <a
            href="https://yotaiweb.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <Code2 className="w-3 h-3" />
            <span>Yotaiweb.lovable.app</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default MarketingFooter;

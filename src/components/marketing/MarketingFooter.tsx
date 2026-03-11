import { Link } from "react-router-dom";
import { Code2 } from "lucide-react";
import logo from "@/assets/securetech-logo.png";

const MarketingFooter = () => {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="SecureERP" className="w-9 h-9 object-contain" />
              <span className="font-heading font-bold text-xl text-foreground">SecureERP</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              منصة سحابية متكاملة لإدارة الأعمال. نساعدك على تنظيم عملك وزيادة إنتاجيتك.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">المنتج</h4>
            <ul className="space-y-2">
              {["المميزات", "الأسعار", "التكاملات", "التحديثات"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">الشركة</h4>
            <ul className="space-y-2">
              {["عن النظام", "المدونة", "الوظائف", "تواصل معنا"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">الدعم</h4>
            <ul className="space-y-2">
              {["مركز المساعدة", "الوثائق", "الشروط والأحكام", "سياسة الخصوصية"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
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

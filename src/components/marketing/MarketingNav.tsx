import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const MarketingNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "الرئيسية" },
    { href: "/features", label: "المميزات" },
    { href: "/pricing", label: "الأسعار" },
    { href: "/about", label: "عن النظام" },
    { href: "/contact", label: "تواصل معنا" },
  ];

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-xl text-foreground">SecureERP</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">تسجيل الدخول</Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="gradient-primary text-primary-foreground">ابدأ مجاناً</Button>
          </Link>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-card border-b border-border p-4 space-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-3">
            <Link to="/login" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">تسجيل الدخول</Button>
            </Link>
            <Link to="/register" className="flex-1">
              <Button size="sm" className="w-full gradient-primary text-primary-foreground">ابدأ مجاناً</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MarketingNav;

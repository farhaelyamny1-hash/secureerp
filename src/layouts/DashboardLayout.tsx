import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, Warehouse, FileText, Receipt,
  CreditCard, ShoppingCart, BarChart3, UserCog, Bell, Search,
  Shield, ChevronLeft, Menu, LogOut, Settings, X, HardDrive
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/securetech-logo.png";
import NotificationsPopover from "@/components/NotificationsPopover";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", href: "/dashboard" },
  { icon: ShoppingCart, label: "نقطة البيع", href: "/dashboard/pos" },
  { icon: Users, label: "العملاء", href: "/dashboard/customers" },
  { icon: Package, label: "المنتجات", href: "/dashboard/products" },
  { icon: Warehouse, label: "المخزون", href: "/dashboard/inventory" },
  { icon: FileText, label: "عروض الأسعار", href: "/dashboard/quotations" },
  { icon: Receipt, label: "الفواتير", href: "/dashboard/invoices" },
  { icon: CreditCard, label: "المدفوعات", href: "/dashboard/payments" },
  { icon: ShoppingCart, label: "المصروفات", href: "/dashboard/expenses" },
  { icon: BarChart3, label: "التقارير", href: "/dashboard/reports" },
  { icon: UserCog, label: "الموظفين", href: "/dashboard/employees" },
  { icon: HardDrive, label: "النسخ الاحتياطي", href: "/dashboard/backups" },
  { icon: Settings, label: "الإعدادات", href: "/dashboard/settings" },
  { icon: Shield, label: "إدارة الأعضاء", href: "/dashboard/admin/users" },
  { icon: Shield, label: "لوحة المسؤول", href: "/dashboard/admin/dashboard" },
];

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "super_admin",
      });
      setIsSuperAdmin(!!data);
    };
    checkAdmin();
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen bg-sidebar z-40 flex flex-col transition-all duration-300 ${
          collapsed ? "w-[70px]" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src={logo} alt="SecureERP" className="w-8 h-8 object-contain" />
              <span className="font-heading font-bold text-sidebar-foreground">SecureERP</span>
            </div>
          )}
          {collapsed && <img src={logo} alt="SecureERP" className="w-8 h-8 object-contain mx-auto" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-md bg-sidebar-accent items-center justify-center text-sidebar-foreground"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {menuItems
            .filter((item) => !item.href.startsWith("/dashboard/admin/") || isSuperAdmin)
            .map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-foreground" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث..." className="pr-10 w-64 font-body bg-muted border-0" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationsPopover />
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-sm">
              أ
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, Receipt, CreditCard, ArrowUpLeft, ArrowDownLeft
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getUserCompanyId } from "@/lib/company";
import { formatCurrencyAmount, getCurrencyOption } from "@/lib/currency";

interface DashboardStats {
  totalSales: number;
  totalCustomers: number;
  totalInvoices: number;
  pendingPayments: number;
  currency: string;
}

interface MonthlyData {
  month: string;
  sales: number;
  expenses: number;
}

const MONTH_NAMES = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalSales: 0, totalCustomers: 0, totalInvoices: 0, pendingPayments: 0, currency: "EGP" });
  const [chartData, setChartData] = useState<MonthlyData[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const companyId = await getUserCompanyId(user.id);
        if (!companyId) { setLoading(false); return; }

        // Get company currency
        const { data: company } = await supabase.from("companies").select("currency").eq("id", companyId).single();
        const currency = company?.currency || "EGP";

        // Parallel queries
        const [invoicesRes, customersRes, expensesRes, paymentsRes, recentRes] = await Promise.all([
          supabase.from("invoices").select("id, total, status, issue_date").eq("company_id", companyId),
          supabase.from("customers").select("id", { count: "exact", head: true }).eq("company_id", companyId),
          supabase.from("expenses").select("id, amount, expense_date").eq("company_id", companyId),
          supabase.from("payments").select("id, amount").eq("company_id", companyId),
          supabase.from("invoices").select("id, invoice_number, total, status, customer_id, customers(name)").eq("company_id", companyId).order("created_at", { ascending: false }).limit(5),
        ]);

        const invoices = invoicesRes.data || [];
        const expenses = expensesRes.data || [];

        const totalSales = invoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.total || 0), 0);
        const pendingPayments = invoices.filter(i => i.status !== "paid" && i.status !== "cancelled").reduce((s, i) => s + Number(i.total || 0), 0);

        setStats({
          totalSales,
          totalCustomers: customersRes.count || 0,
          totalInvoices: invoices.length,
          pendingPayments,
          currency,
        });

        // Build monthly chart data for current year
        const year = new Date().getFullYear();
        const monthly: MonthlyData[] = MONTH_NAMES.map((month, i) => {
          const monthInvoices = invoices.filter(inv => {
            const d = new Date(inv.issue_date);
            return d.getFullYear() === year && d.getMonth() === i && inv.status === "paid";
          });
          const monthExpenses = expenses.filter(exp => {
            const d = new Date(exp.expense_date);
            return d.getFullYear() === year && d.getMonth() === i;
          });
          return {
            month,
            sales: monthInvoices.reduce((s, inv) => s + Number(inv.total || 0), 0),
            expenses: monthExpenses.reduce((s, exp) => s + Number(exp.amount || 0), 0),
          };
        });
        setChartData(monthly);

        setRecentInvoices(recentRes.data || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user?.id]);

  const statusLabels: Record<string, string> = { draft: "مسودة", sent: "مُرسلة", paid: "مدفوعة", overdue: "متأخرة", cancelled: "ملغاة" };
  const statusColors: Record<string, string> = { paid: "bg-success/10 text-success", overdue: "bg-destructive/10 text-destructive", draft: "bg-muted text-muted-foreground", sent: "bg-primary/10 text-primary", cancelled: "bg-muted text-muted-foreground" };

  const statCards = [
    { icon: TrendingUp, label: "إجمالي المبيعات", value: formatCurrencyAmount(stats.totalSales, stats.currency), up: true },
    { icon: Users, label: "العملاء", value: String(stats.totalCustomers), up: true },
    { icon: Receipt, label: "الفواتير", value: String(stats.totalInvoices), up: true },
    { icon: CreditCard, label: "المدفوعات المعلقة", value: formatCurrencyAmount(stats.pendingPayments, stats.currency), up: false },
  ];

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">جاري تحميل لوحة التحكم...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground">مرحباً بك في SecureERP from Yota IT</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">المبيعات والمصروفات</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="sales" stackId="1" stroke="hsl(217, 91%, 45%)" fill="hsl(217, 91%, 45%, 0.2)" name="المبيعات" />
              <Area type="monotone" dataKey="expenses" stackId="2" stroke="hsl(172, 66%, 50%)" fill="hsl(172, 66%, 50%, 0.2)" name="المصروفات" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">الإيرادات الشهرية</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="sales" fill="hsl(217, 91%, 45%)" radius={[4, 4, 0, 0]} name="المبيعات" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4">أحدث الفواتير</h3>
        <div className="overflow-x-auto">
          {recentInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">لا توجد فواتير بعد</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-semibold text-muted-foreground pb-3">رقم الفاتورة</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground pb-3">العميل</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground pb-3">المبلغ</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground pb-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv: any, i: number) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 text-sm font-medium text-foreground">{inv.invoice_number}</td>
                    <td className="py-3 text-sm text-muted-foreground">{inv.customers?.name || "—"}</td>
                    <td className="py-3 text-sm font-semibold text-foreground">{formatCurrencyAmount(inv.total, stats.currency)}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[inv.status] || "bg-muted text-muted-foreground"}`}>
                        {statusLabels[inv.status] || inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

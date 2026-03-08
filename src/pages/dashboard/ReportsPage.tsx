import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, Users, Receipt, CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = ["hsl(217, 91%, 45%)", "hsl(172, 66%, 50%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

const ReportsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalSales: 0, totalExpenses: 0, customersCount: 0, invoicesCount: 0, paidCount: 0, overdueCount: 0 });
  const [invoicesByStatus, setInvoicesByStatus] = useState<{ name: string; value: number }[]>([]);
  const [monthlySales, setMonthlySales] = useState<{ month: string; sales: number; expenses: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const [invRes, custRes, expRes, paidRes] = await Promise.all([
        supabase.from("invoices").select("total, status, issue_date"),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("expenses").select("amount, expense_date"),
        supabase.from("payments").select("amount"),
      ]);

      const invoices = invRes.data || [];
      const expenses = expRes.data || [];
      const payments = paidRes.data || [];

      const totalSales = invoices.reduce((s, i) => s + (Number(i.total) || 0), 0);
      const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const paidCount = invoices.filter(i => i.status === "paid").length;
      const overdueCount = invoices.filter(i => i.status === "overdue").length;

      setStats({
        totalSales,
        totalExpenses,
        customersCount: custRes.count || 0,
        invoicesCount: invoices.length,
        paidCount,
        overdueCount,
      });

      // Invoice status distribution
      const statusMap: Record<string, number> = {};
      const statusLabels: Record<string, string> = { draft: "مسودة", sent: "مُرسلة", paid: "مدفوعة", overdue: "متأخرة", cancelled: "ملغاة" };
      invoices.forEach(i => { statusMap[i.status] = (statusMap[i.status] || 0) + 1; });
      setInvoicesByStatus(Object.entries(statusMap).map(([k, v]) => ({ name: statusLabels[k] || k, value: v })));

      // Monthly aggregation
      const monthMap: Record<string, { sales: number; expenses: number }> = {};
      const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
      invoices.forEach(i => {
        const m = new Date(i.issue_date).getMonth();
        if (!monthMap[m]) monthMap[m] = { sales: 0, expenses: 0 };
        monthMap[m].sales += Number(i.total) || 0;
      });
      expenses.forEach(e => {
        const m = new Date(e.expense_date).getMonth();
        if (!monthMap[m]) monthMap[m] = { sales: 0, expenses: 0 };
        monthMap[m].expenses += Number(e.amount) || 0;
      });
      setMonthlySales(
        Object.entries(monthMap)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([m, v]) => ({ month: monthNames[Number(m)], ...v }))
      );

      setLoading(false);
    };
    fetchReports();
  }, []);

  const summaryCards = [
    { icon: TrendingUp, label: "إجمالي المبيعات", value: `${stats.totalSales.toLocaleString()} ج.م`, color: "text-primary" },
    { icon: CreditCard, label: "إجمالي المصروفات", value: `${stats.totalExpenses.toLocaleString()} ج.م`, color: "text-destructive" },
    { icon: Users, label: "عدد العملاء", value: String(stats.customersCount), color: "text-primary" },
    { icon: Receipt, label: "عدد الفواتير", value: String(stats.invoicesCount), color: "text-primary" },
  ];

  if (loading) return <div className="p-8 text-center text-muted-foreground">جاري تحميل التقارير...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">التقارير</h1>
          <p className="text-sm text-muted-foreground">نظرة شاملة على أداء الشركة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">المبيعات vs المصروفات (شهري)</h3>
          {monthlySales.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">لا توجد بيانات بعد</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="sales" fill="hsl(217, 91%, 45%)" radius={[4, 4, 0, 0]} name="المبيعات" />
                <Bar dataKey="expenses" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="المصروفات" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">توزيع حالات الفواتير</h3>
          {invoicesByStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">لا توجد فواتير بعد</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={invoicesByStatus} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {invoicesByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4">ملخص</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-muted-foreground">صافي الربح</p>
            <p className="font-bold text-foreground text-lg">{(stats.totalSales - stats.totalExpenses).toLocaleString()} ج.م</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-muted-foreground">فواتير مدفوعة</p>
            <p className="font-bold text-foreground text-lg">{stats.paidCount}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-muted-foreground">فواتير متأخرة</p>
            <p className="font-bold text-destructive text-lg">{stats.overdueCount}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-muted-foreground">هامش الربح</p>
            <p className="font-bold text-foreground text-lg">
              {stats.totalSales > 0 ? ((stats.totalSales - stats.totalExpenses) / stats.totalSales * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Users, Receipt, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrencyAmount } from "@/lib/currency";
import { getCompanyProfile } from "@/lib/company";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
];

const ReportsPage = () => {
  const { user } = useAuth();
  const [currencyCode, setCurrencyCode] = useState("EGP");
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    customersCount: 0,
    invoicesCount: 0,
    paidCount: 0,
    overdueCount: 0,
  });
  const [invoicesByStatus, setInvoicesByStatus] = useState<{ name: string; value: number }[]>([]);
  const [monthlySales, setMonthlySales] = useState<{ month: string; sales: number; expenses: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const company = await getCompanyProfile(user.id);

        if (!company) {
          setStats({
            totalSales: 0,
            totalExpenses: 0,
            customersCount: 0,
            invoicesCount: 0,
            paidCount: 0,
            overdueCount: 0,
          });
          setInvoicesByStatus([]);
          setMonthlySales([]);
          setLoading(false);
          return;
        }

        setCurrencyCode(company.currency || "EGP");

        const [invoiceRes, customerRes, expenseRes] = await Promise.all([
          supabase.from("invoices").select("total, status, issue_date").eq("company_id", company.id),
          supabase.from("customers").select("id", { count: "exact", head: true }).eq("company_id", company.id),
          supabase.from("expenses").select("amount, expense_date").eq("company_id", company.id),
        ]);

        const invoices = invoiceRes.data || [];
        const expenses = expenseRes.data || [];

        const totalSales = invoices.reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
        const paidCount = invoices.filter((invoice) => invoice.status === "paid").length;
        const overdueCount = invoices.filter((invoice) => invoice.status === "overdue").length;

        setStats({
          totalSales,
          totalExpenses,
          customersCount: customerRes.count || 0,
          invoicesCount: invoices.length,
          paidCount,
          overdueCount,
        });

        const statusMap: Record<string, number> = {};
        const statusLabels: Record<string, string> = {
          draft: "مسودة",
          sent: "مُرسلة",
          paid: "مدفوعة",
          overdue: "متأخرة",
          cancelled: "ملغاة",
        };

        invoices.forEach((invoice) => {
          statusMap[invoice.status] = (statusMap[invoice.status] || 0) + 1;
        });

        setInvoicesByStatus(
          Object.entries(statusMap).map(([statusKey, value]) => ({
            name: statusLabels[statusKey] || statusKey,
            value,
          })),
        );

        const monthMap: Record<string, { sales: number; expenses: number }> = {};
        const monthNames = [
          "يناير",
          "فبراير",
          "مارس",
          "أبريل",
          "مايو",
          "يونيو",
          "يوليو",
          "أغسطس",
          "سبتمبر",
          "أكتوبر",
          "نوفمبر",
          "ديسمبر",
        ];

        invoices.forEach((invoice) => {
          const month = new Date(invoice.issue_date).getMonth().toString();
          if (!monthMap[month]) monthMap[month] = { sales: 0, expenses: 0 };
          monthMap[month].sales += Number(invoice.total) || 0;
        });

        expenses.forEach((expense) => {
          const month = new Date(expense.expense_date).getMonth().toString();
          if (!monthMap[month]) monthMap[month] = { sales: 0, expenses: 0 };
          monthMap[month].expenses += Number(expense.amount) || 0;
        });

        setMonthlySales(
          Object.entries(monthMap)
            .sort(([monthA], [monthB]) => Number(monthA) - Number(monthB))
            .map(([month, values]) => ({
              month: monthNames[Number(month)],
              ...values,
            })),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user?.id]);

  const summaryCards = useMemo(
    () => [
      {
        icon: TrendingUp,
        label: "إجمالي المبيعات",
        value: formatCurrencyAmount(stats.totalSales, currencyCode),
        color: "text-primary",
      },
      {
        icon: CreditCard,
        label: "إجمالي المصروفات",
        value: formatCurrencyAmount(stats.totalExpenses, currencyCode),
        color: "text-destructive",
      },
      {
        icon: Users,
        label: "عدد العملاء",
        value: String(stats.customersCount),
        color: "text-primary",
      },
      {
        icon: Receipt,
        label: "عدد الفواتير",
        value: String(stats.invoicesCount),
        color: "text-primary",
      },
    ],
    [currencyCode, stats],
  );

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
        {summaryCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-5"
          >
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
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="المبيعات" />
                <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="المصروفات" />
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
                <Pie
                  data={invoicesByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {invoicesByStatus.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
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
            <p className="font-bold text-foreground text-lg">
              {formatCurrencyAmount(stats.totalSales - stats.totalExpenses, currencyCode)}
            </p>
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
              {stats.totalSales > 0 ? (((stats.totalSales - stats.totalExpenses) / stats.totalSales) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

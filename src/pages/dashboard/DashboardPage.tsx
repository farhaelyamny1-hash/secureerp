import { motion } from "framer-motion";
import {
  TrendingUp, Users, Receipt, CreditCard, ArrowUpLeft, ArrowDownLeft
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

const stats = [
  { icon: TrendingUp, label: "إجمالي المبيعات", value: "٢٤,٥٠٠ ج.م", change: "+12%", up: true },
  { icon: Users, label: "العملاء", value: "١,٢٣٤", change: "+8%", up: true },
  { icon: Receipt, label: "الفواتير", value: "٨٥٦", change: "+15%", up: true },
  { icon: CreditCard, label: "المدفوعات المعلقة", value: "١٢,٣٠٠ ج.م", change: "-3%", up: false },
];

const chartData = [
  { month: "يناير", sales: 4000, expenses: 2400 },
  { month: "فبراير", sales: 3000, expenses: 1398 },
  { month: "مارس", sales: 2000, expenses: 3800 },
  { month: "أبريل", sales: 2780, expenses: 3908 },
  { month: "مايو", sales: 1890, expenses: 4800 },
  { month: "يونيو", sales: 2390, expenses: 3800 },
  { month: "يوليو", sales: 3490, expenses: 4300 },
];

const recentInvoices = [
  { id: "INV-001", client: "شركة النور", amount: "٣,٥٠٠ ج.م", status: "مدفوعة" },
  { id: "INV-002", client: "مؤسسة الوفاء", amount: "٧,٢٠٠ ج.م", status: "معلقة" },
  { id: "INV-003", client: "متجر السلام", amount: "١,٨٠٠ ج.م", status: "مدفوعة" },
  { id: "INV-004", client: "شركة البناء", amount: "١٢,٠٠٠ ج.م", status: "متأخرة" },
  { id: "INV-005", client: "مجموعة التقنية", amount: "٥,٤٠٠ ج.م", status: "مدفوعة" },
];

const statusColors: Record<string, string> = {
  "مدفوعة": "bg-success/10 text-success",
  "معلقة": "bg-warning/10 text-warning",
  "متأخرة": "bg-destructive/10 text-destructive",
};

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground">مرحباً بك في SecureERP</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold ${stat.up ? "text-success" : "text-destructive"}`}>
                {stat.up ? <ArrowUpLeft className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">المبيعات والمصروفات</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
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
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="sales" fill="hsl(217, 91%, 45%)" radius={[4, 4, 0, 0]} name="المبيعات" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4">أحدث الفواتير</h3>
        <div className="overflow-x-auto">
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
              {recentInvoices.map((inv, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-3 text-sm font-medium text-foreground">{inv.id}</td>
                  <td className="py-3 text-sm text-muted-foreground">{inv.client}</td>
                  <td className="py-3 text-sm font-semibold text-foreground">{inv.amount}</td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

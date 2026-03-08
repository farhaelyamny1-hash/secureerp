import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal, Download, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";

const invoices = [
  { id: "INV-001", date: "2026-03-01", client: "شركة النور", amount: "٣,٥٠٠ ج.م", tax: "٥٢٥ ج.م", total: "٤,٠٢٥ ج.م", status: "مدفوعة" },
  { id: "INV-002", date: "2026-03-02", client: "مؤسسة الوفاء", amount: "٧,٢٠٠ ج.م", tax: "١,٠٨٠ ج.م", total: "٨,٢٨٠ ج.م", status: "معلقة" },
  { id: "INV-003", date: "2026-03-03", client: "متجر السلام", amount: "١,٨٠٠ ج.م", tax: "٢٧٠ ج.م", total: "٢,٠٧٠ ج.م", status: "مدفوعة" },
  { id: "INV-004", date: "2026-03-04", client: "شركة البناء", amount: "١٢,٠٠٠ ج.م", tax: "١,٨٠٠ ج.م", total: "١٣,٨٠٠ ج.م", status: "متأخرة" },
];

const statusColors: Record<string, string> = {
  "مدفوعة": "bg-success/10 text-success",
  "معلقة": "bg-warning/10 text-warning",
  "متأخرة": "bg-destructive/10 text-destructive",
};

const InvoicesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">الفواتير</h1>
          <p className="text-sm text-muted-foreground">إنشاء وإدارة الفواتير</p>
        </div>
        <Button className="gradient-primary text-primary-foreground font-heading">
          <Plus className="w-4 h-4 ml-2" />
          فاتورة جديدة
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث عن فاتورة..." className="pr-10 font-body bg-muted border-0" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">رقم الفاتورة</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">التاريخ</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">العميل</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">المبلغ</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">الضريبة</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">الإجمالي</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">الحالة</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4 font-medium text-sm text-primary">{inv.id}</td>
                  <td className="p-4 text-sm text-muted-foreground">{inv.date}</td>
                  <td className="p-4 text-sm text-foreground">{inv.client}</td>
                  <td className="p-4 text-sm text-foreground">{inv.amount}</td>
                  <td className="p-4 text-sm text-muted-foreground">{inv.tax}</td>
                  <td className="p-4 text-sm font-semibold text-foreground">{inv.total}</td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center" title="تحميل PDF">
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center" title="طباعة">
                        <Printer className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;

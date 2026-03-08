import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal, Mail, Phone } from "lucide-react";

const customers = [
  { id: 1, name: "شركة النور للتجارة", email: "info@alnoor.com", phone: "0501234567", invoices: 12, total: "٤٥,٠٠٠ ر.س" },
  { id: 2, name: "مؤسسة الوفاء", email: "contact@alwafa.com", phone: "0559876543", invoices: 8, total: "٢٨,٥٠٠ ر.س" },
  { id: 3, name: "متجر السلام", email: "sales@alsalam.com", phone: "0541112233", invoices: 15, total: "٦٧,٢٠٠ ر.س" },
  { id: 4, name: "شركة البناء الحديث", email: "info@albina.com", phone: "0567778899", invoices: 5, total: "١٢٠,٠٠٠ ر.س" },
  { id: 5, name: "مجموعة التقنية", email: "tech@group.com", phone: "0533334444", invoices: 20, total: "٨٩,٣٠٠ ر.س" },
];

const CustomersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">العملاء</h1>
          <p className="text-sm text-muted-foreground">إدارة قاعدة بيانات العملاء</p>
        </div>
        <Button className="gradient-primary text-primary-foreground font-heading">
          <Plus className="w-4 h-4 ml-2" />
          إضافة عميل
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث عن عميل..." className="pr-10 font-body bg-muted border-0" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">العميل</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">البريد</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">الهاتف</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">الفواتير</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">الإجمالي</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-sm">
                        {c.name[0]}
                      </div>
                      <span className="font-medium text-sm text-foreground">{c.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{c.email}</td>
                  <td className="p-4 text-sm text-muted-foreground">{c.phone}</td>
                  <td className="p-4 text-sm text-foreground font-medium">{c.invoices}</td>
                  <td className="p-4 text-sm text-foreground font-semibold">{c.total}</td>
                  <td className="p-4">
                    <button className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
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

export default CustomersPage;

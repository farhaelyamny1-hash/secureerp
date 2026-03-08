import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal, AlertTriangle } from "lucide-react";

const products = [
  { id: 1, name: "لابتوب Dell XPS 15", category: "إلكترونيات", price: "٤,٥٠٠ ج.م", stock: 25, status: "متوفر" },
  { id: 2, name: "طابعة HP LaserJet", category: "أجهزة مكتبية", price: "١,٢٠٠ ج.م", stock: 3, status: "منخفض" },
  { id: 3, name: "شاشة Samsung 27\"", category: "إلكترونيات", price: "١,٨٠٠ ج.م", stock: 15, status: "متوفر" },
  { id: 4, name: "كرسي مكتبي", category: "أثاث", price: "٨٥٠ ج.م", stock: 0, status: "نفذ" },
  { id: 5, name: "لوحة مفاتيح Logitech", category: "ملحقات", price: "٣٥٠ ج.م", stock: 50, status: "متوفر" },
];

const stockColors: Record<string, string> = {
  "متوفر": "bg-success/10 text-success",
  "منخفض": "bg-warning/10 text-warning",
  "نفذ": "bg-destructive/10 text-destructive",
};

const ProductsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">المنتجات</h1>
          <p className="text-sm text-muted-foreground">إدارة كتالوج المنتجات</p>
        </div>
        <Button className="gradient-primary text-primary-foreground font-heading">
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث عن منتج..." className="pr-10 font-body bg-muted border-0" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">المنتج</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">التصنيف</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">السعر</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">المخزون</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">الحالة</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4 font-medium text-sm text-foreground">{p.name}</td>
                  <td className="p-4 text-sm text-muted-foreground">{p.category}</td>
                  <td className="p-4 text-sm font-semibold text-foreground">{p.price}</td>
                  <td className="p-4 text-sm text-foreground flex items-center gap-1">
                    {p.stock}
                    {p.stock <= 3 && p.stock > 0 && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stockColors[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
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

export default ProductsPage;

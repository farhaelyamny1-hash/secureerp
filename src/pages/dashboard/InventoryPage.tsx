import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCurrencyAmount } from "@/lib/currency";
import { getCompanyProfile } from "@/lib/company";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  cost: number | null;
  stock_quantity: number;
  low_stock_threshold: number | null;
  unit: string | null;
  is_active: boolean | null;
  categories?: { name: string } | null;
}

const InventoryPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currencyCode, setCurrencyCode] = useState("EGP");
  const [products, setProducts] = useState<Product[]>([]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const company = await getCompanyProfile(user.id);
      if (!company) { toast.error("لا توجد شركة مرتبطة بحسابك"); return; }
      setCurrencyCode(company.currency || "EGP");

      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, price, cost, stock_quantity, low_stock_threshold, unit, is_active, categories(name)")
        .eq("company_id", company.id)
        .order("name");

      if (error) throw error;
      setProducts((data as Product[]) || []);
    } catch { toast.error("تعذر تحميل المخزون"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
  }, [products, search]);

  const lowStockCount = products.filter(p => p.low_stock_threshold && p.stock_quantity <= p.low_stock_threshold).length;
  const totalValue = products.reduce((sum, p) => sum + p.stock_quantity * (p.cost || p.price), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground">المخزون</h1>
        <p className="text-sm text-muted-foreground">إدارة المخزون والتتبع</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
              <p className="font-heading font-bold text-xl text-foreground">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
            <div>
              <p className="text-sm text-muted-foreground">مخزون منخفض</p>
              <p className="font-heading font-bold text-xl text-foreground">{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><Package className="w-5 h-5 text-success" /></div>
            <div>
              <p className="text-sm text-muted-foreground">قيمة المخزون</p>
              <p className="font-heading font-bold text-lg text-foreground">{formatCurrencyAmount(totalValue, currencyCode)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث بالاسم أو SKU..." className="pr-10 font-body bg-muted border-0" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا توجد منتجات في المخزون</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المنتج</TableHead>
                  <TableHead className="text-right">SKU</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-right">الكمية</TableHead>
                  <TableHead className="text-right">التكلفة</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, i) => {
                  const isLow = p.low_stock_threshold && p.stock_quantity <= p.low_stock_threshold;
                  return (
                    <motion.tr key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="border-b transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.sku || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{p.categories?.name || "—"}</TableCell>
                      <TableCell>
                        <span className={isLow ? "text-destructive font-bold" : "text-foreground"}>
                          {p.stock_quantity} {p.unit || ""}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.cost != null ? formatCurrencyAmount(p.cost, currencyCode) : "—"}</TableCell>
                      <TableCell className="text-foreground">{formatCurrencyAmount(p.price, currencyCode)}</TableCell>
                      <TableCell>
                        {isLow ? (
                          <Badge variant="destructive" className="text-xs">مخزون منخفض</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">متوفر</Badge>
                        )}
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;

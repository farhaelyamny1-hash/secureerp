import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal, AlertTriangle, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  stock_quantity: number;
  sku: string | null;
  unit: string | null;
  is_active: boolean | null;
  low_stock_threshold: number | null;
}

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", cost: "", stock_quantity: "", sku: "", unit: "قطعة" });

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
    if (error) toast.error("خطأ في تحميل المنتجات");
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const getCompanyId = async () => {
    const { data } = await supabase.rpc("get_user_company_id", { _user_id: user!.id });
    return data;
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("اسم المنتج مطلوب"); return; }
    const companyId = await getCompanyId();
    if (!companyId) { toast.error("لا توجد شركة مرتبطة بحسابك"); return; }

    const payload = {
      name: form.name, description: form.description || null,
      price: parseFloat(form.price) || 0, cost: parseFloat(form.cost) || 0,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      sku: form.sku || null, unit: form.unit || "piece",
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) { toast.error("خطأ في التعديل"); return; }
      toast.success("تم تعديل المنتج");
    } else {
      const { error } = await supabase.from("products").insert({ ...payload, company_id: companyId });
      if (error) { toast.error("خطأ في الإضافة"); return; }
      toast.success("تم إضافة المنتج");
    }
    setDialogOpen(false);
    resetForm();
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("خطأ في الحذف"); return; }
    toast.success("تم حذف المنتج");
    fetchProducts();
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ name: p.name, description: p.description || "", price: String(p.price), cost: String(p.cost || ""), stock_quantity: String(p.stock_quantity), sku: p.sku || "", unit: p.unit || "قطعة" });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm({ name: "", description: "", price: "", cost: "", stock_quantity: "", sku: "", unit: "قطعة" });
  };

  const getStatus = (p: Product) => {
    if (p.stock_quantity === 0) return { label: "نفذ", color: "bg-destructive/10 text-destructive" };
    if (p.stock_quantity <= (p.low_stock_threshold || 5)) return { label: "منخفض", color: "bg-warning/10 text-warning" };
    return { label: "متوفر", color: "bg-success/10 text-success" };
  };

  const filtered = products.filter(p => p.name.includes(search) || p.sku?.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">المنتجات</h1>
          <p className="text-sm text-muted-foreground">إدارة كتالوج المنتجات</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground font-heading">
              <Plus className="w-4 h-4 ml-2" />
              إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Input placeholder="اسم المنتج *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="font-body" />
              <Input placeholder="الوصف" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="font-body" />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="سعر البيع (ج.م)" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="font-body" />
                <Input placeholder="سعر التكلفة (ج.م)" type="number" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} className="font-body" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="الكمية" type="number" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} className="font-body" />
                <Input placeholder="كود المنتج (SKU)" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="font-body" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground">{editingProduct ? "حفظ التعديل" : "إضافة"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث عن منتج..." className="pr-10 font-body bg-muted border-0" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا يوجد منتجات بعد. أضف أول منتج!</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">المنتج</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">السعر</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">المخزون</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">الحالة</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const status = getStatus(p);
                  return (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-medium text-sm text-foreground">{p.name}</td>
                      <td className="p-4 text-sm font-semibold text-foreground">{p.price} ج.م</td>
                      <td className="p-4 text-sm text-foreground flex items-center gap-1">
                        {p.stock_quantity}
                        {p.stock_quantity <= (p.low_stock_threshold || 5) && p.stock_quantity > 0 && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center">
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(p)}><Edit className="w-4 h-4 ml-2" /> تعديل</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 ml-2" /> حذف</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;

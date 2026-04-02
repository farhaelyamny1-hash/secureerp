import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal, AlertTriangle, Trash2, Edit } from "lucide-react";
import ExportMenu from "@/components/ExportMenu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrencyAmount, getCurrencyOption } from "@/lib/currency";
import { getCompanyProfile, getUserCompanyId } from "@/lib/company";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  stock_quantity: number;
  sku: string | null;
  barcode: string | null;
  unit: string | null;
  is_active: boolean | null;
  low_stock_threshold: number | null;
  category_id: string | null;
  categories?: { name: string } | null;
}

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currencyCode, setCurrencyCode] = useState("EGP");
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    stock_quantity: "",
    sku: "",
    barcode: "",
    unit: "قطعة",
    low_stock_threshold: "5",
    category_id: "",
  });

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const company = await getCompanyProfile(user.id);
      if (!company) {
        setProducts([]);
        toast.error("لا توجد شركة مرتبطة بحسابك");
        return;
      }

      setCurrencyCode(company.currency || "EGP");

      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("خطأ في تحميل المنتجات");
        return;
      }

      setProducts((data as Product[]) || []);

      // Fetch categories
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name")
        .eq("company_id", company.id)
        .eq("type", "product")
        .order("name");
      setCategories(cats || []);
    } catch {
      toast.error("خطأ في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user) return;
    if (!form.name.trim()) {
      toast.error("اسم المنتج مطلوب");
      return;
    }

    const companyId = await getUserCompanyId(user.id);
    if (!companyId) {
      toast.error("لا توجد شركة مرتبطة بحسابك");
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price) || 0,
      cost: Number(form.cost) || 0,
      stock_quantity: Number(form.stock_quantity) || 0,
      sku: form.sku || null,
      barcode: form.barcode || null,
      unit: form.unit || "piece",
      low_stock_threshold: Number(form.low_stock_threshold) || 5,
      category_id: form.category_id || null,
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) {
        toast.error("خطأ في تعديل المنتج");
        return;
      }
      toast.success("تم تعديل المنتج");
    } else {
      const { error } = await supabase.from("products").insert({ ...payload, company_id: companyId });
      if (error) {
        toast.error("خطأ في إضافة المنتج");
        return;
      }
      toast.success("تم إضافة المنتج");
    }

    setDialogOpen(false);
    resetForm();
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("خطأ في حذف المنتج");
      return;
    }
    toast.success("تم حذف المنتج");
    fetchProducts();
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price ?? ""),
      cost: String(product.cost ?? ""),
      stock_quantity: String(product.stock_quantity ?? ""),
      sku: product.sku || "",
      barcode: product.barcode || "",
      unit: product.unit || "قطعة",
      low_stock_threshold: String(product.low_stock_threshold ?? 5),
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      description: "",
      price: "",
      cost: "",
      stock_quantity: "",
      sku: "",
      barcode: "",
      unit: "قطعة",
      low_stock_threshold: "5",
    });
  };

  const getStatus = (product: Product) => {
    if (product.stock_quantity === 0) return { label: "نفذ", color: "bg-destructive/10 text-destructive" };
    if (product.stock_quantity <= (product.low_stock_threshold || 5)) {
      return { label: "منخفض", color: "bg-warning/10 text-warning" };
    }
    return { label: "متوفر", color: "bg-success/10 text-success" };
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      const name = product.name.toLowerCase();
      const sku = product.sku?.toLowerCase() || "";
      return name.includes(query) || sku.includes(query);
    });
  }, [products, search]);

  const currencySymbol = getCurrencyOption(currencyCode).symbol;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">المنتجات</h1>
          <p className="text-sm text-muted-foreground">إدارة كتالوج المنتجات والأسعار بالمُعملة الحالية</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            data={filteredProducts.map(p => ({
              الاسم: p.name, الوصف: p.description || "", السعر: p.price, التكلفة: p.cost || 0,
              الكمية: p.stock_quantity, الباركود: p.barcode || "", SKU: p.sku || "",
            }))}
            fileName="المنتجات"
          />
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground font-heading">
                <Plus className="w-4 h-4 ml-2" />
                إضافة منتج
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <Input
                placeholder="اسم المنتج *"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
              <Input
                placeholder="الوصف"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder={`سعر البيع (${currencySymbol})`}
                  type="number"
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                />
                <Input
                  placeholder={`سعر التكلفة (${currencySymbol})`}
                  type="number"
                  value={form.cost}
                  onChange={(event) => setForm({ ...form, cost: event.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="الكمية"
                  type="number"
                  value={form.stock_quantity}
                  onChange={(event) => setForm({ ...form, stock_quantity: event.target.value })}
                />
                <Input
                  placeholder="حد المخزون المنخفض"
                  type="number"
                  value={form.low_stock_threshold}
                  onChange={(event) => setForm({ ...form, low_stock_threshold: event.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="كود المنتج (SKU)"
                  value={form.sku}
                  onChange={(event) => setForm({ ...form, sku: event.target.value })}
                />
                <Input
                  placeholder="الباركود"
                  value={form.barcode}
                  onChange={(event) => setForm({ ...form, barcode: event.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="الوحدة (مثل: قطعة)"
                  value={form.unit}
                  onChange={(event) => setForm({ ...form, unit: event.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
                {editingProduct ? "حفظ التعديل" : "إضافة"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن منتج..."
              className="pr-10 font-body bg-muted border-0"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">جاري تحميل المنتجات...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا توجد منتجات بعد. أضف أول منتج!</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">المنتج</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">SKU</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">السعر</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">المخزون</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">الحالة</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => {
                  const status = getStatus(product);
                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4 text-sm text-foreground">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.unit || "—"}</div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{product.sku || "—"}</td>
                      <td className="p-4 text-sm font-semibold text-foreground">
                        {formatCurrencyAmount(product.price, currencyCode)}
                      </td>
                      <td className="p-4 text-sm text-foreground flex items-center gap-1">
                        {product.stock_quantity}
                        {product.stock_quantity <= (product.low_stock_threshold || 5) && product.stock_quantity > 0 ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                        ) : null}
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
                            <DropdownMenuItem onClick={() => openEdit(product)}>
                              <Edit className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
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

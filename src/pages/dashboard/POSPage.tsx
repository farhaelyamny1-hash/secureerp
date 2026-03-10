import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, User, CreditCard,
  Barcode, Grid3X3, List, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCurrencyAmount } from "@/lib/currency";
import { getCompanyProfile } from "@/lib/company";

interface POSProduct {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  barcode: string | null;
  sku: string | null;
}

interface CartItem {
  product: POSProduct;
  quantity: number;
  discount: number;
}

interface Customer {
  id: string;
  name: string;
}

const POSPage = () => {
  const { user } = useAuth();
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState("EGP");
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<POSProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [search, setSearch] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const company = await getCompanyProfile(user.id);
        if (!company) {
          toast.error("لا توجد شركة مرتبطة بحسابك");
          return;
        }
        setCompanyId(company.id);
        setCurrencyCode(company.currency || "EGP");

        const [prodRes, custRes] = await Promise.all([
          supabase
            .from("products")
            .select("id, name, price, stock_quantity, barcode, sku")
            .eq("company_id", company.id)
            .eq("is_active", true)
            .order("name"),
          supabase
            .from("customers")
            .select("id, name")
            .eq("company_id", company.id)
            .order("name"),
        ]);

        setProducts((prodRes.data as POSProduct[]) || []);
        setCustomers(custRes.data || []);
      } catch {
        toast.error("خطأ في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const addToCart = (product: POSProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          toast.error("الكمية المطلوبة تتجاوز المخزون");
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      if (product.stock_quantity <= 0) {
        toast.error("المنتج غير متوفر في المخزون");
        return prev;
      }
      return [...prev, { product, quantity: 1, discount: 0 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty > item.product.stock_quantity) {
            toast.error("الكمية تتجاوز المخزون");
            return item;
          }
          return { ...item, quantity: newQty };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleBarcodeScan = (code: string) => {
    if (!code.trim()) return;
    const product = products.find(
      (p) => p.barcode === code.trim() || p.sku === code.trim()
    );
    if (product) {
      addToCart(product);
      toast.success(`تم إضافة: ${product.name}`);
    } else {
      toast.error("لم يتم العثور على منتج بهذا الباركود");
    }
    setBarcodeInput("");
  };

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity - item.discount,
      0
    );
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const handleCheckout = async () => {
    if (!companyId || cart.length === 0) return;
    setProcessing(true);

    try {
      const invoiceNumber = `POS-${Date.now().toString().slice(-8)}`;
      const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
      const totalDiscount = cart.reduce((s, i) => s + i.discount, 0);
      const total = subtotal - totalDiscount;

      const { data: invoice, error: invErr } = await supabase
        .from("invoices")
        .insert({
          company_id: companyId,
          invoice_number: invoiceNumber,
          customer_id: selectedCustomer || null,
          subtotal,
          tax_rate: 0,
          tax_amount: 0,
          discount: totalDiscount,
          total,
          status: "paid",
          notes: "تم البيع عبر نقطة البيع",
        })
        .select("id")
        .single();

      if (invErr || !invoice) {
        toast.error("فشل إنشاء الفاتورة");
        setProcessing(false);
        return;
      }

      const itemsPayload = cart.map((item) => ({
        invoice_id: invoice.id,
        product_id: item.product.id,
        description: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total: item.product.price * item.quantity,
      }));

      const { error: itemsErr } = await supabase
        .from("invoice_items")
        .insert(itemsPayload);

      if (itemsErr) {
        toast.error("تم إنشاء الفاتورة لكن فشل حفظ العناصر");
        setProcessing(false);
        return;
      }

      // Update stock quantities
      for (const item of cart) {
        await supabase
          .from("products")
          .update({
            stock_quantity: item.product.stock_quantity - item.quantity,
          })
          .eq("id", item.product.id);
      }

      toast.success(`تمت عملية البيع بنجاح - ${invoiceNumber}`);
      setCart([]);
      setSelectedCustomer("");

      // Refresh products
      const { data: refreshed } = await supabase
        .from("products")
        .select("id, name, price, stock_quantity, barcode, sku")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("name");
      setProducts((refreshed as POSProduct[]) || []);
    } catch {
      toast.error("حدث خطأ أثناء عملية البيع");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
        جاري تحميل نقطة البيع...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن منتج..."
                className="pr-10 bg-muted border-0 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Barcode scanner input */}
          <div className="relative">
            <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={barcodeInputRef}
              placeholder="امسح الباركود هنا أو أدخله يدوياً..."
              className="pr-10 bg-muted border-0 text-sm font-mono"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleBarcodeScan(barcodeInput);
                }
              }}
            />
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="flex-1 overflow-y-auto p-3">
          {filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              لا توجد منتجات
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredProducts.map((product) => (
                <motion.button
                  key={product.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToCart(product)}
                  className={`p-3 rounded-lg border text-right transition-colors ${
                    product.stock_quantity <= 0
                      ? "border-border bg-muted/50 opacity-50 cursor-not-allowed"
                      : "border-border bg-card hover:border-primary hover:shadow-sm cursor-pointer"
                  }`}
                  disabled={product.stock_quantity <= 0}
                >
                  <p className="font-medium text-xs text-foreground truncate">{product.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    المخزون: {product.stock_quantity}
                  </p>
                  <p className="font-bold text-xs text-primary mt-1">
                    {formatCurrencyAmount(product.price, currencyCode)}
                  </p>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredProducts.map((product) => (
                <motion.button
                  key={product.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(product)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                    product.stock_quantity <= 0
                      ? "border-border bg-muted/50 opacity-50"
                      : "border-border hover:border-primary"
                  }`}
                  disabled={product.stock_quantity <= 0}
                >
                  <div className="text-right">
                    <p className="font-medium text-sm text-foreground">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {product.sku || ""} {product.barcode ? `| ${product.barcode}` : ""}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-primary">
                      {formatCurrencyAmount(product.price, currencyCode)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      متوفر: {product.stock_quantity}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full lg:w-[340px] flex flex-col bg-card border border-border rounded-xl overflow-hidden">
        {/* Customer Selection */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="bg-muted border-0 text-sm h-9">
                <SelectValue placeholder="اختر العميل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="walk-in">عميل عابر</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cart Header */}
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-foreground" />
            <span className="font-heading font-bold text-sm text-foreground">
              {cartItemsCount} بنود
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs text-destructive hover:underline"
            >
              مسح الكل
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <AnimatePresence>
            {cart.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                السلة فارغة
              </div>
            ) : (
              cart.map((item) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatCurrencyAmount(item.product.price, currencyCode)} × {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded bg-background border border-border flex items-center justify-center hover:bg-muted"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded bg-background border border-border flex items-center justify-center hover:bg-muted"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-left min-w-[70px]">
                    <p className="text-xs font-bold text-foreground">
                      {formatCurrencyAmount(
                        item.product.price * item.quantity,
                        currencyCode
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="w-6 h-6 rounded flex items-center justify-center text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Cart Footer */}
        <div className="border-t border-border p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-heading font-bold text-foreground">الإجمالي:</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrencyAmount(cartTotal, currencyCode)}
            </span>
          </div>

          <Button
            className="w-full gradient-primary text-primary-foreground font-heading text-base h-12"
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
          >
            <CreditCard className="w-5 h-5 ml-2" />
            {processing ? "جاري المعالجة..." : "عملية الدفع"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default POSPage;

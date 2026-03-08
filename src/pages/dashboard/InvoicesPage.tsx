import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal, Download, Printer, Trash2, Eye, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string | null;
  status: string;
  subtotal: number | null;
  tax_rate: number | null;
  tax_amount: number | null;
  discount: number | null;
  total: number | null;
  notes: string | null;
  customer_id: string | null;
  customers?: { name: string } | null;
}

interface Customer {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/10 text-primary",
  paid: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  sent: "مُرسلة",
  paid: "مدفوعة",
  overdue: "متأخرة",
  cancelled: "ملغاة",
};

const InvoicesPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewItems, setPreviewItems] = useState<InvoiceItem[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    customer_id: "", due_date: "", tax_rate: "14", discount: "0", notes: "", status: "draft",
    items: [{ description: "", quantity: 1, unit_price: 0 }] as { description: string; quantity: number; unit_price: number }[],
  });

  const fetchData = async () => {
    const [invRes, custRes] = await Promise.all([
      supabase.from("invoices").select("*, customers(name)").order("created_at", { ascending: false }),
      supabase.from("customers").select("id, name"),
    ]);
    if (invRes.data) setInvoices(invRes.data as Invoice[]);
    if (custRes.data) setCustomers(custRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getCompanyId = async () => {
    const { data } = await supabase.rpc("get_user_company_id", { _user_id: user!.id });
    return data;
  };

  const calcTotals = () => {
    const subtotal = form.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const taxRate = parseFloat(form.tax_rate) || 0;
    const discount = parseFloat(form.discount) || 0;
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const total = subtotal - discount + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSave = async () => {
    const companyId = await getCompanyId();
    if (!companyId) { toast.error("لا توجد شركة مرتبطة بحسابك"); return; }
    if (form.items.every(i => !i.description.trim())) { toast.error("أضف عنصر واحد على الأقل"); return; }

    const { subtotal, taxAmount, total } = calcTotals();
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const { data: inv, error } = await supabase.from("invoices").insert({
      company_id: companyId, invoice_number: invoiceNumber,
      customer_id: form.customer_id || null,
      due_date: form.due_date || null,
      tax_rate: parseFloat(form.tax_rate) || 0,
      discount: parseFloat(form.discount) || 0,
      subtotal, tax_amount: taxAmount, total,
      notes: form.notes || null, status: form.status,
    }).select().single();

    if (error || !inv) { toast.error("خطأ في إنشاء الفاتورة"); return; }

    const items = form.items.filter(i => i.description.trim()).map(i => ({
      invoice_id: inv.id, description: i.description,
      quantity: i.quantity, unit_price: i.unit_price,
      total: i.quantity * i.unit_price,
    }));

    if (items.length > 0) {
      await supabase.from("invoice_items").insert(items);
    }

    toast.success("تم إنشاء الفاتورة بنجاح");
    setDialogOpen(false);
    resetForm();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("invoice_items").delete().eq("invoice_id", id);
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) { toast.error("خطأ في الحذف"); return; }
    toast.success("تم حذف الفاتورة");
    fetchData();
  };

  const openPreview = async (inv: Invoice) => {
    setPreviewInvoice(inv);
    const { data } = await supabase.from("invoice_items").select("*").eq("invoice_id", inv.id);
    setPreviewItems(data || []);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl"><head><title>فاتورة</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; direction: rtl; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
        th { background: #f5f5f5; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .total-row { font-weight: bold; font-size: 1.1em; }
      </style></head><body>${printRef.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const resetForm = () => {
    setForm({ customer_id: "", due_date: "", tax_rate: "14", discount: "0", notes: "", status: "draft", items: [{ description: "", quantity: 1, unit_price: 0 }] });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { description: "", quantity: 1, unit_price: 0 }] });
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx: number, field: string, value: string | number) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const { subtotal, taxAmount, total } = calcTotals();
  const filtered = invoices.filter(inv =>
    inv.invoice_number.includes(search) || inv.customers?.name?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">الفواتير</h1>
          <p className="text-sm text-muted-foreground">إنشاء وإدارة الفواتير</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground font-heading">
              <Plus className="w-4 h-4 ml-2" />
              فاتورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">إنشاء فاتورة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">العميل</label>
                  <Select value={form.customer_id} onValueChange={v => setForm({...form, customer_id: v})}>
                    <SelectTrigger><SelectValue placeholder="اختر عميل" /></SelectTrigger>
                    <SelectContent>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">تاريخ الاستحقاق</label>
                  <Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className="font-body" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">عناصر الفاتورة</label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="w-3 h-3 ml-1" /> إضافة</Button>
                </div>
                {form.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_80px_100px_32px] gap-2 mb-2">
                    <Input placeholder="الوصف" value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} className="font-body" />
                    <Input type="number" placeholder="الكمية" value={item.quantity} onChange={e => updateItem(idx, "quantity", parseInt(e.target.value) || 0)} className="font-body" />
                    <Input type="number" placeholder="السعر" value={item.unit_price} onChange={e => updateItem(idx, "unit_price", parseFloat(e.target.value) || 0)} className="font-body" />
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="w-8 h-10 rounded-md hover:bg-destructive/10 flex items-center justify-center text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="نسبة الضريبة %" type="number" value={form.tax_rate} onChange={e => setForm({...form, tax_rate: e.target.value})} className="font-body" />
                <Input placeholder="الخصم (ج.م)" type="number" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className="font-body" />
              </div>

              <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>المجموع الفرعي:</span><span>{subtotal.toFixed(2)} ج.م</span></div>
                <div className="flex justify-between"><span>الضريبة ({form.tax_rate}%):</span><span>{taxAmount.toFixed(2)} ج.م</span></div>
                <div className="flex justify-between"><span>الخصم:</span><span>{parseFloat(form.discount || "0").toFixed(2)} ج.م</span></div>
                <div className="flex justify-between font-bold text-foreground border-t border-border pt-1"><span>الإجمالي:</span><span>{total.toFixed(2)} ج.م</span></div>
              </div>

              <Textarea placeholder="ملاحظات..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="font-body" />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground">إنشاء الفاتورة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={!!previewInvoice} onOpenChange={(open) => { if (!open) setPreviewInvoice(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">معاينة الفاتورة</DialogTitle>
          </DialogHeader>
          {previewInvoice && (
            <div ref={printRef}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-heading font-bold text-xl">SecureERP</h2>
                    <p className="text-sm text-muted-foreground">فاتورة ضريبية</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{previewInvoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">{previewInvoice.issue_date}</p>
                  </div>
                </div>
                {previewInvoice.customers && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">العميل</p>
                    <p className="font-medium">{previewInvoice.customers.name}</p>
                  </div>
                )}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right pb-2">الوصف</th>
                      <th className="text-right pb-2">الكمية</th>
                      <th className="text-right pb-2">السعر</th>
                      <th className="text-right pb-2">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewItems.map((item, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="py-2">{item.description}</td>
                        <td className="py-2">{item.quantity}</td>
                        <td className="py-2">{item.unit_price} ج.م</td>
                        <td className="py-2">{item.total} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span>المجموع الفرعي:</span><span>{previewInvoice.subtotal} ج.م</span></div>
                  <div className="flex justify-between"><span>الضريبة:</span><span>{previewInvoice.tax_amount} ج.م</span></div>
                  <div className="flex justify-between"><span>الخصم:</span><span>{previewInvoice.discount} ج.م</span></div>
                  <div className="flex justify-between font-bold border-t border-border pt-1"><span>الإجمالي:</span><span>{previewInvoice.total} ج.م</span></div>
                </div>
                {previewInvoice.notes && <p className="text-sm text-muted-foreground">{previewInvoice.notes}</p>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 ml-2" /> طباعة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث عن فاتورة..." className="pr-10 font-body bg-muted border-0" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا يوجد فواتير بعد. أنشئ أول فاتورة!</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">رقم الفاتورة</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">التاريخ</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">العميل</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">الإجمالي</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">الحالة</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => (
                  <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium text-sm text-primary">{inv.invoice_number}</td>
                    <td className="p-4 text-sm text-muted-foreground">{inv.issue_date}</td>
                    <td className="p-4 text-sm text-foreground">{inv.customers?.name || "—"}</td>
                    <td className="p-4 text-sm font-semibold text-foreground">{inv.total} ج.م</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[inv.status] || ""}`}>
                        {statusLabels[inv.status] || inv.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPreview(inv)}><Eye className="w-4 h-4 ml-2" /> معاينة</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { openPreview(inv); setTimeout(handlePrint, 500); }}><Printer className="w-4 h-4 ml-2" /> طباعة</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(inv.id)}><Trash2 className="w-4 h-4 ml-2" /> حذف</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;

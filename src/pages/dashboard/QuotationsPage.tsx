import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MoreHorizontal, Printer, Trash2, Eye, Edit, FileText, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCurrencyAmount } from "@/lib/currency";
import { getCompanyProfile, CompanyProfile } from "@/lib/company";
import { useNavigate } from "react-router-dom";

interface QuotationItem {
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
}

interface Quotation {
  id: string;
  quotation_number: string;
  issue_date: string;
  valid_until: string | null;
  status: string;
  subtotal: number | null;
  tax_rate: number | null;
  tax_amount: number | null;
  discount: number | null;
  total: number | null;
  notes: string | null;
  customer_id: string | null;
  converted_invoice_id: string | null;
  customers?: { name: string } | null;
}

interface Customer { id: string; name: string; }
interface Product { id: string; name: string; price: number; }

const STATUS_LABELS: Record<string, string> = { draft: "مسودة", sent: "مُرسلة", accepted: "مقبولة", rejected: "مرفوضة", converted: "محوّلة لفاتورة" };
const STATUS_COLORS: Record<string, string> = { draft: "bg-muted text-muted-foreground", sent: "bg-primary/10 text-primary", accepted: "bg-success/10 text-success", rejected: "bg-destructive/10 text-destructive", converted: "bg-accent text-accent-foreground" };

const escapeHtml = (v: string | null | undefined) => {
  if (!v) return "";
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};

const QuotationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [currencyCode, setCurrencyCode] = useState("EGP");

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);
  const [previewItems, setPreviewItems] = useState<any[]>([]);

  const [form, setForm] = useState({
    customer_id: "",
    valid_until: "",
    tax_rate: "14",
    discount: "0",
    notes: "",
    status: "draft",
    items: [{ product_id: null as string | null, description: "", quantity: 1, unit_price: 0 }],
  });

  const resetForm = () => {
    setEditing(null);
    setForm({ customer_id: "", valid_until: "", tax_rate: "14", discount: "0", notes: "", status: "draft", items: [{ product_id: null, description: "", quantity: 1, unit_price: 0 }] });
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const company = await getCompanyProfile(user.id);
      if (!company) { toast.error("لا توجد شركة مرتبطة بحسابك"); setLoading(false); return; }
      setCompanyId(company.id);
      setCompanyProfile(company);
      setCurrencyCode(company.currency || "EGP");

      const [qRes, cRes, pRes] = await Promise.all([
        supabase.from("quotations").select("id, quotation_number, issue_date, valid_until, status, subtotal, tax_rate, tax_amount, discount, total, notes, customer_id, converted_invoice_id, customers(name)").eq("company_id", company.id).order("created_at", { ascending: false }),
        supabase.from("customers").select("id, name").eq("company_id", company.id),
        supabase.from("products").select("id, name, price").eq("company_id", company.id),
      ]);
      setQuotations((qRes.data as Quotation[]) || []);
      setCustomers(cRes.data || []);
      setProducts((pRes.data as Product[]) || []);
    } catch { toast.error("تعذر تحميل البيانات"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user?.id]);

  const calcTotals = () => {
    const subtotal = form.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const disc = Number(form.discount) || 0;
    const taxable = Math.max(subtotal - disc, 0);
    const taxAmount = taxable * ((Number(form.tax_rate) || 0) / 100);
    return { subtotal, taxAmount, total: taxable + taxAmount, discountAmount: disc };
  };

  const handleSave = async () => {
    if (!user || !companyId) return;
    const validItems = form.items.filter(i => i.description.trim());
    if (!validItems.length) { toast.error("أضف عنصرًا واحدًا على الأقل"); return; }
    setSaving(true);
    const { subtotal, taxAmount, total, discountAmount } = calcTotals();
    const payload = {
      company_id: companyId,
      customer_id: form.customer_id || null,
      valid_until: form.valid_until || null,
      tax_rate: Number(form.tax_rate) || 0,
      discount: discountAmount,
      subtotal, tax_amount: taxAmount, total,
      notes: form.notes || null,
      status: form.status,
    };

    try {
      let qId = editing?.id;
      if (editing) {
        const { error } = await supabase.from("quotations").update(payload).eq("id", editing.id);
        if (error) { toast.error("تعذر التحديث"); setSaving(false); return; }
        await supabase.from("quotation_items").delete().eq("quotation_id", editing.id);
      } else {
        const qNumber = `QT-${Date.now().toString().slice(-6)}`;
        const { data, error } = await supabase.from("quotations").insert({ ...payload, quotation_number: qNumber }).select("id").single();
        if (error || !data) { toast.error("تعذر الإنشاء"); setSaving(false); return; }
        qId = data.id;
      }
      await supabase.from("quotation_items").insert(validItems.map(i => ({ quotation_id: qId!, product_id: i.product_id || null, description: i.description, quantity: i.quantity, unit_price: i.unit_price, total: i.quantity * i.unit_price })));
      toast.success(editing ? "تم تعديل العرض" : "تم إنشاء العرض");
      setDialogOpen(false); resetForm(); fetchData();
    } catch { toast.error("حدث خطأ"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("quotation_items").delete().eq("quotation_id", id);
    const { error } = await supabase.from("quotations").delete().eq("id", id);
    if (error) { toast.error("تعذر الحذف"); return; }
    toast.success("تم حذف العرض"); fetchData();
  };

  const convertToInvoice = async (q: Quotation) => {
    if (!companyId) return;
    // Fetch quotation items
    const { data: qItems } = await supabase.from("quotation_items").select("product_id, description, quantity, unit_price, total").eq("quotation_id", q.id);
    if (!qItems || !qItems.length) { toast.error("العرض فارغ"); return; }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const { data: inv, error: invErr } = await supabase.from("invoices").insert({
      company_id: companyId, customer_id: q.customer_id, invoice_number: invoiceNumber,
      subtotal: q.subtotal, tax_rate: q.tax_rate, tax_amount: q.tax_amount, discount: q.discount, total: q.total,
      notes: q.notes, status: "draft",
    }).select("id").single();

    if (invErr || !inv) { toast.error("تعذر إنشاء الفاتورة"); return; }

    await supabase.from("invoice_items").insert(qItems.map(i => ({ invoice_id: inv.id, product_id: i.product_id, description: i.description, quantity: i.quantity, unit_price: i.unit_price, total: i.total })));
    await supabase.from("quotations").update({ status: "converted", converted_invoice_id: inv.id }).eq("id", q.id);

    toast.success("تم تحويل العرض إلى فاتورة");
    fetchData();
    navigate("/dashboard/invoices");
  };

  const openPreview = async (q: Quotation) => {
    const { data } = await supabase.from("quotation_items").select("id, description, quantity, unit_price, total").eq("quotation_id", q.id);
    setPreviewQuotation(q);
    setPreviewItems(data || []);
  };

  const openEdit = async (q: Quotation) => {
    const { data } = await supabase.from("quotation_items").select("product_id, description, quantity, unit_price").eq("quotation_id", q.id);
    setEditing(q);
    setForm({
      customer_id: q.customer_id || "", valid_until: q.valid_until || "",
      tax_rate: String(q.tax_rate ?? 14), discount: String(q.discount ?? 0),
      notes: q.notes || "", status: q.status,
      items: data && data.length ? data.map(i => ({ product_id: i.product_id, description: i.description, quantity: Number(i.quantity), unit_price: Number(i.unit_price) })) : [{ product_id: null, description: "", quantity: 1, unit_price: 0 }],
    });
    setDialogOpen(true);
  };

  const printQuotation = (q: Quotation, items: any[]) => {
    const w = window.open("", "_blank");
    if (!w) { toast.error("المتصفح منع نافذة الطباعة"); return; }
    const logoHtml = companyProfile?.logo_url ? `<img src="${escapeHtml(companyProfile.logo_url)}" style="width:60px;height:60px;object-fit:contain;margin-left:12px;" />` : "";
    const rows = items.map(i => `<tr><td>${escapeHtml(i.description)}</td><td>${i.quantity}</td><td>${escapeHtml(formatCurrencyAmount(i.unit_price, currencyCode))}</td><td>${escapeHtml(formatCurrencyAmount(i.total, currencyCode))}</td></tr>`).join("");
    w.document.write(`<html dir="rtl"><head><meta charset="utf-8"/><title>عرض سعر ${escapeHtml(q.quotation_number)}</title><style>body{font-family:'Segoe UI',Tahoma,sans-serif;padding:32px;direction:rtl;color:#111827}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}.company-info{display:flex;align-items:center}.meta{color:#6b7280;font-size:14px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #e5e7eb;padding:10px;text-align:right}th{background:#f3f4f6}.totals{background:#f9fafb;border-radius:10px;padding:12px;width:320px;margin-right:auto}.totals-row{display:flex;justify-content:space-between;margin-bottom:6px}.total-bold{font-weight:700;border-top:1px solid #e5e7eb;margin-top:8px;padding-top:8px}.box{background:#f9fafb;border-radius:10px;padding:12px;margin-bottom:16px}</style></head><body><div class="header"><div class="company-info">${logoHtml}<div><h2>${escapeHtml(companyProfile?.name || "")}</h2><div class="meta">عرض سعر</div>${companyProfile?.tax_number ? `<div class="meta">الرقم الضريبي: ${escapeHtml(companyProfile.tax_number)}</div>` : ""}</div></div><div><div><strong>${escapeHtml(q.quotation_number)}</strong></div><div class="meta">تاريخ الإصدار: ${escapeHtml(q.issue_date)}</div><div class="meta">صالح حتى: ${escapeHtml(q.valid_until || "—")}</div></div></div>${q.customers?.name ? `<div class="box"><strong>العميل:</strong> ${escapeHtml(q.customers.name)}</div>` : ""}<table><thead><tr><th>الوصف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div class="totals-row"><span>المجموع الفرعي</span><span>${escapeHtml(formatCurrencyAmount(q.subtotal, currencyCode))}</span></div><div class="totals-row"><span>الضريبة</span><span>${escapeHtml(formatCurrencyAmount(q.tax_amount, currencyCode))}</span></div><div class="totals-row"><span>الخصم</span><span>${escapeHtml(formatCurrencyAmount(q.discount, currencyCode))}</span></div><div class="totals-row total-bold"><span>الإجمالي</span><span>${escapeHtml(formatCurrencyAmount(q.total, currencyCode))}</span></div></div>${q.notes ? `<p class="meta" style="margin-top:14px"><strong>ملاحظات:</strong> ${escapeHtml(q.notes)}</p>` : ""}</body></html>`);
    w.document.close(); w.focus(); w.print();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return quotations;
    return quotations.filter(qt => qt.quotation_number.toLowerCase().includes(q) || qt.customers?.name?.toLowerCase().includes(q));
  }, [quotations, search]);

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { product_id: null, description: "", quantity: 1, unit_price: 0 }] }));
  const removeItem = (idx: number) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx: number, field: string, value: any) => {
    setForm(p => {
      const items = [...p.items];
      (items[idx] as any)[field] = value;
      if (field === "product_id" && value) {
        const prod = products.find(pr => pr.id === value);
        if (prod) { items[idx].description = prod.name; items[idx].unit_price = prod.price; }
      }
      return { ...p, items };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">عروض الأسعار</h1>
          <p className="text-sm text-muted-foreground">إنشاء عروض أسعار وتحويلها لفواتير</p>
        </div>
        <Button className="gradient-primary text-primary-foreground font-heading" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 ml-2" /> عرض جديد
        </Button>
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-heading">{editing ? "تعديل عرض السعر" : "عرض سعر جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={form.customer_id} onValueChange={v => setForm(p => ({ ...p, customer_id: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="date" value={form.valid_until} onChange={e => setForm(p => ({ ...p, valid_until: e.target.value }))} placeholder="صالح حتى" />
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="sent">مُرسلة</SelectItem>
                  <SelectItem value="accepted">مقبولة</SelectItem>
                  <SelectItem value="rejected">مرفوضة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-semibold text-sm text-foreground">العناصر</h4>
                <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-3 h-3 ml-1" /> إضافة</Button>
              </div>
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3">
                    <Select value={item.product_id || ""} onValueChange={v => updateItem(idx, "product_id", v)}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="منتج" /></SelectTrigger>
                      <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4"><Input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="الوصف" className="text-sm" /></div>
                  <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} placeholder="الكمية" className="text-sm" min={1} /></div>
                  <div className="col-span-2"><Input type="number" value={item.unit_price} onChange={e => updateItem(idx, "unit_price", Number(e.target.value))} placeholder="السعر" className="text-sm" min={0} /></div>
                  <div className="col-span-1"><Button variant="ghost" size="sm" onClick={() => removeItem(idx)} className="text-destructive h-10 w-full"><Trash2 className="w-3 h-3" /></Button></div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input type="number" value={form.tax_rate} onChange={e => setForm(p => ({ ...p, tax_rate: e.target.value }))} placeholder="نسبة الضريبة %" />
              <Input type="number" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} placeholder="الخصم" />
            </div>
            <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات" rows={2} />

            {/* Totals preview */}
            {(() => { const t = calcTotals(); return (
              <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>المجموع الفرعي:</span><span>{formatCurrencyAmount(t.subtotal, currencyCode)}</span></div>
                <div className="flex justify-between"><span>الضريبة:</span><span>{formatCurrencyAmount(t.taxAmount, currencyCode)}</span></div>
                <div className="flex justify-between"><span>الخصم:</span><span>{formatCurrencyAmount(t.discountAmount, currencyCode)}</span></div>
                <div className="flex justify-between font-bold border-t border-border pt-1"><span>الإجمالي:</span><span>{formatCurrencyAmount(t.total, currencyCode)}</span></div>
              </div>
            ); })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground">{saving ? "جاري الحفظ..." : "حفظ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewQuotation} onOpenChange={o => { if (!o) { setPreviewQuotation(null); setPreviewItems([]); } }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-heading">معاينة عرض السعر</DialogTitle></DialogHeader>
          {previewQuotation && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {companyProfile?.logo_url && <img src={companyProfile.logo_url} alt="Logo" className="w-14 h-14 object-contain rounded-lg" />}
                  <div>
                    <h2 className="font-heading font-bold text-xl text-foreground">{companyProfile?.name}</h2>
                    <p className="text-sm text-muted-foreground">عرض سعر</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">{previewQuotation.quotation_number}</p>
                  <p className="text-sm text-muted-foreground">{previewQuotation.issue_date}</p>
                </div>
              </div>
              {previewQuotation.customers && <div className="bg-muted rounded-lg p-3"><p className="text-sm text-muted-foreground">العميل</p><p className="font-medium text-foreground">{previewQuotation.customers.name}</p></div>}
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border"><th className="text-right pb-2">الوصف</th><th className="text-right pb-2">الكمية</th><th className="text-right pb-2">السعر</th><th className="text-right pb-2">الإجمالي</th></tr></thead>
                <tbody>{previewItems.map((item: any, i: number) => <tr key={i} className="border-b border-border"><td className="py-2">{item.description}</td><td className="py-2">{item.quantity}</td><td className="py-2">{formatCurrencyAmount(item.unit_price, currencyCode)}</td><td className="py-2">{formatCurrencyAmount(item.total, currencyCode)}</td></tr>)}</tbody>
              </table>
              <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>المجموع الفرعي:</span><span>{formatCurrencyAmount(previewQuotation.subtotal, currencyCode)}</span></div>
                <div className="flex justify-between"><span>الضريبة:</span><span>{formatCurrencyAmount(previewQuotation.tax_amount, currencyCode)}</span></div>
                <div className="flex justify-between"><span>الخصم:</span><span>{formatCurrencyAmount(previewQuotation.discount, currencyCode)}</span></div>
                <div className="flex justify-between font-bold border-t border-border pt-1"><span>الإجمالي:</span><span>{formatCurrencyAmount(previewQuotation.total, currencyCode)}</span></div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { if (previewQuotation) printQuotation(previewQuotation, previewItems); }}><Printer className="w-4 h-4 ml-2" /> طباعة</Button>
            {previewQuotation && previewQuotation.status !== "converted" && (
              <Button className="gradient-primary text-primary-foreground" onClick={() => { if (previewQuotation) convertToInvoice(previewQuotation); }}><ArrowLeftRight className="w-4 h-4 ml-2" /> تحويل لفاتورة</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث عن عرض..." className="pr-10 font-body bg-muted border-0" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div> :
           filtered.length === 0 ? <div className="p-8 text-center text-muted-foreground">لا توجد عروض أسعار</div> : (
            <table className="w-full">
              <thead><tr className="border-b border-border">
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">رقم العرض</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">التاريخ</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">صالح حتى</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">العميل</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">الإجمالي</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">الحالة</th>
                <th className="p-4" />
              </tr></thead>
              <tbody>
                {filtered.map((q, i) => (
                  <motion.tr key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="p-4 text-sm font-medium text-foreground">{q.quotation_number}</td>
                    <td className="p-4 text-sm text-muted-foreground">{q.issue_date}</td>
                    <td className="p-4 text-sm text-muted-foreground">{q.valid_until || "—"}</td>
                    <td className="p-4 text-sm text-muted-foreground">{q.customers?.name || "—"}</td>
                    <td className="p-4 text-sm font-semibold text-foreground">{formatCurrencyAmount(q.total, currencyCode)}</td>
                    <td className="p-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[q.status] || "bg-muted text-muted-foreground"}`}>{STATUS_LABELS[q.status] || q.status}</span></td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPreview(q)}><Eye className="w-4 h-4 ml-2" /> معاينة</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(q)}><Edit className="w-4 h-4 ml-2" /> تعديل</DropdownMenuItem>
                          {q.status !== "converted" && <DropdownMenuItem onClick={() => convertToInvoice(q)}><ArrowLeftRight className="w-4 h-4 ml-2" /> تحويل لفاتورة</DropdownMenuItem>}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(q.id)}><Trash2 className="w-4 h-4 ml-2" /> حذف</DropdownMenuItem>
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

export default QuotationsPage;

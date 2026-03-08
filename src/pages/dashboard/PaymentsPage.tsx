import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MoreHorizontal, Trash2, Edit, Upload, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCurrencyAmount } from "@/lib/currency";
import { getUserCompanyId } from "@/lib/company";

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  reference: string | null;
  notes: string | null;
  invoice_id: string | null;
  receipt_url: string | null;
  invoices?: { invoice_number: string } | null;
}

interface Invoice { id: string; invoice_number: string; }

const METHODS: Record<string, string> = { cash: "نقدي", bank_transfer: "تحويل بنكي", instapay: "InstaPay", vodafone_cash: "فودافون كاش", card: "بطاقة", other: "أخرى" };

const PaymentsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState("EGP");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const [form, setForm] = useState({ amount: "", payment_date: new Date().toISOString().split("T")[0], payment_method: "cash", reference: "", notes: "", invoice_id: "", receipt_url: "" });
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setEditing(null);
    setForm({ amount: "", payment_date: new Date().toISOString().split("T")[0], payment_method: "cash", reference: "", notes: "", invoice_id: "", receipt_url: "" });
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const cId = await getUserCompanyId(user.id);
      if (!cId) { setLoading(false); return; }
      setCompanyId(cId);

      const { data: company } = await supabase.from("companies").select("currency").eq("id", cId).single();
      setCurrencyCode(company?.currency || "EGP");

      const [pRes, iRes] = await Promise.all([
        supabase.from("payments").select("id, amount, payment_date, payment_method, reference, notes, invoice_id, receipt_url, invoices(invoice_number)").eq("company_id", cId).order("created_at", { ascending: false }),
        supabase.from("invoices").select("id, invoice_number").eq("company_id", cId).order("created_at", { ascending: false }),
      ]);
      setPayments((pRes.data as Payment[]) || []);
      setInvoices(iRes.data || []);
    } catch { toast.error("تعذر تحميل المدفوعات"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user?.id]);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("الحد الأقصى 5 ميجابايت"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${companyId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("receipts").upload(path, file, { upsert: true });
    if (error) { toast.error("تعذر رفع الإيصال"); setUploading(false); return; }
    const { data } = supabase.storage.from("receipts").getPublicUrl(path);
    setForm(p => ({ ...p, receipt_url: data.publicUrl }));
    setUploading(false);
    toast.success("تم رفع الإيصال");
  };

  const handleSave = async () => {
    if (!companyId) return;
    if (!form.amount || Number(form.amount) <= 0) { toast.error("أدخل مبلغ صحيح"); return; }
    setSaving(true);
    const payload = {
      company_id: companyId,
      amount: Number(form.amount),
      payment_date: form.payment_date,
      payment_method: form.payment_method,
      reference: form.reference || null,
      notes: form.notes || null,
      invoice_id: form.invoice_id || null,
      receipt_url: form.receipt_url || null,
    };
    try {
      if (editing) {
        const { error } = await supabase.from("payments").update(payload).eq("id", editing.id);
        if (error) { toast.error("تعذر التحديث"); setSaving(false); return; }
      } else {
        const { error } = await supabase.from("payments").insert(payload);
        if (error) { toast.error("تعذر الإنشاء"); setSaving(false); return; }
      }
      toast.success(editing ? "تم التعديل" : "تم تسجيل الدفعة");
      setDialogOpen(false); resetForm(); fetchData();
    } catch { toast.error("حدث خطأ"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) { toast.error("تعذر الحذف"); return; }
    toast.success("تم الحذف"); fetchData();
  };

  const openEdit = (p: Payment) => {
    setEditing(p);
    setForm({ amount: String(p.amount), payment_date: p.payment_date, payment_method: p.payment_method || "cash", reference: p.reference || "", notes: p.notes || "", invoice_id: p.invoice_id || "", receipt_url: p.receipt_url || "" });
    setDialogOpen(true);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter(p => p.reference?.toLowerCase().includes(q) || p.invoices?.invoice_number?.toLowerCase().includes(q) || (METHODS[p.payment_method || ""] || "").includes(q));
  }, [payments, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">المدفوعات</h1>
          <p className="text-sm text-muted-foreground">تسجيل ومتابعة المدفوعات مع رفع إيصالات</p>
        </div>
        <Button className="gradient-primary text-primary-foreground font-heading" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 ml-2" /> تسجيل دفعة
        </Button>
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-heading">{editing ? "تعديل الدفعة" : "تسجيل دفعة جديدة"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-foreground block mb-1">المبلغ *</label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} min={0} /></div>
              <div><label className="text-sm font-medium text-foreground block mb-1">التاريخ</label><Input type="date" value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">طريقة الدفع</label>
                <Select value={form.payment_method} onValueChange={v => setForm(p => ({ ...p, payment_method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(METHODS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">الفاتورة</label>
                <Select value={form.invoice_id} onValueChange={v => setForm(p => ({ ...p, invoice_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="اختياري" /></SelectTrigger>
                  <SelectContent>{invoices.map(i => <SelectItem key={i.id} value={i.id}>{i.invoice_number}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Input value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} placeholder="رقم المرجع / المعاملة" />
            <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات" rows={2} />

            {/* Receipt Upload */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">إيصال الدفع</label>
              {form.receipt_url ? (
                <div className="relative inline-block">
                  <img src={form.receipt_url} alt="إيصال" className="max-w-full max-h-40 rounded-lg border border-border object-contain" />
                  <button onClick={() => setForm(p => ({ ...p, receipt_url: "" }))} className="absolute -top-2 -left-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs">✕</button>
                </div>
              ) : (
                <label className="cursor-pointer flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{uploading ? "جاري الرفع..." : "اضغط لرفع إيصال (صورة أو PDF، حتى 5MB)"}</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleReceiptUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground">{saving ? "جاري الحفظ..." : "حفظ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Preview */}
      <Dialog open={!!receiptPreview} onOpenChange={o => { if (!o) setReceiptPreview(null); }}>
        <DialogContent className="sm:max-w-lg"><img src={receiptPreview || ""} alt="إيصال" className="w-full rounded-lg" /></DialogContent>
      </Dialog>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="بحث..." className="pr-10 font-body bg-muted border-0" value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div> :
           filtered.length === 0 ? <div className="p-8 text-center text-muted-foreground">لا توجد مدفوعات</div> : (
            <table className="w-full">
              <thead><tr className="border-b border-border">
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">التاريخ</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">المبلغ</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">الطريقة</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">الفاتورة</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">المرجع</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-4">إيصال</th>
                <th className="p-4" />
              </tr></thead>
              <tbody>
                {filtered.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="p-4 text-sm text-muted-foreground">{p.payment_date}</td>
                    <td className="p-4 text-sm font-semibold text-foreground">{formatCurrencyAmount(p.amount, currencyCode)}</td>
                    <td className="p-4 text-sm text-muted-foreground">{METHODS[p.payment_method || ""] || p.payment_method}</td>
                    <td className="p-4 text-sm text-muted-foreground">{p.invoices?.invoice_number || "—"}</td>
                    <td className="p-4 text-sm text-muted-foreground">{p.reference || "—"}</td>
                    <td className="p-4">{p.receipt_url ? <button onClick={() => setReceiptPreview(p.receipt_url)} className="text-primary hover:underline text-xs flex items-center gap-1"><Eye className="w-3 h-3" /> عرض</button> : <span className="text-xs text-muted-foreground">—</span>}</td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(p)}><Edit className="w-4 h-4 ml-2" /> تعديل</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 ml-2" /> حذف</DropdownMenuItem>
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

export default PaymentsPage;

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCurrencyAmount } from "@/lib/currency";
import { getCompanyProfile } from "@/lib/company";

interface Expense {
  id: string;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: string | null;
  reference: string | null;
  notes: string | null;
  category_id: string | null;
  categories?: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

interface ExpenseForm {
  description: string;
  amount: string;
  expense_date: string;
  payment_method: string;
  reference: string;
  notes: string;
  category_id: string;
}

const PAYMENT_METHODS: Record<string, string> = {
  cash: "نقدي",
  bank_transfer: "تحويل بنكي",
  credit_card: "بطاقة ائتمان",
  other: "أخرى",
};

const createDefaultForm = (): ExpenseForm => ({
  description: "",
  amount: "",
  expense_date: new Date().toISOString().split("T")[0],
  payment_method: "cash",
  reference: "",
  notes: "",
  category_id: "",
});

const ExpensesPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState("EGP");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<ExpenseForm>(createDefaultForm());

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const company = await getCompanyProfile(user.id);
      if (!company) { toast.error("لا توجد شركة مرتبطة بحسابك"); return; }
      setCompanyId(company.id);
      setCurrencyCode(company.currency || "EGP");

      const [expRes, catRes] = await Promise.all([
        supabase.from("expenses").select("id, description, amount, expense_date, payment_method, reference, notes, category_id, categories(name)").eq("company_id", company.id).order("expense_date", { ascending: false }),
        supabase.from("categories").select("id, name").eq("company_id", company.id).eq("type", "expense"),
      ]);

      setExpenses((expRes.data as Expense[]) || []);
      setCategories(catRes.data || []);
    } catch { toast.error("تعذر تحميل المصروفات"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user?.id]);

  const openCreate = () => { setEditing(null); setForm(createDefaultForm()); setDialogOpen(true); };
  const openEdit = (exp: Expense) => {
    setEditing(exp);
    setForm({
      description: exp.description,
      amount: String(exp.amount),
      expense_date: exp.expense_date,
      payment_method: exp.payment_method || "cash",
      reference: exp.reference || "",
      notes: exp.notes || "",
      category_id: exp.category_id || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!companyId) return;
    if (!form.description.trim() || !form.amount) { toast.error("أدخل الوصف والمبلغ"); return; }
    setSaving(true);
    const payload = {
      company_id: companyId,
      description: form.description,
      amount: Number(form.amount),
      expense_date: form.expense_date,
      payment_method: form.payment_method || null,
      reference: form.reference || null,
      notes: form.notes || null,
      category_id: form.category_id || null,
    };
    try {
      if (editing) {
        const { error } = await supabase.from("expenses").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("تم تعديل المصروف");
      } else {
        const { error } = await supabase.from("expenses").insert(payload);
        if (error) throw error;
        toast.success("تم إضافة المصروف");
      }
      setDialogOpen(false);
      fetchData();
    } catch { toast.error("حدث خطأ أثناء الحفظ"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) { toast.error("تعذر الحذف"); return; }
    toast.success("تم حذف المصروف");
    fetchData();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return expenses;
    return expenses.filter(e => e.description.toLowerCase().includes(q) || e.categories?.name?.toLowerCase().includes(q));
  }, [expenses, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">المصروفات</h1>
          <p className="text-sm text-muted-foreground">تتبع وتصنيف المصروفات</p>
        </div>
        <Button className="gradient-primary text-primary-foreground font-heading" onClick={openCreate}>
          <Plus className="w-4 h-4 ml-2" />مصروف جديد
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-heading">{editing ? "تعديل المصروف" : "إضافة مصروف جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="الوصف *" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="المبلغ *" type="number" min={0} value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              <Input type="date" value={form.expense_date} onChange={e => setForm({...form, expense_date: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.payment_method} onValueChange={v => setForm({...form, payment_method: v})}>
                <SelectTrigger><SelectValue placeholder="طريقة الدفع" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHODS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.category_id || "none"} onValueChange={v => setForm({...form, category_id: v === "none" ? "" : v})}>
                <SelectTrigger><SelectValue placeholder="التصنيف" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون تصنيف</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="المرجع" value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} />
            <Textarea placeholder="ملاحظات..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground">
              {saving ? "جاري الحفظ..." : editing ? "حفظ التعديل" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث..." className="pr-10 font-body bg-muted border-0" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا توجد مصروفات</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">طريقة الدفع</TableHead>
                  <TableHead className="text-right w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((exp, i) => (
                  <motion.tr key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b transition-colors hover:bg-muted/50">
                    <TableCell className="font-medium text-foreground">{exp.description}</TableCell>
                    <TableCell className="text-muted-foreground">{exp.categories?.name || "—"}</TableCell>
                    <TableCell className="text-foreground">{formatCurrencyAmount(exp.amount, currencyCode)}</TableCell>
                    <TableCell className="text-muted-foreground">{exp.expense_date}</TableCell>
                    <TableCell className="text-muted-foreground">{PAYMENT_METHODS[exp.payment_method || ""] || "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(exp)}><Edit className="w-4 h-4 ml-2" />تعديل</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(exp.id)}><Trash2 className="w-4 h-4 ml-2" />حذف</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;

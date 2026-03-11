import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal, Trash2, Edit } from "lucide-react";
import ExportMenu from "@/components/ExportMenu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  notes: string | null;
}

const CustomersPage = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", tax_number: "", notes: "" });

  const fetchCustomers = async () => {
    const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    if (data) setCustomers(data);
    if (error) toast.error("خطأ في تحميل العملاء");
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const getCompanyId = async () => {
    const { data } = await supabase.rpc("get_user_company_id", { _user_id: user!.id });
    return data;
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("اسم العميل مطلوب"); return; }
    const companyId = await getCompanyId();
    if (!companyId) { toast.error("لا توجد شركة مرتبطة بحسابك"); return; }

    if (editingCustomer) {
      const { error } = await supabase.from("customers").update({
        name: form.name, email: form.email || null, phone: form.phone || null,
        address: form.address || null, tax_number: form.tax_number || null, notes: form.notes || null,
      }).eq("id", editingCustomer.id);
      if (error) { toast.error("خطأ في التعديل"); return; }
      toast.success("تم تعديل العميل");
    } else {
      const { error } = await supabase.from("customers").insert({
        company_id: companyId, name: form.name, email: form.email || null,
        phone: form.phone || null, address: form.address || null,
        tax_number: form.tax_number || null, notes: form.notes || null,
      });
      if (error) { toast.error("خطأ في الإضافة"); return; }
      toast.success("تم إضافة العميل");
    }
    setDialogOpen(false);
    resetForm();
    fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) { toast.error("خطأ في الحذف"); return; }
    toast.success("تم حذف العميل");
    fetchCustomers();
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setForm({ name: c.name, email: c.email || "", phone: c.phone || "", address: c.address || "", tax_number: c.tax_number || "", notes: c.notes || "" });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setForm({ name: "", email: "", phone: "", address: "", tax_number: "", notes: "" });
  };

  const filtered = customers.filter(c =>
    c.name.includes(search) || c.email?.includes(search) || c.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">العملاء</h1>
          <p className="text-sm text-muted-foreground">إدارة قاعدة بيانات العملاء</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground font-heading">
              <Plus className="w-4 h-4 ml-2" />
              إضافة عميل
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">{editingCustomer ? "تعديل العميل" : "إضافة عميل جديد"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Input placeholder="اسم العميل *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="font-body" />
              <Input placeholder="البريد الإلكتروني" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="font-body" />
              <Input placeholder="الهاتف" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="font-body" />
              <Input placeholder="العنوان" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="font-body" />
              <Input placeholder="الرقم الضريبي" value={form.tax_number} onChange={e => setForm({...form, tax_number: e.target.value})} className="font-body" />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground">{editingCustomer ? "حفظ التعديل" : "إضافة"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث عن عميل..." className="pr-10 font-body bg-muted border-0" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا يوجد عملاء بعد. أضف أول عميل!</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">العميل</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">البريد</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">الهاتف</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">العنوان</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-sm">
                          {c.name[0]}
                        </div>
                        <span className="font-medium text-sm text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{c.email || "—"}</td>
                    <td className="p-4 text-sm text-muted-foreground">{c.phone || "—"}</td>
                    <td className="p-4 text-sm text-muted-foreground">{c.address || "—"}</td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(c)}>
                            <Edit className="w-4 h-4 ml-2" /> تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(c.id)}>
                            <Trash2 className="w-4 h-4 ml-2" /> حذف
                          </DropdownMenuItem>
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

export default CustomersPage;

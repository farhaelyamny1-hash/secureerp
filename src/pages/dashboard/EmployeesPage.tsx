import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Employee {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  salary: number | null;
  hire_date: string | null;
  is_active: boolean | null;
}

interface EmployeeForm {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: string;
  hire_date: string;
  is_active: string;
}

const createDefaultForm = (): EmployeeForm => ({
  name: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  salary: "",
  hire_date: "",
  is_active: "true",
});

const EmployeesPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState("EGP");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeForm>(createDefaultForm());

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const company = await getCompanyProfile(user.id);
      if (!company) { toast.error("لا توجد شركة مرتبطة بحسابك"); return; }
      setCompanyId(company.id);
      setCurrencyCode(company.currency || "EGP");

      const { data, error } = await supabase
        .from("employees")
        .select("id, name, email, phone, position, department, salary, hire_date, is_active")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch { toast.error("تعذر تحميل الموظفين"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user?.id]);

  const openCreate = () => { setEditing(null); setForm(createDefaultForm()); setDialogOpen(true); };
  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({
      name: emp.name,
      email: emp.email || "",
      phone: emp.phone || "",
      position: emp.position || "",
      department: emp.department || "",
      salary: emp.salary != null ? String(emp.salary) : "",
      hire_date: emp.hire_date || "",
      is_active: emp.is_active !== false ? "true" : "false",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!companyId) return;
    if (!form.name.trim()) { toast.error("أدخل اسم الموظف"); return; }
    setSaving(true);
    const payload = {
      company_id: companyId,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      position: form.position || null,
      department: form.department || null,
      salary: form.salary ? Number(form.salary) : null,
      hire_date: form.hire_date || null,
      is_active: form.is_active === "true",
    };
    try {
      if (editing) {
        const { error } = await supabase.from("employees").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("تم تعديل بيانات الموظف");
      } else {
        const { error } = await supabase.from("employees").insert(payload);
        if (error) throw error;
        toast.success("تم إضافة الموظف");
      }
      setDialogOpen(false);
      fetchData();
    } catch { toast.error("حدث خطأ أثناء الحفظ"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) { toast.error("تعذر الحذف"); return; }
    toast.success("تم حذف الموظف");
    fetchData();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(e => e.name.toLowerCase().includes(q) || e.position?.toLowerCase().includes(q) || e.department?.toLowerCase().includes(q));
  }, [employees, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">الموظفين</h1>
          <p className="text-sm text-muted-foreground">إدارة الموظفين والصلاحيات</p>
        </div>
        <Button className="gradient-primary text-primary-foreground font-heading" onClick={openCreate}>
          <Plus className="w-4 h-4 ml-2" />إضافة موظف
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-heading">{editing ? "تعديل الموظف" : "إضافة موظف جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="الاسم *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="البريد الإلكتروني" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <Input placeholder="الهاتف" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="المنصب" value={form.position} onChange={e => setForm({...form, position: e.target.value})} />
              <Input placeholder="القسم" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="الراتب" type="number" min={0} value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} />
              <Input placeholder="تاريخ التعيين" type="date" value={form.hire_date} onChange={e => setForm({...form, hire_date: e.target.value})} />
            </div>
            <Select value={form.is_active} onValueChange={v => setForm({...form, is_active: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">نشط</SelectItem>
                <SelectItem value="false">غير نشط</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="p-8 text-center text-muted-foreground">لا يوجد موظفين</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">المنصب</TableHead>
                  <TableHead className="text-right">القسم</TableHead>
                  <TableHead className="text-right">الراتب</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((emp, i) => (
                  <motion.tr key={emp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b transition-colors hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{emp.name}</p>
                        {emp.email && <p className="text-xs text-muted-foreground">{emp.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{emp.position || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.department || "—"}</TableCell>
                    <TableCell className="text-foreground">{emp.salary != null ? formatCurrencyAmount(emp.salary, currencyCode) : "—"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.is_active !== false ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                        {emp.is_active !== false ? "نشط" : "غير نشط"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(emp)}><Edit className="w-4 h-4 ml-2" />تعديل</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(emp.id)}><Trash2 className="w-4 h-4 ml-2" />حذف</DropdownMenuItem>
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

export default EmployeesPage;

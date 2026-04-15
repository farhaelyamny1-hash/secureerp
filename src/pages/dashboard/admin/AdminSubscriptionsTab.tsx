import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CalendarPlus, RefreshCw } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Subscription {
  id: string;
  company_id: string;
  plan_id: string;
  status: string;
  billing_cycle: string;
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  company_name?: string;
  plan_name?: string;
}

interface Plan {
  id: string;
  name_ar: string;
  slug: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "نشط", variant: "default" },
  trial: { label: "تجريبي", variant: "secondary" },
  expired: { label: "منتهي", variant: "destructive" },
  suspended: { label: "معلّق", variant: "destructive" },
  cancelled: { label: "ملغي", variant: "outline" },
};

const AdminSubscriptionsTab = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [editPeriodEnd, setEditPeriodEnd] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [subsRes, plansRes, companiesRes] = await Promise.all([
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("plans").select("id, name_ar, slug"),
      supabase.from("companies").select("id, name"),
    ]);

    const companiesMap = new Map((companiesRes.data || []).map((c: any) => [c.id, c.name]));
    const plansMap = new Map((plansRes.data || []).map((p: any) => [p.id, p.name_ar]));

    const enriched = (subsRes.data || []).map((s: any) => ({
      ...s,
      company_name: companiesMap.get(s.company_id) || "غير معروف",
      plan_name: plansMap.get(s.plan_id) || "غير معروف",
    }));

    setSubscriptions(enriched);
    setPlans(plansRes.data || []);
    setLoading(false);
  };

  const openEdit = (sub: Subscription) => {
    setEditSub(sub);
    setEditStatus(sub.status);
    setEditPlan(sub.plan_id);
    setEditPeriodEnd(sub.current_period_end ? sub.current_period_end.split("T")[0] : "");
  };

  const saveEdit = async () => {
    if (!editSub) return;
    setSaving(true);
    const updates: { status: string; plan_id: string; current_period_end?: string } = {
      status: editStatus,
      plan_id: editPlan,
    };
    if (editPeriodEnd) {
      updates.current_period_end = new Date(editPeriodEnd).toISOString();
    }

    const { error } = await supabase
      .from("subscriptions")
      .update(updates)
      .eq("id", editSub.id);

    if (error) {
      toast.error("خطأ في تحديث الاشتراك");
    } else {
      toast.success("تم تحديث الاشتراك بنجاح ✅");
      setEditSub(null);
      fetchData();
    }
    setSaving(false);
  };

  const filtered = subscriptions.filter((s) =>
    (s.company_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث باسم الشركة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button size="sm" variant="outline" onClick={fetchData} className="gap-1.5">
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الشركة</TableHead>
              <TableHead className="text-right">الخطة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الدورة</TableHead>
              <TableHead className="text-right">انتهاء الفترة</TableHead>
              <TableHead className="text-right">إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  لا يوجد اشتراكات
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sub) => {
                const st = statusMap[sub.status] || { label: sub.status, variant: "outline" as const };
                return (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.company_name}</TableCell>
                    <TableCell>{sub.plan_name}</TableCell>
                    <TableCell>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {sub.billing_cycle === "monthly" ? "شهري" : "سنوي"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {sub.current_period_end
                        ? new Date(sub.current_period_end).toLocaleDateString("ar-EG")
                        : sub.trial_end
                        ? new Date(sub.trial_end).toLocaleDateString("ar-EG") + " (تجريبي)"
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openEdit(sub)} className="gap-1.5">
                        <CalendarPlus className="w-3.5 h-3.5" />
                        تعديل
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Subscription Dialog */}
      <Dialog open={!!editSub} onOpenChange={(open) => !open && setEditSub(null)}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل اشتراك: {editSub?.company_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="trial">تجريبي</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                  <SelectItem value="suspended">معلّق</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الخطة</Label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name_ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>تاريخ انتهاء الفترة</Label>
              <Input
                type="date"
                value={editPeriodEnd}
                onChange={(e) => setEditPeriodEnd(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSub(null)}>إلغاء</Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptionsTab;

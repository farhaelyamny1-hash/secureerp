import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, UserCheck, UserX, Shield, Users, KeyRound } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  is_approved: boolean;
  created_at: string;
  phone: string | null;
}

const AdminUsersPage = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "super_admin",
    });

    if (data) {
      setIsSuperAdmin(true);
      fetchProfiles();
    } else {
      setIsSuperAdmin(false);
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("خطأ في جلب البيانات");
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: !currentStatus })
      .eq("user_id", userId);

    if (error) {
      toast.error("خطأ في تحديث الحالة");
      return;
    }

    toast.success(currentStatus ? "تم إلغاء تفعيل الحساب" : "تم تفعيل الحساب بنجاح ✅");
    setProfiles((prev) =>
      prev.map((p) => (p.user_id === userId ? { ...p, is_approved: !currentStatus } : p))
    );
  };

  const filtered = profiles.filter((p) => {
    const name = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  if (!isSuperAdmin && !loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <Shield className="w-12 h-12 mx-auto text-destructive" />
          <h2 className="text-xl font-heading font-bold text-foreground">غير مصرح</h2>
          <p className="text-muted-foreground">ليس لديك صلاحية الوصول لهذه الصفحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground flex items-center gap-2">
            <Users className="w-6 h-6" />
            إدارة الأعضاء
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            تفعيل ورفض حسابات الأعضاء المسجلين
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {profiles.filter((p) => !p.is_approved).length} في انتظار التفعيل
        </Badge>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="بحث بالاسم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">تاريخ التسجيل</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  لا يوجد أعضاء
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    {profile.first_name || ""} {profile.last_name || ""}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(profile.created_at).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell>
                    {profile.is_approved ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">مفعّل</Badge>
                    ) : (
                      <Badge variant="destructive">غير مفعّل</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={profile.is_approved ? "outline" : "default"}
                      onClick={() => toggleApproval(profile.user_id, profile.is_approved)}
                      className="gap-1.5"
                    >
                      {profile.is_approved ? (
                        <>
                          <UserX className="w-3.5 h-3.5" />
                          إلغاء التفعيل
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          تفعيل
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsersPage;

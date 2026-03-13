import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Building2, Users, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminCompaniesTab from "./admin/AdminCompaniesTab";
import AdminSubscriptionsTab from "./admin/AdminSubscriptionsTab";
import AdminUsersOverviewTab from "./admin/AdminUsersOverviewTab";

const AdminDashboardPage = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "super_admin" });
      setIsSuperAdmin(!!data);
      setLoading(false);
    };
    check();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">جاري التحميل...</div>;
  }

  if (!isSuperAdmin) {
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
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6" />
          لوحة تحكم المسؤول
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          إدارة الشركات والاشتراكات والمستخدمين
        </p>
      </div>

      <Tabs defaultValue="companies" dir="rtl">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="companies" className="gap-1.5">
            <Building2 className="w-4 h-4" />
            الشركات
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-1.5">
            <CreditCard className="w-4 h-4" />
            الاشتراكات
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="w-4 h-4" />
            المستخدمين
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <AdminCompaniesTab />
        </TabsContent>
        <TabsContent value="subscriptions">
          <AdminSubscriptionsTab />
        </TabsContent>
        <TabsContent value="users">
          <AdminUsersOverviewTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;

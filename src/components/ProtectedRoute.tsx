import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SubscriptionExpiredPage from "@/pages/SubscriptionExpiredPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [subStatus, setSubStatus] = useState<"loading" | "active" | "trial_expired" | "expired" | "no_setup" | "ok">("loading");

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return;

      // Get company
      const { data: companyId } = await supabase.rpc("get_user_company_id", { _user_id: user.id });
      if (!companyId) {
        setSubStatus("ok");
        return;
      }

      // Check setup completed
      const { data: company } = await supabase
        .from("companies")
        .select("setup_completed")
        .eq("id", companyId)
        .maybeSingle();

      if (company && !company.setup_completed) {
        setSubStatus("no_setup");
        return;
      }

      // Check subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status, trial_end, current_period_end")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!sub) {
        setSubStatus("ok");
        return;
      }

      const now = new Date();

      if (sub.status === "trial") {
        if (sub.trial_end && new Date(sub.trial_end) < now) {
          setSubStatus("trial_expired");
          return;
        }
      } else if (sub.status === "expired" || sub.status === "suspended") {
        setSubStatus("expired");
        return;
      } else if (sub.status === "active") {
        if (sub.current_period_end && new Date(sub.current_period_end) < now) {
          setSubStatus("expired");
          return;
        }
      }

      setSubStatus("ok");
    };

    if (user) checkAccess();
  }, [user]);

  if (loading || (user && subStatus === "loading")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (subStatus === "no_setup") {
    return <Navigate to="/business-setup" replace />;
  }

  if (subStatus === "trial_expired") {
    return <SubscriptionExpiredPage type="trial" />;
  }

  if (subStatus === "expired") {
    return <SubscriptionExpiredPage type="expired" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

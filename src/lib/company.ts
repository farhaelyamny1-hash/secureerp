import { supabase } from "@/integrations/supabase/client";

export interface CompanyProfile {
  id: string;
  name: string;
  currency: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  tax_number: string | null;
}

export const getUserCompanyId = async (userId: string) => {
  const { data, error } = await supabase.rpc("get_user_company_id", { _user_id: userId });
  if (error) throw error;
  return data as string | null;
};

export const getCompanyProfile = async (userId: string): Promise<CompanyProfile | null> => {
  const companyId = await getUserCompanyId(userId);
  if (!companyId) return null;

  const { data, error } = await supabase
    .from("companies")
    .select("id, name, currency, phone, email, address, tax_number")
    .eq("id", companyId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

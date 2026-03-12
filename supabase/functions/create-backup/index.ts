import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get company ID
    const { data: companyId } = await supabase.rpc("get_user_company_id", {
      _user_id: user.id,
    });
    if (!companyId) {
      return new Response(JSON.stringify({ error: "No company found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create backup record
    const { data: backup, error: backupError } = await supabase
      .from("backups")
      .insert({
        company_id: companyId,
        created_by: user.id,
        status: "in_progress",
        backup_type: "manual",
      })
      .select()
      .single();

    if (backupError) throw backupError;

    // Export all company data
    const tables = [
      "products",
      "customers",
      "categories",
      "invoices",
      "invoice_items",
      "quotations",
      "quotation_items",
      "payments",
      "expenses",
      "employees",
    ];

    const backupData: Record<string, unknown[]> = {};
    const tablesIncluded: string[] = [];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("company_id", companyId);

      if (!error && data) {
        backupData[table] = data;
        tablesIncluded.push(table);
      }
    }

    // For invoice_items and quotation_items, fetch by related IDs
    if (backupData.invoices) {
      const invoiceIds = (backupData.invoices as any[]).map((i) => i.id);
      if (invoiceIds.length > 0) {
        const { data } = await supabase
          .from("invoice_items")
          .select("*")
          .in("invoice_id", invoiceIds);
        if (data) backupData.invoice_items = data;
      }
    }

    if (backupData.quotations) {
      const quotationIds = (backupData.quotations as any[]).map((q) => q.id);
      if (quotationIds.length > 0) {
        const { data } = await supabase
          .from("quotation_items")
          .select("*")
          .in("quotation_id", quotationIds);
        if (data) backupData.quotation_items = data;
      }
    }

    const backupJson = JSON.stringify(
      {
        version: "1.0",
        system: "SecureERP",
        company_id: companyId,
        created_at: new Date().toISOString(),
        tables: tablesIncluded,
        data: backupData,
      },
      null,
      2
    );

    const fileSize = new TextEncoder().encode(backupJson).length;

    // Update backup record
    await supabase
      .from("backups")
      .update({
        status: "completed",
        file_size: fileSize,
        tables_included: tablesIncluded,
        completed_at: new Date().toISOString(),
      })
      .eq("id", backup.id);

    return new Response(
      JSON.stringify({
        success: true,
        backup_id: backup.id,
        file_size: fileSize,
        tables: tablesIncluded,
        data: backupJson,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Backup error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Backup failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

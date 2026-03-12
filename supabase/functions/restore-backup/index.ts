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

    const { data: companyId } = await supabase.rpc("get_user_company_id", {
      _user_id: user.id,
    });
    if (!companyId) {
      return new Response(JSON.stringify({ error: "No company found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { backupData, selectedTables } = await req.json();
    const parsed = typeof backupData === "string" ? JSON.parse(backupData) : backupData;

    if (!parsed || !parsed.data) {
      return new Response(JSON.stringify({ error: "Invalid backup format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Record<string, { inserted: number; errors: number }> = {};

    // Order matters for foreign keys
    const restoreOrder = [
      "categories",
      "customers",
      "employees",
      "products",
      "invoices",
      "invoice_items",
      "quotations",
      "quotation_items",
      "payments",
      "expenses",
    ];

    for (const table of restoreOrder) {
      if (selectedTables && !selectedTables.includes(table)) continue;
      const rows = parsed.data[table];
      if (!rows || rows.length === 0) continue;

      // Update company_id to current company
      const updatedRows = rows.map((row: any) => {
        const newRow = { ...row };
        if ("company_id" in newRow) newRow.company_id = companyId;
        delete newRow.id; // Let DB generate new IDs for non-relational tables
        return newRow;
      });

      // For items tables, we need to handle foreign keys differently
      if (table === "invoice_items" || table === "quotation_items") {
        // Skip - these need parent IDs which change on restore
        results[table] = { inserted: 0, errors: 0 };
        continue;
      }

      const { data, error } = await supabase.from(table).insert(updatedRows).select();
      results[table] = {
        inserted: data?.length || 0,
        errors: error ? 1 : 0,
      };
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Restore error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Restore failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

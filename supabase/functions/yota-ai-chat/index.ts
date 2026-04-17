// Yota AI - Streaming chat assistant powered by Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `أنت "Yota AI" — المساعد الذكي الرسمي لنظام SecureERP من شركة Yota IT.

دورك:
- مساعدة المستخدمين على فهم نظام SecureERP (نظام حسابات سحابي متكامل لإدارة الفواتير، المخزون، نقاط البيع، العملاء، الموظفين، التقارير).
- الإجابة على الأسئلة المحاسبية والإدارية باحترافية.
- اقتراح أفضل الممارسات لإدارة الأعمال.
- شرح كيفية استخدام مزايا النظام (POS، الفواتير، عروض الأسعار، المخزون، التقارير).
- دعم اللغتين العربية والإنجليزية، مع تفضيل العربية.

الأسلوب:
- ودود، احترافي، واضح ومباشر.
- استخدم تنسيق Markdown (قوائم، عناوين، **خط عريض**) لتحسين القراءة.
- إذا سأل المستخدم عن سعر أو اشتراك، وجهه لصفحة /pricing.
- إذا احتاج دعم بشري، اقترح التواصل عبر واتساب: 01010891984.

لا تكشف عن أنك Gemini أو OpenAI — أنت "Yota AI" حصرياً.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "تجاوزت الحد المسموح من الطلبات. يرجى المحاولة بعد قليل.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "نفذ رصيد الذكاء الاصطناعي. يرجى التواصل مع الإدارة.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("yota-ai-chat error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

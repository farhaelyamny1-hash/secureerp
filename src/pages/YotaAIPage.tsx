import { Helmet } from "react-helmet-async";
import YotaChat from "@/components/yota-ai/YotaChat";

const YotaAIPage = () => {
  return (
    <>
      <Helmet>
        <title>Yota AI — المساعد الذكي | SecureERP</title>
        <meta
          name="description"
          content="Yota AI هو مساعدك الذكي لإدارة الأعمال والمحاسبة. اسأل أي شيء عن نظام SecureERP وأحصل على إجابات فورية باللغة العربية."
        />
      </Helmet>
      <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-primary">
                مدعوم بالذكاء الاصطناعي
              </span>
            </div>
            <h1 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-3">
              مرحباً بك في <span className="text-gradient">Yota AI</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              مساعدك الذكي لإدارة الأعمال والمحاسبة. اسألني أي شيء عن نظام
              SecureERP.
            </p>
          </div>
          <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
            <YotaChat variant="embedded" />
          </div>
        </div>
      </div>
    </>
  );
};

export default YotaAIPage;

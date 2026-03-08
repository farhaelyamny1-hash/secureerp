import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { Outlet } from "react-router-dom";

const MarketingLayout = () => {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main>
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
};

export default MarketingLayout;

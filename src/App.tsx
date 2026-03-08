import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MarketingLayout from "./layouts/MarketingLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import HomePage from "./pages/HomePage";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import CustomersPage from "./pages/dashboard/CustomersPage";
import ProductsPage from "./pages/dashboard/ProductsPage";
import InvoicesPage from "./pages/dashboard/InvoicesPage";
import PlaceholderPage from "./pages/dashboard/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Marketing pages */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Auth pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ERP Dashboard - Protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="inventory" element={<PlaceholderPage title="المخزون" description="إدارة المخزون والتتبع" />} />
              <Route path="quotations" element={<PlaceholderPage title="عروض الأسعار" description="إنشاء وإدارة عروض الأسعار" />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="payments" element={<PlaceholderPage title="المدفوعات" description="تسجيل ومتابعة المدفوعات" />} />
              <Route path="expenses" element={<PlaceholderPage title="المصروفات" description="تتبع وتصنيف المصروفات" />} />
              <Route path="reports" element={<PlaceholderPage title="التقارير" description="تقارير المبيعات والأرباح والمصروفات" />} />
              <Route path="employees" element={<PlaceholderPage title="الموظفين" description="إدارة الموظفين والصلاحيات" />} />
              <Route path="settings" element={<PlaceholderPage title="الإعدادات" description="إعدادات النظام والحساب" />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

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
import ExpensesPage from "./pages/dashboard/ExpensesPage";
import EmployeesPage from "./pages/dashboard/EmployeesPage";
import InventoryPage from "./pages/dashboard/InventoryPage";
import QuotationsPage from "./pages/dashboard/QuotationsPage";
import PaymentsPage from "./pages/dashboard/PaymentsPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import AdminUsersPage from "./pages/dashboard/AdminUsersPage";
import POSPage from "./pages/dashboard/POSPage";
import BusinessSetupPage from "./pages/dashboard/BusinessSetupPage";
import CheckoutPage from "./pages/CheckoutPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
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
            <Route path="/pending-approval" element={<PendingApprovalPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* ERP Dashboard - Protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="quotations" element={<QuotationsPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
              <Route path="pos" element={<POSPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

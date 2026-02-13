import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import PatchNotesPage from "./pages/PatchNotesPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ClientsList from "./pages/dashboard/ClientsList";
import ClientDetail from "./pages/dashboard/ClientDetail";
import PlansPage from "./pages/dashboard/PlansPage";
import ProtocolEditorPage from "./pages/dashboard/ProtocolEditorPage";
import MealPlanEditorPage from "./pages/dashboard/MealPlanEditorPage";
import AgendaPage from "./pages/dashboard/AgendaPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import MessagesPage from "./pages/dashboard/MessagesPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import BillingPage from "./pages/dashboard/BillingPage";
import BlockedPage from "./pages/dashboard/BlockedPage";
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import InviteOnboarding from "./pages/auth/InviteOnboarding";
import OnboardingPage from "./pages/auth/OnboardingPage";
import DownloadAppPage from "./pages/client/DownloadAppPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import CheckoutPage from "./pages/auth/CheckoutPage";
import MarketingAssetsPage from "./pages/dashboard/MarketingAssetsPage";
import PublicProfilePage from "./pages/public/PublicProfilePage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Admin / Backoffice
import AdminLayout from "./components/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import TenantsListAdmin from "./pages/admin/TenantsList";
import UsersListAdmin from "./pages/admin/UsersList";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminMetrics from "./pages/admin/AdminMetrics";

export const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TenantProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<Index />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/changelog" element={<PatchNotesPage />} />

              {/* Client Redirect Route - Pointing to Native App Download */}
              <Route path="/app" element={
                <ProtectedRoute allowedRoles={['client', 'coach']}>
                  <DownloadAppPage />
                </ProtectedRoute>
              } />

              {/* Onboarding Route - Protected for Coaches */}
              <Route path="/onboarding" element={
                <ProtectedRoute allowedRoles={['coach']}>
                  <OnboardingPage />
                </ProtectedRoute>
              } />

              {/* Dashboard Routes - Protected for Coaches */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['coach']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardHome />} />
                <Route path="clients" element={<ClientsList />} />
                <Route path="clients/:id" element={<ClientDetail />} />
                <Route path="plans" element={<PlansPage />} />
                <Route path="plans/:id" element={<ProtocolEditorPage />} />
                <Route path="meal-plans/:id" element={<MealPlanEditorPage />} />
                <Route path="agenda" element={<AgendaPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="marketing" element={<MarketingAssetsPage />} />
              </Route>

              {/* Public Personal Landing Pages */}
              <Route path="/:slug" element={<PublicProfilePage />} />

              {/* Auth / Invitation Routes */}
              <Route path="/invite/:token" element={<InviteOnboarding />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />

              {/* Backoffice (HQ) Routes - Protected for Admins */}
              <Route path="/hq" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminHome />} />
                <Route path="tenants" element={<TenantsListAdmin />} />
                <Route path="users" element={<UsersListAdmin />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="metrics" element={<AdminMetrics />} />
                {/* Fallback internal HQ route to Home */}
                <Route path="*" element={<Navigate to="/hq" replace />} />
              </Route>

              {/* Blocked Access */}
              <Route path="/blocked" element={
                <ProtectedRoute allowedRoles={['coach']}>
                  <BlockedPage />
                </ProtectedRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TenantProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

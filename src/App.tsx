import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { TranslationsProvider } from "@/hooks/useTranslations";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NewComplaint from "./pages/NewComplaint";
import ComplaintDetails from "./pages/ComplaintDetails";
import SchedulePickup from "./pages/SchedulePickup";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrderCourier from "./pages/OrderCourier";
import UserManagement from "./pages/admin/UserManagement";
import ComplaintSettings from "./pages/admin/ComplaintSettings";
import WarrantyRepairs from "./pages/admin/WarrantyRepairs";
import AcceptDevice from "./pages/admin/AcceptDevice";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TranslationsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/new-complaint" element={<NewComplaint />} />
              <Route path="/complaint/:id" element={<ComplaintDetails />} />
              <Route path="/schedule-pickup" element={<SchedulePickup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/order-courier" element={<OrderCourier />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/assignments" element={<AdminDashboard />} />
              <Route path="/admin/warranty-repairs" element={<WarrantyRepairs />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/settings" element={<ComplaintSettings />} />
              <Route path="/admin/accept-device" element={<AcceptDevice />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TranslationsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

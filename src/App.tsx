import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { AdminGuard, AuthGuard } from "@/components/AuthGuard";

import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import MealSelection from "@/pages/MealSelection";
import AIPredictions from "@/pages/AIPredictions";
import AdminPanel from "@/pages/AdminPanel";
import FeedbackPage from "@/pages/FeedbackPage";
import WasteDashboard from "@/pages/WasteDashboard";
import RevenuePage from "@/pages/RevenuePage";
import ProfilePage from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>

          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          <Route
            path="/login"
            element={
              <AuthGuard requireAuth={false} redirectTo="/dashboard">
                <LoginPage />
              </AuthGuard>
            }
          />

          <Route
            element={
              <AuthGuard>
                <AppLayout />
              </AuthGuard>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/meals" element={<MealSelection />} />
            <Route path="/predictions" element={<AIPredictions />} />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminPanel />
                </AdminGuard>
              }
            />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/waste" element={<WasteDashboard />} />
            <Route path="/revenue" element={<RevenuePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import MealSelection from "@/pages/MealSelection";
import AIPredictions from "@/pages/AIPredictions";
import AdminPanel from "@/pages/AdminPanel";
import FeedbackPage from "@/pages/FeedbackPage";
import WasteDashboard from "@/pages/WasteDashboard";
import RevenuePage from "@/pages/RevenuePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = localStorage.getItem("messiq-auth");
  if (!auth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/meals" element={<MealSelection />} />
            <Route path="/predictions" element={<AIPredictions />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/waste" element={<WasteDashboard />} />
            <Route path="/revenue" element={<RevenuePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

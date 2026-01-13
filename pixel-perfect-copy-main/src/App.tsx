
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AnimatePresence, motion } from "framer-motion";

import Login from "./pages/Login";
import Consultores from "./pages/Consultores";
import Clientes from "./pages/Clientes";
import Comissoes from "./pages/Comissoes";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Leads from "./pages/Leads";
import TrafficAds from "./pages/TrafficAds";
import PendingApproval from "./pages/PendingApproval";
import SalesDashboard from "./pages/SalesDashboard";
import MarketingDashboard from "./pages/MarketingDashboard";
import Metas from "./pages/Metas";
import ConsolidatedDashboard from "./pages/ConsolidatedDashboard";

const queryClient = new QueryClient();

// Page Transition Wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/pending-approval" element={<PendingApproval />} />

        <Route path="/" element={
          <ProtectedRoute>
            <PageTransition>
              <ConsolidatedDashboard />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/consolidado" element={
          <ProtectedRoute>
            <PageTransition>
              <ConsolidatedDashboard />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/vendas" element={
          <ProtectedRoute>
            <PageTransition>
              <SalesDashboard />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/marketing" element={
          <ProtectedRoute>
            <PageTransition>
              <MarketingDashboard />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/consultores" element={
          <ProtectedRoute>
            <PageTransition>
              <Consultores />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/clientes" element={
          <ProtectedRoute>
            <PageTransition>
              <Clientes />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/leads" element={
          <ProtectedRoute>
            <PageTransition>
              <Leads />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/trafego" element={
          <ProtectedRoute>
            <PageTransition>
              <TrafficAds />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/comissoes" element={
          <ProtectedRoute>
            <PageTransition>
              <Comissoes />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/relatorios" element={
          <ProtectedRoute>
            <PageTransition>
              <Relatorios />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/configuracoes" element={
          <ProtectedRoute>
            <PageTransition>
              <Configuracoes />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/metas" element={
          <ProtectedRoute>
            <PageTransition>
              <Metas />
            </PageTransition>
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <FilterProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </FilterProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

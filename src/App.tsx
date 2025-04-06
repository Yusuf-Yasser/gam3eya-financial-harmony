
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Budgets from "@/pages/Budgets";
import Wallets from "@/pages/Wallets";
import Gam3eya from "@/pages/Gam3eya";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Reminders from "@/pages/Reminders";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { CategoryProvider } from './contexts/CategoryContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <LanguageProvider>
            <AuthProvider>
              <CategoryProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={
                      <Layout>
                        <Dashboard />
                      </Layout>
                    } />
                    <Route path="/transactions" element={
                      <Layout>
                        <Transactions />
                      </Layout>
                    } />
                    <Route path="/budgets" element={
                      <Layout>
                        <Budgets />
                      </Layout>
                    } />
                    <Route path="/wallets" element={
                      <Layout>
                        <Wallets />
                      </Layout>
                    } />
                    <Route path="/gam3eya" element={
                      <Layout>
                        <Gam3eya />
                      </Layout>
                    } />
                    <Route path="/reminders" element={
                      <Layout>
                        <Reminders />
                      </Layout>
                    } />
                    <Route path="/reports" element={
                      <Layout>
                        <Reports />
                      </Layout>
                    } />
                    <Route path="/settings" element={
                      <Layout>
                        <Settings />
                      </Layout>
                    } />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </CategoryProvider>
            </AuthProvider>
          </LanguageProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
            <Route path="/transactions" element={
              <Layout>
                <div className="min-h-[80vh] flex items-center justify-center">
                  <h1 className="text-2xl font-bold text-muted-foreground">Transactions Page (Coming Soon)</h1>
                </div>
              </Layout>
            } />
            <Route path="/budgets" element={
              <Layout>
                <div className="min-h-[80vh] flex items-center justify-center">
                  <h1 className="text-2xl font-bold text-muted-foreground">Budgets Page (Coming Soon)</h1>
                </div>
              </Layout>
            } />
            <Route path="/wallets" element={
              <Layout>
                <div className="min-h-[80vh] flex items-center justify-center">
                  <h1 className="text-2xl font-bold text-muted-foreground">Wallets Page (Coming Soon)</h1>
                </div>
              </Layout>
            } />
            <Route path="/gam3eya" element={
              <Layout>
                <div className="min-h-[80vh] flex items-center justify-center">
                  <h1 className="text-2xl font-bold text-muted-foreground">Gam3eya Page (Coming Soon)</h1>
                </div>
              </Layout>
            } />
            <Route path="/reports" element={
              <Layout>
                <div className="min-h-[80vh] flex items-center justify-center">
                  <h1 className="text-2xl font-bold text-muted-foreground">Reports Page (Coming Soon)</h1>
                </div>
              </Layout>
            } />
            <Route path="/settings" element={
              <Layout>
                <div className="min-h-[80vh] flex items-center justify-center">
                  <h1 className="text-2xl font-bold text-muted-foreground">Settings Page (Coming Soon)</h1>
                </div>
              </Layout>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

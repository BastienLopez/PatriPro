import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { DataProvider } from "@/contexts/DataContext";
import Index from "./pages/Index";
import Portfolios from "./pages/Portfolios";
import Accounts from "./pages/Accounts";
import Savings from "./pages/Savings";
import Budget from "./pages/Budget";
import Cashflow from "./pages/Cashflow";
import Loans from "./pages/Loans";
import Calendar from "./pages/Calendar";
import Watchlist from "./pages/Watchlist";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import Business from "./pages/Business";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Handle SPA redirect from 404.html for GitHub Pages
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
      sessionStorage.removeItem('redirect');
      const path = new URL(redirect).pathname;
      if (path !== window.location.pathname) {
        window.history.replaceState(null, '', path);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/portfolios" element={<Portfolios />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/savings" element={<Savings />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/cashflow" element={<Cashflow />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/business" element={<Business />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </QueryClientProvider>
  );
};

export default App;

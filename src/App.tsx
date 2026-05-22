import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Counselors from "./pages/Counselors";
import Resources from "./pages/Resources";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Settings from "./pages/dashboard/Settings";
import AIChat from "./pages/dashboard/AIChat";
import Forum from "./pages/dashboard/Forum";
import Messages from "./pages/dashboard/Messages";
import MoodJournal from "./pages/dashboard/MoodJournal";
import Notifications from "./pages/dashboard/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/ai-chat" element={<AIChat />} />
            <Route path="/dashboard/forum" element={<Forum />} />
            <Route path="/dashboard/messages" element={<Messages />} />
            <Route path="/dashboard/mood" element={<MoodJournal />} />
            <Route path="/dashboard/notifications" element={<Notifications />} />
            <Route path="/dashboard/resources" element={<Resources />} />
            <Route path="/dashboard/counselors" element={<Counselors />} />
            <Route path="/counselors" element={<Counselors />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
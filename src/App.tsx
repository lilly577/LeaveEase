import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StaffDashboard from "./pages/staff/Dashboard";
import LeaveRequest from "./pages/staff/LeaveRequest";
import MyRequests from "./pages/staff/MyRequests";
import Schedule from "./pages/staff/Schedule";
import Announcements from "./pages/staff/Announcements";
import Feedback from "./pages/staff/Feedback";
import HRDashboard from "./pages/hr/Dashboard";
import HRRequests from "./pages/hr/Requests";
import StaffManagement from "./pages/hr/StaffManagement";
import HRSchedule from "./pages/hr/Schedule";
import HRAnnouncements from "./pages/hr/Announcements";
import HRFeedback from "./pages/hr/Feedback";
import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import SuperAdminUserAdministration from "./pages/super-admin/UserAdministration";
import SuperAdminSystemControl from "./pages/super-admin/SystemControl";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Staff routes */}
            <Route path="/dashboard" element={<StaffDashboard />} />
            <Route path="/leave/request" element={<LeaveRequest />} />
            <Route path="/leave/my-requests" element={<MyRequests />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/feedback" element={<Feedback />} />
            
            {/* HR routes */}
            <Route path="/hr/dashboard" element={<HRDashboard />} />
            <Route path="/hr/requests" element={<HRRequests />} />
            <Route path="/hr/staff" element={<StaffManagement />} />
            <Route path="/hr/schedule" element={<HRSchedule />} />
            <Route path="/hr/announcements" element={<HRAnnouncements />} />
            <Route path="/hr/feedback" element={<HRFeedback />} />

            {/* Super Admin routes */}
            <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/users" element={<SuperAdminUserAdministration />} />
            <Route path="/super-admin/system-control" element={<SuperAdminSystemControl />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

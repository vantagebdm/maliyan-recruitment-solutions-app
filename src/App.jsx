import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Jobs from '@/pages/Jobs';
import Candidates from '@/pages/Candidates';
import Clients from '@/pages/Clients';
import Compliance from '@/pages/Compliance';
import Mobilisation from '@/pages/Mobilisation';
import Timesheets from '@/pages/Timesheets';
import PayrollPrep from '@/pages/PayrollPrep';
import BillingPrep from '@/pages/BillingPrep';
import JobOrders from '@/pages/JobOrders';
import Reports from '@/pages/Reports';
import AIAssistant from '@/pages/AIAssistant';
import Settings from '@/pages/Settings';
import Brainstorm from '@/pages/Brainstorm';
import MaliyanPortal from '@/pages/MaliyanPortal';
import BDMPortal from '@/pages/BDMPortal';
import CandidateCard from '@/pages/CandidateCard';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/candidates/:id" element={<CandidateCard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/job-orders" element={<JobOrders />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/mobilisation" element={<Mobilisation />} />
          <Route path="/timesheets" element={<Timesheets />} />
          <Route path="/payroll" element={<PayrollPrep />} />
          <Route path="/billing" element={<BillingPrep />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/brainstorm" element={<Brainstorm />} />
          <Route path="/clients/maliyan" element={<MaliyanPortal />} />
          <Route path="/bdm-portal" element={<BDMPortal />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
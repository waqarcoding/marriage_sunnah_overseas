// @ts-nocheck
import React, { useEffect } from 'react'; // ✅ Add React import
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './sockets/SocketContext.jsx';
import AppBar, { INDIVIDUAL_TABS, GUARDIAN_TABS } from './ui/app_bar.jsx';

import ExplorePage from './features/explore/pages/explore_page.jsx';
import Login from './features/auth/pages/login_page.jsx';
import ReferralPage from './features/setting/pages/reffer_page.jsx';
import Register from './features/auth/pages/register_page.jsx';
import Profile from './features/profile/othersprofile/others_profile_page.jsx';
import MyProfile from './features/profile/myprofile/pages/my_profile_page.jsx';
import Match from './features/explore/pages/explore_page.jsx';
import Interest from './features/interest/pages/interest_page.jsx';
import Chat from './features/chat/pages/chat_page.jsx';
import Landing from './features/landing/landing_page.jsx';
import HowItWorks from './features/landing/instruction_page.jsx';
import OtpPage from './features/auth/pages/otp_page.jsx';
import SubscriptionPage from './features/subscription/pages/subscriptions.jsx';
import CompleteProfile from './features/profile/completeprofile/complete_profile_page.jsx';
import VerificationPage from './features/profile/completeprofile/id_verification_page.jsx';
import ForgotPassword from './features/auth/pages/forget_page.jsx';
import GuardianDashboard from './features/guardian/pages/guardian_dashboard.jsx';
import ShowPinPage from './features/profile/myprofile/pages/link_guardian_page.jsx';
import LinkWithPin from './features/guardian/pages/link_ward_page.jsx';
import GuardianProfilePage from './features/guardian/pages/guardian_profile_page.jsx';
import SubscriptionSuccess from './features/subscription/components/subscription_success.jsx';

import './theme/index.css';
import SettingsPage from './features/setting/pages/settings_page.jsx';
import ChangePassword from './features/setting/components/change_page.jsx';
import SubscriptionDetailPage from './features/setting/pages/subscription_detail_page.jsx';
import AppToaster from './ui/toaster.jsx';
import Notifications from './features/notifications/notifications.jsx';
import ProfileDetailPage from './features/profile/othersprofile/others_profile_page.jsx';
import AuroraBackground from './ui/aurora_background.jsx';
import Api from './api/Api.js';
import AuthService from './features/auth/services/AuthService.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, gcTime: 1000 * 60 * 30, retry: 1 },
  },
});

function isAuthenticated() {
  return (
    localStorage.getItem('isLoggedIn') === 'true' &&
    localStorage.getItem('isOtpVerified') === 'true'
  );
}

const logout = () => {
  AuthService.logout();
};

// ── Error Boundary Component ──────────────────────────────────────────────────
function ErrorBoundaryFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
        <p className="mb-4">Please refresh the page or contact support if the problem persists.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

// ── Role Access Denied Component ──────────────────────────────────────────────
function RoleAccessDenied() {
  const navigate = useNavigate();
  const role = AuthService.getUserRole();

  const handleGoBack = () => {
    if (role === 'guardian') {
      navigate('/guardian', { replace: true });
    } else {
      navigate('/individual/explore', { replace: true });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen" style={{ background: "var(--secondary)" }}>
      <div className="text-center p-8 max-w-md">
        <div className="mb-6">
          <svg className="w-24 h-24 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--foreground)" }}>Access Denied</h1>
        <p className="mb-6 text-lg" style={{ color: "var(--muted-foreground)" }}>
          {role === 'guardian'
            ? "You're accessing this as a Guardian. This section is only available for Individual users."
            : "You're accessing this as an Individual. This section is only available for Guardians."
          }
        </p>
        <div className="space-y-3">
          <button onClick={handleGoBack}
            className="w-full px-6 py-3 rounded-lg font-semibold transition-all"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            Go to {role === 'guardian' ? 'Guardian' : 'Individual'} Dashboard
          </button>
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full px-6 py-3 rounded-lg font-semibold transition-all"
            style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Guards ────────────────────────────────────────────────────────────────────
function RootGuard() {
  if (!isAuthenticated()) return <Landing />;
  const role = AuthService.getUserRole();
  return role === 'guardian'
    ? <Navigate to="/guardian" replace />
    : <Navigate to="/individual/explore" replace />;
}

function ProtectedRoute({ children, requireRole = null }) {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    return <Navigate to="/login" replace />;
  }
  if (localStorage.getItem('isOtpVerified') !== 'true') {
    return <Navigate to="/otp" replace />;
  }
  if (requireRole) {
    const userRole = AuthService.getUserRole();
    if (userRole !== requireRole) {
      return <RoleAccessDenied />;
    }
  }
  return children;
}

function LoginWrapper() {
  const navigate = useNavigate();
  return <Login onLogin={() => navigate('/otp', { replace: true })} />; // ✅ Add replace: true
}

// ── Layouts ───────────────────────────────────────────────────────────────────
function IndividualLayout() {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true }); // ✅ Add replace: true
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col h-screen" style={{ background: "transparent" }}>
        <AppBar tabs={INDIVIDUAL_TABS} onLogout={handleLogout} onSidebarLogout={handleLogout} />
        <div className="flex flex-1 min-h-0 pb-16 md:pb-0">
          <div className="flex-1 flex flex-col overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}

function GuardianLayout() {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true }); // ✅ Add replace: true
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col h-screen" style={{ background: "transparent" }}>
        <AppBar tabs={GUARDIAN_TABS} onLogout={handleLogout} onSidebarLogout={handleLogout} />
        <div className="flex flex-1 min-h-0 pb-16 md:pb-0">
          <div className="flex-1 flex flex-col overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootGuard />,
    errorElement: <ErrorBoundaryFallback />
  },
  { path: '/login', element: <LoginWrapper /> },
  { path: '/register', element: <Register onRegister={() => { }} /> },
  { path: '/otp', element: <OtpPage onSuccess={() => { }} /> },
  { path: '/how', element: <HowItWorks /> },
  { path: '/forget-password', element: <ForgotPassword /> },
  { path: '/change-password', element: <ChangePassword /> },

  { path: '/subscription', element: <ProtectedRoute><SubscriptionPage /></ProtectedRoute> },
  { path: '/subscription/success', element: <ProtectedRoute><SubscriptionSuccess /></ProtectedRoute> },

  { path: '/profilesetup', element: <ProtectedRoute><CompleteProfile /></ProtectedRoute> },
  { path: '/verification', element: <ProtectedRoute><VerificationPage onSubmit={() => { }} onSkip={() => { }} /></ProtectedRoute> },

  {
    path: '/guardian',
    element: <ProtectedRoute requireRole="guardian"><GuardianLayout /></ProtectedRoute>,
    errorElement: <ErrorBoundaryFallback />,
    children: [
      { index: true, element: <GuardianDashboard /> },
      { path: 'add-ward', element: <LinkWithPin /> },
      { path: 'myprofile', element: <MyProfile onLogout={() => { logout(); }} /> },
      { path: 'chats', element: <Chat /> },
      { path: 'chat/:receiverId', element: <Chat /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'referral', element: <ReferralPage /> },
      { path: 'subscription-detail', element: <SubscriptionDetailPage /> },
      { path: 'profile', element: <ProfileDetailPage /> },
    ],
  },

  {
    path: '/individual',
    element: <ProtectedRoute requireRole="individual"><IndividualLayout /></ProtectedRoute>,
    errorElement: <ErrorBoundaryFallback />,
    children: [
      { index: true, element: <Navigate to="/individual/explore" replace /> },
      { path: 'explore', element: <ExplorePage onProfileClick={() => { }} /> },
      { path: 'match', element: <Match onProfileClick={() => { }} /> },
      { path: 'interest', element: <Interest /> },
      { path: 'chats', element: <Chat /> },
      { path: 'chat/:receiverId', element: <Chat /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'profile', element: <ProfileDetailPage /> },
      { path: 'myprofile', element: <MyProfile onLogout={() => { logout(); }} /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'referral', element: <ReferralPage /> },
      { path: 'show-pin', element: <ShowPinPage /> },
      { path: 'subscription-detail', element: <SubscriptionDetailPage /> },
    ],
  },
]);

// ── Root app ──────────────────────────────────────────────────────────────────
function AppRoot() {

  const user = AuthService.getTokenData();
  const userId = user?.id ?? null;

  return (
    <SocketProvider userId={userId}>
      <AppToaster />
      <RouterProvider router={router} />
    </SocketProvider>
  );
}

// ✅ Removed React.StrictMode to prevent double-rendering issues
createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <AppRoot />
  </QueryClientProvider>
); 
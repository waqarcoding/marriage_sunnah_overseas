// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './sockets/SocketContext.jsx';
import AppBar, { INDIVIDUAL_TABS, GUARDIAN_TABS } from './ui/app_bar.jsx';

// ✅ Import all components directly (no lazy loading - preloads everything)
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
import AdminDashboard from './features/admin/pages/admin_dashboard_page.jsx';
import UsersPage from './features/admin/pages/users_page.jsx';
import VerificationQueue from './features/admin/pages/verification_queue.jsx';
import SubscriptionsPage from './features/admin/pages/subscriptions_page.jsx';
import TransactionsPage from './features/admin/pages/transactions_page.jsx';
import MessagesPage from './features/admin/pages/messages_page.jsx';
import AdminSettingsPage from './features/admin/pages/admin_settings_page.jsx';

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
import settings from './context/settings.jsx';
import {
  LayoutDashboard, Users, CheckCircle, Crown,
  DollarSign, MessageCircle, Settings, LogOut, Shield,
  Menu, X
} from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function isAuthenticated() {
  try {
    return (
      localStorage.getItem('isLoggedIn') === 'true' &&
      localStorage.getItem('isOtpVerified') === 'true'
    );
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

function isAdminAuthenticated() {
  try {
    const data = AuthService.getTokenData();
    return data !== null && (data.role === 'admin' || data.role === 'staff');
  } catch (error) {
    console.error('Admin auth check error:', error);
    return false;
  }
}

const logout = () => {
  AuthService.logout();
};

// ============================================
// PORTAL CLEANUP ON ROUTE CHANGE
// ============================================

function PortalCleanup() {
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach(child => {
          if (
            child.id !== 'root' &&
            child.tagName !== 'SCRIPT' &&
            child.tagName !== 'STYLE' &&
            !child.classList.contains('Toaster')
          ) {
            try {
              if (child.parentNode === document.body) {
                document.body.removeChild(child);
              }
            } catch (e) {
              // Ignore
            }
          }
        });
      } catch (error) {
        console.error('Portal cleanup error:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
}

// ============================================
// ERROR BOUNDARY
// ============================================

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

// ============================================
// ROLE ACCESS DENIED
// ============================================

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

// ============================================
// GUARDS - FIXED VERSION
// ============================================

function RootGuard() {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Landing />;
  }

  let role = null;
  try {
    role = AuthService.getUserRole();
  } catch (error) {
    console.error('Error getting user role:', error);
    try {
      localStorage.clear();
    } catch (e) {
      // Ignore
    }
    return <Landing />;
  }

  if (role === 'admin' || role === 'staff') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (role === 'guardian') {
    return <Navigate to="/guardian" replace />;
  }
  return <Navigate to="/individual/explore" replace />;
}

function ProtectedRoute({ children, requireRole = null }) {
  let isLoggedIn = false;
  let isOtpVerified = false;
  let userRole = null;

  try {
    isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    isOtpVerified = localStorage.getItem('isOtpVerified') === 'true';

    if (requireRole) {
      userRole = AuthService.getUserRole();
    }
  } catch (error) {
    console.error('ProtectedRoute check error:', error);
    return <Navigate to="/login" replace />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isOtpVerified) {
    return <Navigate to="/otp" replace />;
  }

  if (requireRole && userRole !== requireRole) {
    return <RoleAccessDenied />;
  }

  return children;
}

function AdminProtectedRoute({ children }) {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function LoginWrapper() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    try {
      const authData = JSON.parse(localStorage.getItem("authData") || '{}');
      const role = authData?.user?.role;

      if (role === 'individual') {
        navigate('/individual/explore', { replace: true });
      } else if (role === 'guardian') {
        navigate('/guardian', { replace: true });
      } else if (role === 'admin' || role === 'staff') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      navigate('/', { replace: true });
    }
  };

  return <Login onLogin={handleLoginSuccess} />;
}

// ============================================
// CONDITIONAL CONTENT - Keeps components mounted
// ============================================

function ConditionalContent({ path, children }) {
  const location = useLocation();
  const isActive = location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div style={{ display: isActive ? 'flex' : 'none', flexDirection: 'column', flex: 1, overflow: 'auto' }}>
      {children}
    </div>
  );
}

// ============================================
// LAYOUTS - FIXED VERSION
// ============================================

function IndividualLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col h-screen" style={{ background: "transparent" }}>
        <AppBar tabs={INDIVIDUAL_TABS} onLogout={handleLogout} onSidebarLogout={handleLogout} />
        <div className="flex flex-1 min-h-0 pb-16 md:pb-0">
          <ConditionalContent path="/individual/explore">
            <ExplorePage onProfileClick={() => { }} />
          </ConditionalContent>
          <ConditionalContent path="/individual/match">
            <Match onProfileClick={() => { }} />
          </ConditionalContent>
          <ConditionalContent path="/individual/interest">
            <Interest />
          </ConditionalContent>
          <ConditionalContent path="/individual/chats">
            <Chat />
          </ConditionalContent>
          <ConditionalContent path="/individual/chat">
            <Chat />
          </ConditionalContent>
          <ConditionalContent path="/individual/notifications">
            <Notifications />
          </ConditionalContent>
          <ConditionalContent path="/individual/profile">
            <ProfileDetailPage />
          </ConditionalContent>
          <ConditionalContent path="/individual/myprofile">
            <MyProfile onLogout={handleLogout} />
          </ConditionalContent>
          <ConditionalContent path="/individual/settings">
            <SettingsPage />
          </ConditionalContent>
          <ConditionalContent path="/individual/referral">
            <ReferralPage />
          </ConditionalContent>
          <ConditionalContent path="/individual/show-pin">
            <ShowPinPage />
          </ConditionalContent>
          <ConditionalContent path="/individual/subscription-detail">
            <SubscriptionDetailPage />
          </ConditionalContent>
          <ConditionalContent path="/individual/subscription">
            <SubscriptionPage />
          </ConditionalContent>
          <ConditionalContent path="/individual/verification">
            <VerificationPage onSubmit={() => { }} onSkip={() => { }} />
          </ConditionalContent>
        </div>
      </div>
    </AuroraBackground>
  );
}

function GuardianLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col h-screen" style={{ background: "transparent" }}>
        <AppBar tabs={GUARDIAN_TABS} onLogout={handleLogout} onSidebarLogout={handleLogout} />
        <div className="flex flex-1 min-h-0 pb-16 md:pb-0">
          {location.pathname === '/guardian' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}>
              <GuardianDashboard />
            </div>
          )}

          <ConditionalContent path="/guardian/add-ward">
            <LinkWithPin />
          </ConditionalContent>
          <ConditionalContent path="/guardian/guardianprofile">
            <GuardianProfilePage onLogout={handleLogout} />
          </ConditionalContent>
          <ConditionalContent path="/guardian/chats">
            <Chat />
          </ConditionalContent>
          <ConditionalContent path="/guardian/chat">
            <Chat />
          </ConditionalContent>
          <ConditionalContent path="/guardian/notifications">
            <Notifications />
          </ConditionalContent>
          <ConditionalContent path="/guardian/settings">
            <SettingsPage />
          </ConditionalContent>
          <ConditionalContent path="/guardian/referral">
            <ReferralPage />
          </ConditionalContent>
          <ConditionalContent path="/guardian/profile">
            <ProfileDetailPage />
          </ConditionalContent>
          <ConditionalContent path="/guardian/verification">
            <VerificationPage onSubmit={() => { }} onSkip={() => { }} />
          </ConditionalContent>
        </div>
      </div>
    </AuroraBackground>
  );
}

// ============================================
// ADMIN LAYOUT
// ============================================

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  let adminUser = {};
  try {
    adminUser = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    console.error('Error parsing admin user:', error);
  }

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: CheckCircle, label: 'Verifications', path: '/admin/verifications' },
    { icon: Crown, label: 'Subscriptions', path: '/admin/subscriptions' },
    { icon: DollarSign, label: 'Transactions', path: '/admin/transactions' },
    { icon: MessageCircle, label: 'Messages', path: '/admin/messages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <PortalCleanup />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 lg:w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
        style={{ boxShadow: '2px 0 12px rgba(0, 0, 0, 0.03)' }}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <img
              src={adminUser.avatar_url || "/default-avatar.png"}
              alt="Admin Avatar"
              className="w-10 h-10 rounded-lg object-cover bg-gray-100"
              style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/default-avatar.png";
              }}
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {adminUser.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {adminUser.role || 'staff'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleMenuClick(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)"
                    : "transparent",
                  color: isActive ? "white" : "#4b5563",
                }}
              >
                <item.icon
                  size={20}
                  className={isActive ? "" : "group-hover:scale-110 transition-transform"}
                />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white/30" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-600 hover:bg-red-50 border border-red-200"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
            >
              <Shield size={16} color="white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Admin Panel</span>
          </div>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// ============================================
// ROUTER
// ============================================

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
  {
    path: '/guardian/*',
    element: <ProtectedRoute requireRole="guardian"><GuardianLayout /></ProtectedRoute>,
    errorElement: <ErrorBoundaryFallback />,
  },
  {
    path: '/individual/*',
    element: <ProtectedRoute requireRole="individual"><IndividualLayout /></ProtectedRoute>,
    errorElement: <ErrorBoundaryFallback />,
  },
  {
    path: '/admin/login',
    element: <LoginWrapper />
  },
  {
    path: '/admin',
    element: <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>,
    errorElement: <ErrorBoundaryFallback />,
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'verifications', element: <VerificationQueue /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ]
  },
]);

// ============================================
// ROOT APP
// ============================================

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

// ============================================
// RENDER
// ============================================

settings.load().then(() => {
  createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
      <AppRoot />
    </QueryClientProvider>
  );
});
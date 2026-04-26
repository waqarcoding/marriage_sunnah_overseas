// @ts-nocheck
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './sockets/SocketContext.jsx';

// ── AppBar with exported tab constants ────────────────────────────────────────
import AppBar, { INDIVIDUAL_TABS, GUARDIAN_TABS } from './components/AppBar.jsx';

// ── Pages ─────────────────────────────────────────────────────────────────────
import ExplorePage from './features/explore/pages/ExplorePage.jsx';
import Login from './features/auth/pages/login_page.jsx';
import Register from './features/auth/pages/register_page.jsx';
import Profile from './features/profile/pages/ProfilePage.jsx';
import MyProfile from './features/profile/pages/MyProfilePage.jsx';
import Match from './features/explore/pages/ExplorePage.jsx';
import Interest from './features/interest/pages/interest_page.jsx';
import Chat from './features/chat/pages/ChatPage.jsx';
import Landing from './features/landing/landing_page.jsx';
import HowItWorks from './features/landing/howitwork.jsx';
import OtpPage from './features/auth/pages/otp_page.jsx';
import SubscriptionPage from './features/setting/subscriptions.jsx';
import CompleteProfile from './features/profile/pages/CompleteProfile.jsx';
import VerificationPage from './features/profile/pages/Verification.jsx';
import ForgotPassword from './features/auth/pages/forget_page.jsx';
import AddGuardian from './features/profile/pages/add_guardian.jsx';
import GuardianDashboard from './features/guardian/pages/guardian_dashboard.jsx';
import GuardianAddWard from './features/guardian/pages/guardian_add_ward.jsx';
import GuardianInterest from './features/guardian/pages/guardian_interest.jsx';
import GuardianProfilePage from './features/guardian/pages/guardian_profile.jsx';
import './theme/index.css';

// ── Query client ──────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, gcTime: 1000 * 60 * 30, retry: 1 },
  },
});

// ── Auth helpers ──────────────────────────────────────────────────────────────
function getTokenData() {
  try {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
}

function isAuthenticated() {
  return (
    localStorage.getItem('isLoggedIn') === 'true' &&
    localStorage.getItem('isOtpVerified') === 'true'
  );
}

function getUserRole() { return getTokenData()?.role ?? null; }

const logout = () =>
  ['isLoggedIn', 'isOtpVerified', 'jwtToken', 'userId'].forEach(k => localStorage.removeItem(k));

// ── Guards ────────────────────────────────────────────────────────────────────
function RootGuard() {
  if (!isAuthenticated()) return <Landing />;
  return getUserRole() === 'guardian'
    ? <Navigate to="/guardian" replace />
    : <Navigate to="/explore" replace />;
}

function ProtectedRoute({ children, requireRole = null }) {
  if (localStorage.getItem('isLoggedIn') !== 'true') return <Navigate to="/login" replace />;
  if (localStorage.getItem('isOtpVerified') !== 'true') return <Navigate to="/otp" replace />;
  if (requireRole && getUserRole() !== requireRole) return <Navigate to="/" replace />;
  return children;
}

function LoginWrapper() {
  const navigate = useNavigate();
  return <Login onLogin={() => navigate('/otp')} />;
}

// ── Individual layout ─────────────────────────────────────────────────────────
// AppBar handles mobile bottom nav via INDIVIDUAL_TABS
function IndividualLayout() {
  const navigate = useNavigate();
  const user = getTokenData();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <SocketProvider userId={user?.id}>
      <div className="flex flex-col h-screen" style={{ background: "var(--secondary)" }}>
        {/* ✅ Pass INDIVIDUAL_TABS — no GuardianBottomNav needed */}
        <AppBar tabs={INDIVIDUAL_TABS} onLogout={handleLogout} onSidebarLogout={handleLogout} />
        {/* pb-16 = space for mobile bottom nav (64px) */}
        <div className="flex flex-1 min-h-0 pb-16 md:pb-0">
          <div className="flex-1 flex flex-col overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </SocketProvider>
  );
}

// ── Guardian layout ───────────────────────────────────────────────────────────
// AppBar handles mobile bottom nav via GUARDIAN_TABS — NO separate GuardianBottomNav
function GuardianLayout() {
  const navigate = useNavigate();
  const user = getTokenData();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <SocketProvider userId={user?.id}>
      <div className="flex flex-col h-screen" style={{ background: "var(--secondary)" }}>
        {/* ✅ Pass GUARDIAN_TABS — AppBar bottom nav shows guardian links */}
        <AppBar tabs={GUARDIAN_TABS} onLogout={handleLogout} onSidebarLogout={handleLogout} />
        {/* pb-16 = space for mobile bottom nav */}
        <div className="flex flex-1 min-h-0 pb-16 md:pb-0">
          <div className="flex-1 flex flex-col overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </SocketProvider>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Public ───────────────────────────────────────────────────────────────
  { path: '/', element: <RootGuard /> },
  { path: '/login', element: <LoginWrapper /> },
  { path: '/register', element: <Register onRegister={() => { }} /> },
  { path: '/otp', element: <OtpPage onSuccess={() => { }} /> },
  { path: '/how', element: <HowItWorks /> },
  { path: '/forget-password', element: <ForgotPassword /> },
  { path: '/subscription', element: <SubscriptionPage /> },

  // ── Individual standalone (no layout) ────────────────────────────────────
  { path: '/profilesetup', element: <CompleteProfile /> },
  { path: '/add-guardian', element: <AddGuardian /> },
  { path: '/verification', element: <VerificationPage onSubmit={() => { }} onSkip={() => { }} /> },

  // ── Guardian protected ────────────────────────────────────────────────────
  {
    path: '/guardian',
    element: <ProtectedRoute  ><GuardianLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <GuardianDashboard /> },
      { path: 'add-ward', element: <GuardianAddWard /> },
      { path: 'interests', element: <GuardianInterest /> },
      { path: 'profile', element: <GuardianProfilePage onLogout={() => { logout(); }} /> },
    ],
  },

  // ── Individual protected ──────────────────────────────────────────────────
  {
    path: '/',
    element: <ProtectedRoute><IndividualLayout /></ProtectedRoute>,
    children: [
      { path: 'explore', element: <ExplorePage onProfileClick={() => { }} /> },
      { path: 'match', element: <Match onProfileClick={() => { }} /> },
      { path: 'interest', element: <Interest /> },
      { path: 'chats', element: <Chat /> },
      { path: 'chat/:receiverId', element: <Chat /> },
      { path: 'myprofile', element: <MyProfile /> },
      { path: 'profile', element: <Profile onLike={() => { }} onPass={() => { }} /> },
      { path: 'settings', element: <Profile onLike={() => { }} onPass={() => { }} /> },
    ],
  },
]);

// ── Render ────────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: { zIndex: 999999, fontFamily: "inherit", fontSize: 14 },
          success: { iconTheme: { primary: "#1B4D3E", secondary: "#fff" } },
          error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
        }}
        containerStyle={{ zIndex: 999999, top: 20 }}
      />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
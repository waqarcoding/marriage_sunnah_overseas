import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SocketProvider } from './sockets/SocketContext.jsx';

import ExplorePage from './features/explore/pages/ExplorePage.jsx';
import Login from './features/auth/pages/login_page.jsx';
import Register from './features/auth/pages/register_page.jsx';
import Settings from './features/setting/settings.jsx';
import Profile from './features/profile/pages/ProfilePage.jsx';
import MyProfile from './features/profile/pages/MyProfilePage.jsx';
import Match from './features/explore/pages/ExplorePage.jsx';
import Interest from './features/interest/pages/interest_page.jsx';
import Guardian from './features/guardian/pages/guardian_page.jsx';
import Chat from './features/chat/pages/ChatPage.jsx';
import Landing from './features/landing/landing_page.jsx';
import HowItWorks from './features/landing/howitwork.jsx';
import OtpPage from './features/auth/pages/otp_page.jsx';
import SubscriptionPage from './features/setting/subscriptions.jsx';
import CompleteProfile from './features/profile/pages/CompleteProfile.jsx';
import AppBar from './components/appbar.jsx';
import './theme/index.css';
import VerificationPage from './features/profile/pages/Verification.jsx';

// ⚡ Created once at module level — shared across all routes and components
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,      // images never go stale
      gcTime: 1000 * 60 * 30,  // keep in memory for 30 minutes
      retry: 1,
    },
  },
});

// ── Auth helpers ──────────────────────────────────────────────
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

function RootGuard() {
  if (isAuthenticated()) return <Navigate to="/explore" replace />;
  return <Landing />;
}

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const isOtpVerified = localStorage.getItem('isOtpVerified') === 'true';
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isOtpVerified) return <Navigate to="/otp" replace />;
  return children;
};

function LoginWrapper() {
  const navigate = useNavigate();
  return <Login onLogin={() => navigate('/otp')} />;
}

// ─────────────────────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  { path: '/', element: <RootGuard /> },
  { path: '/login', element: <LoginWrapper /> },
  { path: '/register', element: <Register onRegister={() => { }} /> },
  { path: '/otp', element: <OtpPage onSuccess={() => { }} /> },
  { path: '/how', element: <HowItWorks /> },
  { path: '/subscription', element: <SubscriptionPage /> },
  { path: '/profilesetup', element: <CompleteProfile /> },
  { path: '/verification', element: <VerificationPage onSubmit={() => { }} onSkip={() => { }} /> },

  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'explore', element: <ExplorePage onProfileClick={() => { }} /> },
      { path: 'match', element: <Match onProfileClick={() => { }} /> },
      { path: 'interest', element: <Interest /> },
      { path: 'chats', element: <Chat /> },
      { path: 'chat/:receiverId', element: <Chat /> },
      { path: 'guardian', element: <Guardian /> },
      { path: 'myprofile', element: <MyProfile /> },
      { path: 'profile', element: <Profile onLike={() => { }} onPass={() => { }} /> },
      { path: 'settings', element: <Profile onLike={() => { }} onPass={() => { }} /> },



    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* ⚡ Single QueryClientProvider wraps everything — one cache for the whole app */}
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);

// ─────────────────────────────────────────────────────────────
// LAYOUT
// ─────────────────────────────────────────────────────────────
export default function Layout() {
  const navigate = useNavigate();
  const user = getTokenData();
  const isGuardian = user?.role === 'guardian';

  const individualLinks = [
    { name: 'Explore', to: '/explore' },
    { name: 'Interest', to: '/interest' },
    { name: 'Chats', to: '/chats' },
    { name: 'Profile', to: '/myprofile' },
  ];

  const guardianLinks = [
    { name: 'Approvals', to: '/' },
    { name: 'Guardian', to: '/guardian' },
    { name: 'Profile', to: '/myprofile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isOtpVerified');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <SocketProvider userId={user?.id}>
      <div className="flex flex-col h-screen bg-primary/2">
        <AppBar
          // Removed 'links' prop as AppBar does not accept it
          onLogout={handleLogout}
          onSidebarLogout={handleLogout}
        />
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 flex flex-col overflow-auto">
            <Outlet />
          </div>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              zIndex: 999999,
            },
          }}
          containerStyle={{
            zIndex: 999999,
            top: 70,
          }}
        />
      </div>
    </SocketProvider>
  );
}
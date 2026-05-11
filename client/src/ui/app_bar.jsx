// @ts-nocheck
// components/AppBar.jsx

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, memo } from "react";

import { useSocket } from "../sockets/SocketContext";
import ChatService from '../features/chat/services/ChatService';
import InterestService from '../features/interest/services/InterestService';
import GuardianService from '../features/guardian/services/GuardianService';
import ProfileService from '../features/profile/services/ProfileService';
import { LogOut, Settings, CreditCard, Shield, ChevronDown } from "lucide-react";

import {
  HeartIcon as HeartOutline,
  UserIcon as UserOutline,
  ChatBubbleLeftEllipsisIcon as ChatOutline,
  MapIcon as MapOutline,
  HomeIcon as HomeOutline,
  Square3Stack3DIcon as WardOutline,
  XMarkIcon as CloseIcon,
  Bars3Icon as MenuIcon,
  BoltIcon as CreditIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolid,
  UserIcon as UserSolid,
  ChatBubbleLeftEllipsisIcon as ChatSolid,
  MapIcon as MapSolid,
  HomeIcon as HomeSolid,
  Square3Stack3DIcon as WardSolid,
  BoltIcon as BoltSolid,
} from "@heroicons/react/24/solid";
import ProfileDropdown from "./dropdown_menu";
import { motion } from "framer-motion";
import AuthService from "../features/auth/services/AuthService";

// ✅ Updated Tab Navigation
export const INDIVIDUAL_TABS = [
  { name: "Match", to: "/individual/explore", OutlineIcon: MapOutline, SolidIcon: MapSolid },
  { name: "Interest", to: "/individual/interest", OutlineIcon: HeartOutline, SolidIcon: HeartSolid },
  { name: "Guardian", to: "/individual/show-pin", OutlineIcon: Shield, SolidIcon: Shield },
  { name: "Chats", to: "/individual/chats", OutlineIcon: ChatOutline, SolidIcon: ChatSolid },
  { name: "Settings", to: "/individual/settings", OutlineIcon: UserOutline, SolidIcon: UserSolid },
];

export const GUARDIAN_TABS = [
  { name: "Dashboard", to: "/guardian", OutlineIcon: HomeOutline, SolidIcon: HomeSolid },
  //  { name: "Interest", to: "/guardian/interest", OutlineIcon: HeartOutline, SolidIcon: HeartSolid },
  { name: "My Ward", to: "/guardian/add-ward", OutlineIcon: WardOutline, SolidIcon: WardSolid },
  { name: "Chats", to: "/guardian/chats", OutlineIcon: ChatOutline, SolidIcon: ChatSolid },
  { name: "Settings", to: "/guardian/settings", OutlineIcon: UserOutline, SolidIcon: UserSolid },
];

async function getUserInfo() {
  const tokenData = AuthService.getTokenData();
  const user = await AuthService.getCurrentUser();
  const avatar_url = (user.profile && Array.isArray(user.profile.images) && user.profile.images.length > 0)
    ? user.profile.images[0]
    : (user.profile?.avatar_url || user.avatar_url || null);


  if (!tokenData) return { name: "User", avatar: null, role: null };
  return {
    name: tokenData.name || tokenData.userName || tokenData.user_name || "User",
    avatar: avatar_url || tokenData.avatar || tokenData.avatar_url || tokenData.profileImage || tokenData.profile_image || null,
    role: tokenData.role || null,
  };
}

function isActive(tab, pathname) {
  const exactPaths = ["/guardian", "/explore", "/myprofile", "/interest", "/chats"];
  if (exactPaths.includes(tab.to)) return pathname === tab.to;
  return pathname.startsWith(tab.to);
}

function NotifBadge({ count }) {
  if (!count || count <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1
                flex items-center justify-center bg-red-500 text-white text-[10px]
                font-bold rounded-full leading-none z-10 shadow">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function LoadingSpinner({ size = "w-4 h-4" }) {
  return (
    <svg className={`animate-spin ${size}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

function CreditsDisplay({ credits, onClick, loading }) {
  if (loading) {
    return (
      <button disabled className="flex items-center gap-2 px-3 py-1.5 rounded-lg opacity-70">
        <LoadingSpinner size="w-5 h-5" style={{ color: "var(--background)" }} />
      </button>
    );
  }
  if (credits === 0) {
    return (
      <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
        <BoltSolid className="w-4 h-4" style={{ color: "#FFD700" }} />
        <span className="text-xs font-semibold">Upgrade</span>
      </button>
    );
  }
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all hover:opacity-70">
      <BoltSolid className="w-5 h-5" style={{ color: "#FFD700" }} />
      <span className="text-base font-bold" style={{ color: "var(--background)" }}>{credits}</span>
    </button>
  );
}

function MobileCreditsDisplay({ credits, onClick, loading }) {
  if (loading) {
    return (
      <button disabled className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg opacity-70">
        <LoadingSpinner size="w-4 h-4" style={{ color: "var(--primary)" }} />
      </button>
    );
  }
  if (credits === 0) {
    return (
      <button onClick={onClick} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
        style={{ background: "var(--primary)", color: "var(--background)" }}>
        <BoltSolid className="w-3.5 h-3.5" style={{ color: "#FFD700" }} />
        <span className="text-xs font-semibold">Upgrade</span>
      </button>
    );
  }
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all hover:opacity-70">
      <BoltSolid className="w-4 h-4" style={{ color: "#FFD700" }} />
      <span className="text-sm font-bold" style={{ color: "var(--background)" }}>{credits}</span>
    </button>
  );
}

function AvatarOrInitial({ avatar, name, size = 8 }) {
  const sizeClasses = { 8: 'h-8 w-8', 10: 'h-10 w-10' };
  if (avatar) {
    return <img src={avatar} alt={name} className={`${sizeClasses[size]} rounded-full object-cover`} />;
  }
  return (
    <span className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-sm font-bold select-none`}
      style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
      {(name?.[0] || "U").toUpperCase()}
    </span>
  );
}

// ── Mobile Greeting Bar ───────────────────────────────────────────────────────
// Shown only on mobile, replaces the top header on small screens.
// Pass onMenuOpen to open the sidebar.
export function MobileGreetingBar({ name, avatar, notifCount = 0, onNotification, onMenuOpen }) {
  const firstName = name?.split(" ")[0] || "Friend";
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-3 md:hidden relative overflow-hidden"
      style={{
        borderBottom: "1px solid rgba(27,77,62,0.08)",
      }}>
      {/* Islamic Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0 L40 20 L20 40 L0 20 Z M20 10 L30 20 L20 30 L10 20 Z"
                fill="none" stroke="#1B4D3E" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
        </svg>
      </div>

      {/* Left: avatar + greeting */}
      <div className="flex items-center gap-3.5 relative z-10">
        {/* Avatar with Islamic ornament */}
        <button onClick={onMenuOpen} className="shrink-0 cursor-pointer border-none bg-transparent p-0 relative">
          {avatar ? (
            <div className="relative">
              {/* Decorative ring */}
              <div className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, #1B4D3E 0deg, transparent 90deg, transparent 270deg, #1B4D3E 360deg)",
                  opacity: 0.15,
                  transform: "scale(1.15)"
                }}></div>
              <img src={avatar} alt={name}
                className="w-12 h-12 rounded-full object-cover relative z-10"
                style={{ border: "2px solid rgba(27,77,62,0.15)" }} />
              {/* Small crescent accent */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center z-20"
                style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d8c6e 100%)", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#D4AF37">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.51 5.07-1.39-1.39.09-2.82-.09-4.19-.64-3.49-1.39-5.95-4.66-5.95-8.47 0-2.18.77-4.18 2.05-5.75C7.32 4.2 5.78 3.5 4.07 3.5c-.55 0-1 .45-1 1 0 2.21 1.79 4 4 4 .93 0 1.79-.32 2.47-.85C8.97 9.06 8.5 10.49 8.5 12c0 3.03 1.95 5.61 4.66 6.56 1.37.48 2.82.66 4.26.54C19.58 17.49 21 14.91 21 12c0-4.97-4.03-9-9-9z" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, #1B4D3E 0deg, transparent 90deg, transparent 270deg, #1B4D3E 360deg)",
                  opacity: 0.15,
                  transform: "scale(1.15)"
                }}></div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold relative z-10"
                style={{
                  background: "linear-gradient(135deg,#1B4D3E,#2d8c6e)",
                  color: "#fef3c7",
                  boxShadow: "0 2px 8px rgba(27,77,62,0.25)",
                  border: "2px solid rgba(212,175,55,0.2)"
                }}>
                {(name?.[0] || "U").toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center z-20"
                style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d8c6e 100%)", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#D4AF37">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.51 5.07-1.39-1.39.09-2.82-.09-4.19-.64-3.49-1.39-5.95-4.66-5.95-8.47 0-2.18.77-4.18 2.05-5.75C7.32 4.2 5.78 3.5 4.07 3.5c-.55 0-1 .45-1 1 0 2.21 1.79 4 4 4 .93 0 1.79-.32 2.47-.85C8.97 9.06 8.5 10.49 8.5 12c0 3.03 1.95 5.61 4.66 6.56 1.37.48 2.82.66 4.26.54C19.58 17.49 21 14.91 21 12c0-4.97-4.03-9-9-9z" />
                </svg>
              </div>
            </div>
          )}
        </button>

        {/* Text with Arabic calligraphy style */}
        <div className="flex flex-col gap-0.5">
          <div className="text-[13px] font-medium leading-tight flex items-center gap-1.5"
            style={{ color: "rgba(107,114,128,0.85)" }}>
            <span>السلام عليكم</span>
            <span className="text-[11px]">•</span>
            <span>{firstName}</span>
          </div>
          <div className="text-[17px] font-bold leading-tight tracking-tight"
            style={{
              background: "linear-gradient(135deg, #1B4D3E 0%, #2d8c6e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontFamily: "'Playfair Display', serif"
            }}>
            Find Your Halal Match
          </div>
        </div>
      </div>

      {/* Right: notification bell with Islamic design */}
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.90 }}
          whileHover={{ scale: 1.05 }}
          onClick={onNotification}
          className="relative w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer shrink-0"
          style={{
            background: "linear-gradient(135deg, #1B4D3E 0%, #2d8c6e 100%)",
            boxShadow: "0 4px 12px rgba(27,77,62,0.3)",
            border: "1.5px solid rgba(212,175,55,0.3)"
          }}
        >
          {/* Islamic star pattern overlay */}
          <div className="absolute inset-0 rounded-full overflow-hidden opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 40 40">
              <path d="M20 8 L24 16 L32 16 L26 22 L28 30 L20 24 L12 30 L14 22 L8 16 L16 16 Z"
                fill="#D4AF37" />
            </svg>
          </div>

          {/* Bell SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fef3c7" strokeWidth="2" className="relative z-10">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>

          {/* Notification badge with gold accent */}
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full leading-none"
              style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)",
                color: "#1B4D3E",
                boxShadow: "0 2px 6px rgba(212,175,55,0.5)",
                border: "1.5px solid rgba(27,77,62,0.2)"
              }}>
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
export default function AppBar({ onLogout, onSidebarLogout, tabs }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = Boolean(AuthService.isLoggedIn());
  const [userInfo, setUserInfo] = useState({ name: "", avatar: "", role: "" });

  useEffect(() => {
    let mounted = true;
    async function fetchUserInfo() {
      try {
        const user = await getUserInfo();
        if (mounted) setUserInfo(user);
      } catch (err) { }
    }
    fetchUserInfo();
    return () => { mounted = false; };
  }, []);

  const { name, avatar, role } = userInfo;
  const navTabs = tabs ?? (role === "guardian" ? GUARDIAN_TABS : INDIVIDUAL_TABS);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creditsLoading, setCreditsLoading] = useState(true);

  const socketCtx = useSocket();
  const interestCount = socketCtx?.interestCount || 0;
  const chatCount = socketCtx?.chatCount || 0;
  const guardianCount = socketCtx?.guardianCount || 0;
  const credits = socketCtx?.credits || 0;

  const badgeMap = {
    Interest: interestCount,
    Interests: interestCount,
    Chats: chatCount,
  };

  useEffect(() => {
    if (!isLoggedIn || !socketCtx) return;
    const fetchCredits = async () => {
      setCreditsLoading(true);
      try {
        const userCredits = await ProfileService.getCredits();
        socketCtx.setCredits(userCredits);
      } catch (err) {
        console.error('❌ Failed to fetch credits:', err);
      } finally {
        setCreditsLoading(false);
      }
    };
    fetchCredits();
  }, [isLoggedIn, socketCtx]);

  useEffect(() => {
    if (!isLoggedIn || !socketCtx) return;
    const fetchInterestCount = async () => {
      try {
        const response = await InterestService.pendingInterestCount();
        if (response.success) socketCtx.setInterestCount(response.data?.count || 0);
      } catch (err) { console.error('❌ AppBar: Failed to fetch interest count:', err); }
    };
    const fetchChatCount = async () => {
      try {
        const response = await ChatService.getUnreadCount();
        if (response.success) socketCtx.setChatCount(response.data?.count || 0);
      } catch (err) { console.error('❌ AppBar: Failed to fetch chat unread count:', err); }
    };
    const fetchGuardianCount = async () => {
      if (role !== "guardian") return;
      try {
        const response = await GuardianService.getGuardianPendingCount();
        if (response.success) socketCtx.setGuardianCount(response.data?.count || 0);
      } catch (err) { console.error('❌ AppBar: Failed to fetch guardian count:', err); }
    };
    fetchInterestCount();
    fetchChatCount();
    fetchGuardianCount();
  }, [isLoggedIn, socketCtx, role]);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const handleSidebarClose = () => setSidebarOpen(false);
  const handleSidebarLogout = () => { setSidebarOpen(false); (onSidebarLogout || onLogout)?.(); };
  const handleCreditsClick = () => {
    navigate(role === "guardian" ? '/guardian/subscription' : '/individual/subscription');
    setSidebarOpen(false);
  };
  const menuItems = role === "guardian"
    ? [
      { icon: LogOut, label: "Logout", action: "logout", color: "#ef4444" },
    ]
    : [
      { icon: LogOut, label: "Logout", action: "logout", color: "#ef4444" },
    ];

  return (
    <>
      {isLoggedIn && (
        <Sidebar
          open={sidebarOpen}
          onClose={handleSidebarClose}
          navTabs={navTabs}
          badgeMap={badgeMap}
          name={name}
          avatar={avatar}
          role={role}
          credits={credits}
          loading={creditsLoading}
          onLogout={handleSidebarLogout}
          onCreditsClick={handleCreditsClick}
          menuItems={menuItems}
        />
      )}

      {/* ── Desktop top header — hidden on mobile ── */}
      <header
        className="fixed top-0 left-0 w-full border-b items-center justify-between h-16 px-4 z-[99997] hidden md:flex"
        style={{
          background: "rgba(27, 77, 62, 0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          minHeight: 64,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 h-full select-none shrink-0">
          <img src="/logo.png" alt="Logo" className="h-14 w-auto" draggable={false} style={{ maxWidth: 200 }} />
          <span className="font-bold text-2xl hidden sm:inline" style={{ color: "var(--background)", letterSpacing: "0.3px" }}>
            Marriage Sunna Overseas
          </span>
        </Link>


        {/* Nav tabs */}
        {isLoggedIn && (
          <nav className="hidden md:flex flex-row ml-6 gap-1 flex-1">
            {navTabs.map(tab => {
              const active = isActive(tab, location.pathname);
              const Icon = active ? tab.SolidIcon : tab.OutlineIcon;
              const badgeCount = badgeMap[tab.name];
              return (
                <Link key={tab.name} to={tab.to}
                  className="relative flex flex-col items-center justify-center text-xs font-medium px-3 py-2 rounded-xl transition-all gap-0.5"
                  style={{
                    background: active ? "var(--background)" : "transparent",
                    color: active ? "var(--primary)" : "var(--background)",
                    opacity: active ? 1 : 0.7,
                  }}>
                  <span className="relative">
                    <Icon className="w-5 h-5" />
                    {!active && <NotifBadge count={badgeCount} />}
                  </span>
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right: notification bell */}
        {isLoggedIn && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(role === "guardian" ? "/guardian/notifications" : "/individual/notifications")}

            className="relative w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer shrink-0"
            style={{ background: "transparent", boxShadow: "transparent" }}
          >
            {/* Bell SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </motion.button>
        )}

        {/* Right: login or credits + profile */}
        {!isLoggedIn && (
          <div className="hidden md:flex ml-auto">
            <Link to="/login" className="px-4 py-2 rounded-xl font-medium text-sm transition-all hover:opacity-90"
              style={{ background: "var(--background)", color: "var(--primary)" }}>
              Login / Sign up
            </Link>
          </div>
        )}

        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-3 ml-2">
            {role === "individual" && (
              <CreditsDisplay credits={credits} onClick={() => navigate(role === "guardian" ? '/guardian/subscription' : '/individual/subscription')} loading={creditsLoading} />
            )}
            <ProfileDropdown avatar={avatar} name={name} role={role} onLogout={onLogout} menuItems={menuItems} />
          </div>
        )}
      </header>

      {/* ── Desktop spacer — only on md+ ── */}
      <div className="h-16 w-full hidden md:block" />

      {/* ── Mobile greeting bar — only on /explore ── */}
      {isLoggedIn && location.pathname === "/individual/explore" && (
        <MobileGreetingBar
          name={name}
          avatar={avatar}
          notifCount={interestCount + chatCount}
          onNotification={() => navigate(role === "guardian" ? "/guardian/notifications" : "/individual/notifications")}

          onMenuOpen={() => navigate("/individual/myprofile")}
        />
      )}

      {/* ── Mobile bottom nav ── */}
      {isLoggedIn && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 flex w-full items-stretch h-16 z-[99997]"
          style={{
            background: "#ffffff",
            borderTop: "1px solid rgba(27, 77, 62, 0.1)",
            boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)",
          }}
        >
          {navTabs.map(tab => {
            const active = isActive(tab, location.pathname);
            const Icon = active ? tab.SolidIcon : tab.OutlineIcon;
            const badgeCount = badgeMap[tab.name];
            return (
              <Link key={tab.name} to={tab.to}
                className="relative flex flex-col items-center justify-center flex-1 gap-1 transition-all"
                style={{ color: active ? "var(--primary)" : "#9ca3af", background: "transparent" }}
              >
                <span className="relative">
                  <Icon className="w-6 h-6 transition-transform" style={{ transform: active ? "scale(1.1)" : "scale(1)" }} />
                  {!active && badgeCount > 0 && <NotifBadge count={badgeCount} />}
                </span>
                <span className="text-[10px] font-medium transition-all" style={{ fontWeight: active ? 600 : 500 }}>
                  {tab.name}
                </span>
                {active && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    initial={false}
                    className="absolute"
                    style={{
                      bottom: 0, left: "50%", width: "40px", height: "3px",
                      borderRadius: "3px 3px 0 0", background: "var(--primary)", marginLeft: "-20px",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Mobile credits + menu button — shown when not logged in on mobile */}
      {!isLoggedIn && (
        <div className="md:hidden fixed top-3 right-4 z-[99997]">
          <Link to="/login" className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: "var(--primary)", color: "var(--background)" }}>
            Login / Sign up
          </Link>
        </div>
      )}
    </>
  );
}

const Sidebar = memo(function Sidebar({ open, onClose, navTabs, badgeMap, name, avatar, role, credits, loading, onLogout, onCreditsClick, menuItems }) {
  const location = useLocation();
  return (
    <>
      <div
        className={`fixed inset-0 z-[99999] transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-72 max-w-full z-[100000] shadow-2xl transition-transform duration-300 flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "var(--secondary)", borderLeft: "1px solid var(--primary)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(27, 77, 62, 0.1)" }}>
          <div className="flex items-center gap-3">
            <AvatarOrInitial avatar={avatar} name={name} size={10} />
            <div>
              <p className="font-semibold text-sm leading-tight" style={{ color: "var(--primary)" }}>{name}</p>
              <p className="text-xs capitalize leading-tight" style={{ color: "var(--primary)", opacity: 0.6 }}>{role}</p>
            </div>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors" onClick={onClose}>
            <CloseIcon className="w-5 h-5" style={{ color: "var(--primary)" }} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col py-3 gap-1 px-3 overflow-y-auto">
          {menuItems.map(item => {
            if (item.path) {
              return (
                <Link key={item.label} to={item.path} onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                  style={{
                    background: location.pathname === item.path ? "var(--primary)" : "transparent",
                    color: location.pathname === item.path ? "var(--primary-foreground)" : "var(--primary)",
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            }
            return (
              <button key={item.label}
                onClick={item.action === "logout" ? onLogout : undefined}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                style={{ background: "transparent", color: item.color || "var(--primary)", fontWeight: 400 }}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
});
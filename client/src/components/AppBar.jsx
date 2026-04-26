// @ts-nocheck
// components/AppBar.jsx — Unified AppBar for both individual and guardian roles
// Pass `tabs` prop to customize nav links per role

import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSocket } from "../sockets/SocketContext";
import {
  HeartIcon as HeartOutline,
  UserIcon as UserOutline,
  ChatBubbleLeftEllipsisIcon as ChatOutline,
  MapIcon as MapOutline,
  HomeIcon as HomeOutline,
  Square3Stack3DIcon as WardOutline,
  XMarkIcon as CloseIcon,
  Bars3Icon as MenuIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolid,
  UserIcon as UserSolid,
  ChatBubbleLeftEllipsisIcon as ChatSolid,
  MapIcon as MapSolid,
  HomeIcon as HomeSolid,
  Square3Stack3DIcon as WardSolid,
} from "@heroicons/react/24/solid";

// ── Exported tab definitions ──────────────────────────────────────────────────
export const INDIVIDUAL_TABS = [
  { name: "Explore", to: "/explore", OutlineIcon: MapOutline, SolidIcon: MapSolid },
  { name: "Interest", to: "/interest", OutlineIcon: HeartOutline, SolidIcon: HeartSolid },
  { name: "Chats", to: "/chats", OutlineIcon: ChatOutline, SolidIcon: ChatSolid },
  { name: "Profile", to: "/myprofile", OutlineIcon: UserOutline, SolidIcon: UserSolid },
];

export const GUARDIAN_TABS = [
  { name: "Dashboard", to: "/guardian", OutlineIcon: HomeOutline, SolidIcon: HomeSolid },
  { name: "Interests", to: "/guardian/interests", OutlineIcon: HeartOutline, SolidIcon: HeartSolid },
  { name: "My Wards", to: "/guardian/add-ward", OutlineIcon: WardOutline, SolidIcon: WardSolid },
  { name: "Profile", to: "/guardian/profile", OutlineIcon: UserOutline, SolidIcon: UserSolid },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const SERVER_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL?.replace('/api', '');

function getJwtData() {
  try {
    const token = localStorage.getItem("jwtToken");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch { return null; }
}

function getUserInfo() {
  const d = getJwtData();
  return {
    name: d?.name || d?.userName || "User",
    avatar: d?.avatar || d?.avatar_url || d?.profileImage || null,
    role: d?.role || "individual",
  };
}

function isActive(tab, pathname) {
  // Exact match for root guardian/explore, prefix match for children
  const rootPaths = ["/guardian", "/explore", "/myprofile", "/interest", "/chats"];
  if (rootPaths.includes(tab.to)) return pathname === tab.to;
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

function AvatarOrInitial({ avatar, name, size = 8 }) {
  const cls = `h-${size} w-${size} rounded-full object-cover`;
  if (avatar) return <img src={avatar} alt={name} className={cls} />;
  return (
    <span className={`h-${size} w-${size} rounded-full flex items-center justify-center text-sm font-bold select-none`}
      style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
      {(name?.[0] || "U").toUpperCase()}
    </span>
  );
}

// ── Main AppBar ───────────────────────────────────────────────────────────────
export default function AppBar({ onLogout, onSidebarLogout, tabs }) {
  const location = useLocation();
  const jwtData = getJwtData();
  const isLoggedIn = Boolean(jwtData);
  const { name, avatar, role } = getUserInfo();

  // Auto-detect tabs if not passed
  const navTabs = tabs ?? (role === "guardian" ? GUARDIAN_TABS : INDIVIDUAL_TABS);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const socketCtx = useSocket();
  const interestCount = socketCtx?.interestCount || 0;
  const chatCount = socketCtx?.chatCount || 0;
  const guardianCount = socketCtx?.guardianCount || 0;

  const badgeMap = {
    Interest: interestCount + (role === "guardian" ? guardianCount : 0),
    Interests: interestCount + (role === "guardian" ? guardianCount : 0),
    Chats: chatCount,
  };
  const totalBadge = (badgeMap.Interest || badgeMap.Interests || 0) + (badgeMap.Chats || 0);

  // Fetch counts on mount
  useEffect(() => {
    if (!isLoggedIn || !socketCtx) return;
    const h = { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` };
    fetch(`${SERVER_URL}/interest/pending-count`, { headers: h })
      .then(r => r.json()).then(d => { if (d.success) socketCtx.setInterestCount(d.data?.count || 0); }).catch(() => { });
    fetch(`${SERVER_URL}/chat/conversation-users`, { headers: h })
      .then(r => r.json()).then(d => {
        if (d.success && Array.isArray(d.data))
          socketCtx.setChatCount(d.data.reduce((s, c) => s + (c.unread_count || 0), 0));
      }).catch(() => { });
    if (role === "guardian") {
      fetch(`${SERVER_URL}/guardian/pending-interests`, { headers: h })
        .then(r => r.json()).then(d => { if (d.success) socketCtx.setGuardianCount(d.data?.length || 0); }).catch(() => { });
    }
  }, [isLoggedIn]);

  // Clear badges + close sidebar on nav
  useEffect(() => {
    if (!socketCtx) return;
    if (["/interest", "/guardian/interests"].includes(location.pathname)) socketCtx.setInterestCount(0);
    if (location.pathname === "/chats") socketCtx.setChatCount(0);
    if (sidebarOpen) setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  // ── Sidebar ───────────────────────────────────────────────────────────────
  function Sidebar() {
    return (
      <>
        <div className={`fixed inset-0 z-[99999] transition-opacity duration-200 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
          onClick={() => setSidebarOpen(false)} />

        <aside className={`fixed top-0 right-0 h-full w-72 max-w-full z-[100000] shadow-2xl transition-transform duration-300 flex flex-col ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
          style={{ background: "var(--primary-foreground)", borderLeft: "1px solid var(--secondary)" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--secondary)" }}>
            <div className="flex items-center gap-3">
              <AvatarOrInitial avatar={avatar} name={name} size={10} />
              <div>
                <p className="font-semibold text-sm leading-tight" style={{ color: "var(--primary)" }}>{name}</p>
                <p className="text-xs capitalize leading-tight" style={{ color: "var(--primary)", opacity: 0.5 }}>{role}</p>
              </div>
            </div>
            <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--secondary)" }}
              onClick={() => setSidebarOpen(false)}>
              <CloseIcon className="w-5 h-5" style={{ color: "var(--primary)" }} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 flex flex-col py-3 gap-1 px-3 overflow-y-auto">
            {navTabs.map(tab => {
              const active = isActive(tab, location.pathname);
              const Icon = active ? tab.SolidIcon : tab.OutlineIcon;
              return (
                <Link key={tab.name} to={tab.to} onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                  style={{
                    background: active ? "var(--primary)" : "transparent",
                    color: active ? "var(--primary-foreground)" : "var(--primary)",
                    fontWeight: active ? 600 : 400,
                  }}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{tab.name}</span>
                  {badgeMap[tab.name] > 0 && (
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: active ? "rgba(255,255,255,0.25)" : "var(--primary)", color: active ? "var(--primary-foreground)" : "var(--primary-foreground)" }}>
                      {badgeMap[tab.name]}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <button className="mx-4 mb-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            onClick={() => { setSidebarOpen(false); (onSidebarLogout || onLogout)?.(); }}>
            Logout
          </button>
        </aside>
      </>
    );
  }

  return (
    <>
      {isLoggedIn && <Sidebar />}

      {/* ── Top header ── */}
      <header className="fixed top-0 left-0 w-full border-b flex items-center justify-between h-16 px-4 z-[99997]"
        style={{ background: "var(--primary-foreground)", borderColor: "var(--secondary)", minHeight: 64, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 h-full select-none shrink-0">
          <img src="https://marriage-sunnah-overseas.replit.app/logo.png" alt="Logo"
            className="h-9 w-auto" draggable={false} style={{ maxWidth: 140 }} />
          <span className="font-bold text-base hidden sm:inline" style={{ color: "var(--primary)", letterSpacing: "0.3px" }}>
            Marriage Sunnah Overseas
          </span>
        </Link>

        {/* Desktop nav */}
        {isLoggedIn && (
          <nav className="hidden md:flex flex-row ml-6 gap-1 flex-1">
            {navTabs.map(tab => {
              const active = isActive(tab, location.pathname);
              const Icon = active ? tab.SolidIcon : tab.OutlineIcon;
              return (
                <Link key={tab.name} to={tab.to}
                  className="relative flex flex-col items-center justify-center text-xs font-medium px-3 py-2 rounded-xl transition-all gap-0.5"
                  style={{
                    background: active ? "var(--primary)" : "transparent",
                    color: active ? "var(--primary-foreground)" : "var(--primary)",
                    opacity: active ? 1 : 0.6,
                  }}>
                  <span className="relative">
                    <Icon className="w-5 h-5" />
                    <NotifBadge count={badgeMap[tab.name]} />
                  </span>
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Desktop: not logged in */}
        {!isLoggedIn && (
          <div className="hidden md:flex ml-auto">
            <Link to="/login" className="px-4 py-2 rounded-xl font-medium text-sm"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              Login / Sign up
            </Link>
          </div>
        )}

        {/* Desktop: user + logout */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-3 ml-2">
            <div className="flex items-center gap-2 pr-3 border-r" style={{ borderColor: "var(--secondary)" }}>
              <AvatarOrInitial avatar={avatar} name={name} size={8} />
              <div>
                <p className="text-sm font-semibold leading-tight" style={{ color: "var(--primary)" }}>{name}</p>
                <p className="text-xs capitalize leading-tight" style={{ color: "var(--primary)", opacity: 0.5 }}>{role}</p>
              </div>
            </div>
            <button onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all"
              style={{ borderColor: "var(--secondary)", color: "var(--primary)", background: "var(--secondary)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.25 3A2.25 2.25 0 005 5.25v2a.75.75 0 001.5 0v-2a.75.75 0 01.75-.75h6.5a.75.75 0 01.75.75v9.5a.75.75 0 01-.75.75H7.25a.75.75 0 01-.75-.75v-2a.75.75 0 00-1.5 0v2A2.25 2.25 0 007.25 17h6.5A2.25 2.25 0 0016 14.75v-9.5A2.25 2.25 0 0013.75 3h-6.5z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10.22 12.53a.75.75 0 001.06 0l2-2a.75.75 0 000-1.06l-2-2a.75.75 0 10-1.06 1.06l.22.22H4.75a.75.75 0 000 1.5h5.69l-.22.22a.75.75 0 000 1.06z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        )}

        {/* Mobile: hamburger */}
        {isLoggedIn && (
          <button className="relative md:hidden ml-auto p-2 rounded-xl" style={{ color: "var(--primary)" }}
            onClick={() => setSidebarOpen(true)}>
            <MenuIcon className="w-6 h-6" />
            <NotifBadge count={totalBadge} />
          </button>
        )}

        {/* Mobile: not logged in */}
        {!isLoggedIn && (
          <div className="md:hidden ml-auto">
            <Link to="/login" className="px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              Login
            </Link>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-16 w-full" />

      {/* ── Mobile bottom nav ── */}
      {isLoggedIn && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 flex w-full items-stretch h-16 z-[99997] border-t"
          style={{ background: "var(--primary)", borderColor: "var(--primary)" }}>
          {navTabs.map(tab => {
            const active = isActive(tab, location.pathname);
            const Icon = active ? tab.SolidIcon : tab.OutlineIcon;
            return (
              <Link key={tab.name} to={tab.to}
                className="relative flex flex-col items-center justify-center flex-1 gap-0.5 transition-all"
                style={{
                  color: "var(--primary-foreground)",
                  opacity: active ? 1 : 0.5,
                  background: active ? "rgba(255,255,255,0.15)" : "transparent",
                }}>
                <span className="relative">
                  <Icon className="w-6 h-6" />
                  <NotifBadge count={badgeMap[tab.name]} />
                </span>
                <span className="text-[10px] font-medium">{tab.name}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
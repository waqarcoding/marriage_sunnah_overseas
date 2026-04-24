import { Link, useLocation } from "react-router-dom";
import {
  HeartIcon as HeartOutline,
  UserIcon as UserOutline,
  ChatBubbleLeftEllipsisIcon as MessageCircleOutline,
  MapIcon as CompassOutline, // Use MapIcon instead of CompassIcon
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolid,
  UserIcon as UserSolid,
  ChatBubbleLeftEllipsisIcon as MessageCircleSolid,
  MapIcon as CompassSolid, // Use MapIcon instead of CompassIcon
} from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { useSocket } from "../sockets/SocketContext";

// You may need to create these or replace with appropriate icons if they do not exist.
import { XMarkIcon as CloseIcon, Bars3Icon as MenuIcon } from "@heroicons/react/24/outline";

// @ts-ignore
const SERVER_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL?.replace('/api', '');

// ── Auth helpers ──────────────────────────────────────────────
function getJwtData() {
  try {
    const token = localStorage.getItem("jwtToken");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function getUserInfo() {
  const d = getJwtData();
  return {
    name: d?.name || d?.userName || "User",
    avatar: d?.avatar || d?.avatar_url || d?.profileImage || null,
    role: d?.role || "individual",
  };
}

// ── Red badge ─────────────────────────────────────────────────
function Badge({ count }) {
  if (!count || count <= 0) return null;
  return (
    <span
      className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1
      flex items-center justify-center bg-red-500 text-white text-[10px]
      font-bold rounded-full leading-none z-10 shadow"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function AvatarOrInitial({ avatar, name }) {
  if (avatar)
    return (
      <img
        src={avatar}
        alt={name}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  return (
    <span
      className="h-8 w-8 bg-primary text-white rounded-full flex items-center
      justify-center text-lg font-semibold select-none"
    >
      {(name?.[0] || "U").toUpperCase()}
    </span>
  );
}

// Updated ALL_TABS and ICONS for correct filled and outlined icons
const ALL_TABS = [
  {
    name: "Match",
    to: "/explore",
    filledIcon: <CompassSolid className="w-6 h-6" />, // Use filled for active
    outlinedIcon: <CompassOutline className="w-6 h-6" />, // Use outlined for inactive
  },
  {
    name: "Interest",
    to: "/interest",
    filledIcon: <HeartSolid className="w-6 h-6" />,
    outlinedIcon: <HeartOutline className="w-6 h-6" />,
  },
  {
    name: "Chats",
    to: "/chats",
    filledIcon: <MessageCircleSolid className="w-6 h-6" />, // use filled from heroicons, not outline
    outlinedIcon: <MessageCircleOutline className="w-6 h-6" />,
  },
  {
    name: "Profile",
    to: "/myprofile",
    filledIcon: <UserSolid className="w-6 h-6" />,
    outlinedIcon: <UserOutline className="w-6 h-6" />,
  },
];

const ICONS = {
  filled: {
    Match: <CompassSolid className="w-6 h-6" />,
    Interest: <HeartSolid className="w-6 h-6" />,
    Chats: <MessageCircleSolid className="w-6 h-6" />,
    Profile: <UserSolid className="w-6 h-6" />,
  },
  outlined: {
    Match: <CompassOutline className="w-6 h-6" />,
    Interest: <HeartOutline className="w-6 h-6" />,
    Chats: <MessageCircleOutline className="w-6 h-6" />,
    Profile: <UserOutline className="w-6 h-6" />,
  },
};

// For backwards compatibility, you may optionally use the filled version as default
ICONS.Match = ICONS.filled.Match;
ICONS.Interest = ICONS.filled.Interest;
ICONS.Chats = ICONS.filled.Chats;
ICONS.Profile = ICONS.filled.Profile;
ICONS.outlined = ICONS.outlined;

export default function AppBar({
  onLogout,
  onSidebarLogout,
  withSidebar = true,
}) {
  const location = useLocation();
  const jwtData = getJwtData();
  const isLoggedIn = Boolean(jwtData);
  const { name, avatar, role } = getUserInfo();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Read badge counts from shared SocketContext ───────────
  const socketCtx = useSocket();
  const interestCount = socketCtx?.interestCount || 0;
  const chatCount = socketCtx?.chatCount || 0;
  const guardianCount = socketCtx?.guardianCount || 0;

  // ── Fetch initial counts via HTTP on mount ────────────────
  useEffect(() => {
    if (!isLoggedIn || !socketCtx) return;
    const h = { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` };

    // Pending interests
    fetch(`${SERVER_URL}/interest/pending-count`, { headers: h })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) socketCtx.setInterestCount(d.data?.count || 0);
      })
      .catch(() => { });

    // Unread chats
    fetch(`${SERVER_URL}/chat/conversation-users`, { headers: h })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          socketCtx.setChatCount(
            d.data.reduce((s, c) => s + (c.unread_count || 0), 0)
          );
        }
      })
      .catch(() => { });

    // Guardian pending (only for guardian role)
    if (role === "guardian") {
      fetch(`${SERVER_URL}/guardian/pending-interests`, { headers: h })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) socketCtx.setGuardianCount(d.data?.length || 0);
        })
        .catch(() => { });
    }
  }, [isLoggedIn]);

  // ── Clear badge when user visits that page ────────────────
  useEffect(() => {
    if (!socketCtx) return;
    if (location.pathname === "/interest") socketCtx.setInterestCount(0);
    if (location.pathname === "/chats") socketCtx.setChatCount(0);
    if (sidebarOpen) setSidebarOpen(false);
  }, [location.pathname]);

  // ── Lock body scroll when sidebar open ───────────────────
  useEffect(() => {
    document.body.style.overflow = withSidebar && sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen, withSidebar]);

  const badgeMap = {
    Interest: interestCount + (role === "guardian" ? guardianCount : 0),
    Chats: chatCount,
  };
  const totalBadge = (badgeMap.Interest || 0) + (badgeMap.Chats || 0);

  // ── Sidebar (White bg, no badge) ──────────────────────────
  function Sidebar() {
    return (
      <>
        <div
          className={`fixed inset-0 z-[99999] transition-opacity duration-200
            ${sidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
            }`}
          style={{
            backgroundColor: "rgba(0,0,0,0.07)",
          }}
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={`fixed top-0 right-0 h-full w-72 max-w-full z-[100000] shadow-lg
            transition-transform duration-300 ease-in-out flex flex-col
            ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
          style={{
            background: "#fff",
            borderLeft: "1px solid rgba(220,220,220,0.13)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <AvatarOrInitial avatar={avatar} name={name} />
              <span className="font-medium">{name}</span>
            </div>
            <button
              className="rounded-full bg-gray-100 p-2 ml-2"
              onClick={() => setSidebarOpen(false)}
            >
              <CloseIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Links */}
          <nav className="flex-grow flex flex-col py-4">
            {ALL_TABS.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 text-gray-700
                    hover:bg-gray-50 transition rounded-lg
                    ${isActive
                      ? "bg-gray-50 font-semibold"
                      : ""
                    }`}
                >
                  <span className="relative">{isActive ? item.filledIcon : item.outlinedIcon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <button
            className="m-6 px-4 py-2 rounded bg-primary text-white font-medium shadow hover:bg-primary/90"
            onClick={() => {
              setSidebarOpen(false);
              (onSidebarLogout || onLogout)?.();
            }}
          >
            Logout
          </button>
        </aside>
      </>
    );
  }

  return (
    <>
      {withSidebar && isLoggedIn && <Sidebar />}

      {/* Top header */}
      <header
        className="fixed top-0 left-0 w-full bg-white border-b border-gray-100 shadow-sm
        flex items-center justify-between h-[64px] px-4 z-[99997]"
        style={{ minHeight: 64 }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 h-full select-none shrink-0"
        >
          <img
            src="https://marriage-sunnah-overseas.replit.app/logo.png"
            alt="Logo"
            className="h-10 w-auto"
            draggable={false}
            style={{ maxWidth: "146px" }}
          />
          <span
            className="font-extrabold text-xl text-primary hidden sm:inline"
            style={{ letterSpacing: "0.5px" }}
          >
            Marriage Sunnah Overseas
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex flex-row ml-6 gap-2 flex-1">
          {isLoggedIn ? (
            ALL_TABS.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`relative flex flex-col items-center justify-center text-sm font-medium
                    px-3 py-2 rounded-sm transition-colors
                    ${isActive
                      ? "bg-primary text-white"
                      : "hover:bg-primary/10 text-gray-600"
                    }`}
                >
                  <span className="relative">
                    {isActive ? item.filledIcon : item.outlinedIcon}
                    <Badge count={badgeMap[item.name]} />
                  </span>
                  <span className="text-xs mt-0.5">{item.name}</span>
                </Link>
              );
            })
          ) : (
            <div className="flex items-center gap-2 ml-auto">
              <Link
                to="/login"
                className="px-4 py-2 rounded bg-primary text-white font-medium shadow hover:bg-primary/90"
              >
                Login / Sign up
              </Link>
            </div>
          )}
        </nav>

        {/* Desktop user + logout */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-3 justify-end">
            <span className="text-base font-medium text-gray-700 mr-2 hidden sm:inline">
              Welcome, {name}
            </span>
            <button
              className="flex items-center gap-2 p-1 px-2 rounded hover:bg-gray-50 border border-gray-200"
              onClick={onLogout}
            >
              <AvatarOrInitial avatar={avatar} name={name} />
              <span className="text-sm font-medium ml-1">Logout</span>
            </button>
          </div>
        )}

        {/* Mobile hamburger with combined badge */}
        {isLoggedIn && (
          <div className="flex items-center ml-auto md:hidden">
            <button
              className="relative flex items-center justify-center rounded-full p-2 bg-transparent"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon className="w-7 h-7 text-gray-700" />
              <Badge count={totalBadge} />
            </button>
          </div>
        )}

        {/* Mobile login button */}
        {!isLoggedIn && (
          <div className="flex md:hidden items-center ml-auto">
            <Link
              to="/login"
              className="px-4 py-2 rounded bg-primary text-white font-medium shadow hover:bg-primary/90"
            >
              Login / Sign up
            </Link>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-[64px] w-full" />

      {/* Mobile bottom nav */}
      {isLoggedIn && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 shadow-inner flex w-full items-stretch h-16 z-[99997] px-0"
          style={{
            background: "rgba(255,255,255,0.81)",
            backdropFilter: "blur(12px) saturate(1.3)",
            WebkitBackdropFilter: "blur(12px) saturate(1.3)",
            borderTop: "1px solid rgba(221,232,228,0.75)", // Optional soft border
          }}
        >
          {ALL_TABS.map((item, idx) => {
            const isActive = location.pathname === item.to;
            const ICON_SIZE = 26;
            const TEXT_SIZE = "0.93em";

            const iconToRender = isActive ? item.filledIcon : item.outlinedIcon;

            return (
              <Link
                key={item.name}
                to={item.to}
                className={`
                  relative flex flex-col items-center justify-center
                  flex-1 min-w-0 h-full
                  ${isActive
                    ? "bg-primary text-white shadow-sm font-semibold"
                    : "bg-primary text-white/60  "
                  }
                  transition
                
                `}
                style={{
                  transition: "all 0.18s cubic-bezier(.4,0,.2,1)",
                  // borderLeft: idx !== 0 ? "1px solid #eee" : undefined,
                }}
                tabIndex={0}
                role="button"
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className="relative flex items-center justify-center"
                  style={{
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    fontSize: ICON_SIZE,
                    color: isActive
                      ? "bg-white"
                      : "bg-white",
                    transition: "color 0.17s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {iconToRender}
                  <Badge count={badgeMap[item.name]} />
                </span>
                <span
                  className={
                    isActive
                      ? "text-active-foreground"
                      : "text-inactive-foreground"
                  }
                  style={{
                    fontSize: TEXT_SIZE,
                    transition: "font-size 0.14s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}

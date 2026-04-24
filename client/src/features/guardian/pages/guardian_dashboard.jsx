import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import GuardianService from "../api/GuardianService";
import { useSocket } from "../../../sockets/SocketContext";
import {
    HeartIcon as HeartOutline,
    UserIcon as UserOutline,
    ChatBubbleLeftEllipsisIcon as MessageCircleOutline,
    MapIcon as CompassOutline,
    XMarkIcon as CloseIcon,
    Bars3Icon as MenuIcon,
} from "@heroicons/react/24/outline";
import {
    HeartIcon as HeartSolid,
    UserIcon as UserSolid,
    ChatBubbleLeftEllipsisIcon as MessageCircleSolid,
    MapIcon as CompassSolid,
} from "@heroicons/react/24/solid";

// ── Same SERVER_URL + helpers as AppBar ──────────────────────
// @ts-ignore
const SERVER_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL?.replace('/api', '');

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
        name: d?.name || d?.userName || "Guardian",
        avatar: d?.avatar || d?.avatar_url || d?.profileImage || null,
        role: d?.role || "guardian",
    };
}

// ── Shared nav tabs ───────────────────────────────────────────
const ALL_TABS = [
    {
        name: "Match",
        to: "/explore",
        filledIcon: <CompassSolid className="w-6 h-6" />,
        outlinedIcon: <CompassOutline className="w-6 h-6" />,
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
        filledIcon: <MessageCircleSolid className="w-6 h-6" />,
        outlinedIcon: <MessageCircleOutline className="w-6 h-6" />,
    },
    {
        name: "Profile",
        to: "/myprofile",
        filledIcon: <UserSolid className="w-6 h-6" />,
        outlinedIcon: <UserOutline className="w-6 h-6" />,
    },
];

function NavBadge({ count }) {
    if (!count || count <= 0) return null;
    return (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1
      flex items-center justify-center bg-red-500 text-white text-[10px]
      font-bold rounded-full leading-none z-10 shadow">
            {count > 99 ? "99+" : count}
        </span>
    );
}

function AvatarOrInitial({ avatar, name }) {
    if (avatar)
        return <img src={avatar} alt={name} className="h-8 w-8 rounded-full object-cover" />;
    return (
        <span className="h-8 w-8 bg-primary text-white rounded-full flex items-center
      justify-center text-lg font-semibold select-none">
            {(name?.[0] || "G").toUpperCase()}
        </span>
    );
}

// ── Sub-components ────────────────────────────────────────────
const Avatar = ({ src, name, size = "md" }) => {
    const sizes = { sm: "w-9 h-9 text-xs", md: "w-12 h-12 text-sm", lg: "w-16 h-16 text-base" };
    return src ? (
        <img src={src} alt={name} className={`${sizes[size]} rounded-2xl object-cover border-2 border-white shadow-sm flex-shrink-0`} />
    ) : (
        <div className={`${sizes[size]} rounded-2xl bg-primary/15 text-primary font-bold flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm`}>
            {name?.[0]?.toUpperCase() ?? "?"}
        </div>
    );
};

const Badge = ({ label, variant = "default" }) => {
    const v = {
        default: "bg-gray-100 text-gray-600",
        pending: "bg-amber-50 text-amber-700 border border-amber-200",
        approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        rejected: "bg-red-50 text-red-600 border border-red-200",
    };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${v[variant]}`}>{label}</span>;
};

const EmptyState = ({ icon, title, subtitle }) => (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="text-5xl">{icon}</span>
        <p className="font-semibold text-gray-700 text-base">{title}</p>
        <p className="text-gray-400 text-sm text-center max-w-xs">{subtitle}</p>
    </div>
);

// ── Main component ────────────────────────────────────────────
export default function GuardianDashboard({ onLogout, onSidebarLogout }) {
    const location = useLocation();
    const { name, avatar, role } = getUserInfo();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("pending");
    const [pendingInterests, setPendingInterests] = useState([]);
    const [allInterests, setAllInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState(null);

    // ── Badge counts ─────────────────────────────────────────
    const socketCtx = useSocket();
    const interestCount = socketCtx?.interestCount || 0;
    const chatCount = socketCtx?.chatCount || 0;
    const guardianCount = socketCtx?.guardianCount || 0;

    useEffect(() => {
        const h = { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` };
        fetch(`${SERVER_URL}/interest/pending-count`, { headers: h })
            .then(r => r.json())
            .then(d => { if (d.success) socketCtx?.setInterestCount(d.data?.count || 0); })
            .catch(() => { });
        fetch(`${SERVER_URL}/chat/conversation-users`, { headers: h })
            .then(r => r.json())
            .then(d => {
                if (d.success && Array.isArray(d.data))
                    socketCtx?.setChatCount(d.data.reduce((s, c) => s + (c.unread_count || 0), 0));
            })
            .catch(() => { });
        if (role === "guardian") {
            fetch(`${SERVER_URL}/guardian/pending-interests`, { headers: h })
                .then(r => r.json())
                .then(d => { if (d.success) socketCtx?.setGuardianCount(d.data?.length || 0); })
                .catch(() => { });
        }
    }, []);

    useEffect(() => {
        if (!socketCtx) return;
        if (location.pathname === "/interest") socketCtx.setInterestCount(0);
        if (location.pathname === "/chats") socketCtx.setChatCount(0);
        if (sidebarOpen) setSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [sidebarOpen]);

    const badgeMap = {
        Interest: interestCount + (role === "guardian" ? guardianCount : 0),
        Chats: chatCount,
    };
    const totalBadge = (badgeMap.Interest || 0) + (badgeMap.Chats || 0);

    // ── Data loading ─────────────────────────────────────────
    const loadAll = () => {
        setLoading(true);
        GuardianService.getPendingInterests({
            onSuccess: (res) => {
                const list = res?.data ?? [];
                setPendingInterests(list.filter(i => !i.guardian_approved && i.status !== "rejected"));
                setAllInterests(list);
                setLoading(false);
            },
            onFailed: () => { toast.error("Failed to load interests"); setLoading(false); },
        });
    };
    useEffect(() => { loadAll(); }, []);

    const handleApprove = (interestId) => {
        setLoadingAction(interestId);
        GuardianService.approveInterest(interestId, {
            onSuccess: () => {
                toast.success("Interest approved! 🤝");
                setPendingInterests(p => p.filter(i => i.id !== interestId));
                setAllInterests(p => p.map(i => i.id === interestId ? { ...i, guardian_approved: true } : i));
                setLoadingAction(null);
            },
            onFailed: () => { toast.error("Failed to approve"); setLoadingAction(null); },
        });
    };

    const handleReject = (interestId) => {
        setLoadingAction(`rej_${interestId}`);
        GuardianService.rejectInterest(interestId, {
            onSuccess: () => {
                toast.success("Interest rejected");
                setPendingInterests(p => p.filter(i => i.id !== interestId));
                setAllInterests(p => p.map(i => i.id === interestId ? { ...i, status: "rejected" } : i));
                setLoadingAction(null);
            },
            onFailed: () => { toast.error("Failed to reject"); setLoadingAction(null); },
        });
    };

    const tabs = [
        { id: "pending", label: "Pending", badge: pendingInterests.length },
        { id: "all", label: "All" },
        { id: "approved", label: "Approved" },
        { id: "rejected", label: "Rejected" },
    ];
    const tabData = {
        pending: pendingInterests,
        all: allInterests,
        approved: allInterests.filter(i => i.guardian_approved),
        rejected: allInterests.filter(i => i.status === "rejected"),
    };

    // ── Sidebar ───────────────────────────────────────────────
    function Sidebar() {
        return (
            <>
                <div
                    className={`fixed inset-0 z-[99999] transition-opacity duration-200
            ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                    style={{ backgroundColor: "rgba(0,0,0,0.07)" }}
                    onClick={() => setSidebarOpen(false)}
                />
                <aside
                    className={`fixed top-0 right-0 h-full w-72 max-w-full z-[100000] shadow-lg
            transition-transform duration-300 ease-in-out flex flex-col
            ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
                    style={{ background: "#fff", borderLeft: "1px solid rgba(220,220,220,0.13)" }}
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <AvatarOrInitial avatar={avatar} name={name} />
                            <span className="font-medium">{name}</span>
                        </div>
                        <button className="rounded-full bg-gray-100 p-2 ml-2" onClick={() => setSidebarOpen(false)}>
                            <CloseIcon className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>
                    <nav className="flex-grow flex flex-col py-4">
                        {ALL_TABS.map((item) => {
                            const isActive = location.pathname === item.to;
                            return (
                                <Link key={item.name} to={item.to} onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-6 py-3 text-gray-700
                    hover:bg-gray-50 transition rounded-lg
                    ${isActive ? "bg-gray-50 font-semibold" : ""}`}>
                                    <span className="relative">{isActive ? item.filledIcon : item.outlinedIcon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                    <button
                        className="m-6 px-4 py-2 rounded bg-primary text-white font-medium shadow hover:bg-primary/90"
                        onClick={() => { setSidebarOpen(false); (onSidebarLogout || onLogout)?.(); }}
                    >
                        Logout
                    </button>
                </aside>
            </>
        );
    }

    // ── Interest card ─────────────────────────────────────────
    const InterestCard = ({ interest }) => {
        const sender = interest.fromProfile || {};
        const receiver = interest.toProfile || {};
        const isApproving = loadingAction === interest.id;
        const isRejecting = loadingAction === `rej_${interest.id}`;
        const canAct = !interest.guardian_approved && interest.status !== "rejected";

        return (
            <div className="bg-white rounded-2xl border border-gray-100 hover:border-primary/20
          shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                            <Avatar src={sender.image} name={sender.name} size="md" />
                            <p className="text-xs font-semibold text-gray-800 truncate w-full text-center">{sender.name || "Unknown"}</p>
                            <p className="text-xs text-gray-400 truncate w-full text-center">{sender.city || ""}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                            <div className="flex items-center gap-1">
                                <div className="w-6 h-px bg-primary/30" />
                                <span className="text-primary text-base">♡</span>
                                <div className="w-6 h-px bg-primary/30" />
                            </div>
                            <Badge label={interest.status}
                                variant={interest.status === "accepted" ? "approved" : interest.status === "rejected" ? "rejected" : "pending"} />
                            <Badge label={interest.guardian_approved ? "You Approved ✓" : "Awaiting You"}
                                variant={interest.guardian_approved ? "approved" : "pending"} />
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                            <Avatar src={receiver.image} name={receiver.name} size="md" />
                            <p className="text-xs font-semibold text-gray-800 truncate w-full text-center">{receiver.name || "Unknown"}</p>
                            <p className="text-xs text-gray-400 truncate w-full text-center">{receiver.city || ""}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {sender.profession && <span className="px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-xs text-gray-500">{sender.profession}</span>}
                        {receiver.profession && <span className="px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-xs text-gray-500">{receiver.profession}</span>}
                        <span className="ml-auto text-xs text-gray-400">
                            {new Date(interest.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                    </div>
                    {canAct && (
                        <div className="flex gap-2">
                            <button onClick={() => handleApprove(interest.id)} disabled={isApproving || isRejecting}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50">
                                {isApproving ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <span>✓</span>}
                                Approve
                            </button>
                            <button onClick={() => handleReject(interest.id)} disabled={isApproving || isRejecting}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50">
                                {isRejecting ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" /> : <span>✕</span>}
                                Reject
                            </button>
                        </div>
                    )}
                    {interest.guardian_approved && (
                        <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-100">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <p className="text-xs text-emerald-700 font-medium">You approved this match</p>
                        </div>
                    )}
                    {!interest.guardian_approved && interest.status === "rejected" && (
                        <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-red-50 border border-red-100">
                            <span className="text-red-400 font-bold">✕</span>
                            <p className="text-xs text-red-600 font-medium">This interest was rejected</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const currentList = tabData[activeTab] ?? [];

    return (
        <>
            <Sidebar />

            {/* ── Top header (identical to AppBar) ───────────────── */}
            <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-100 shadow-sm
        flex items-center justify-between h-[64px] px-4 z-[99997]"
                style={{ minHeight: 64 }}>
                <Link to="/" className="flex items-center gap-2 h-full select-none shrink-0">
                    <img
                        src="https://marriage-sunnah-overseas.replit.app/logo.png"
                        alt="Logo"
                        className="h-10 w-auto"
                        draggable={false}
                        style={{ maxWidth: "146px" }}
                    />
                    <span className="font-extrabold text-xl text-primary hidden sm:inline"
                        style={{ letterSpacing: "0.5px" }}>
                        Marriage Sunnah Overseas
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex flex-row ml-6 gap-2 flex-1">
                    {ALL_TABS.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link key={item.name} to={item.to}
                                className={`relative flex flex-col items-center justify-center text-sm font-medium
                  px-3 py-2 rounded-sm transition-colors
                  ${isActive ? "bg-primary text-white" : "hover:bg-primary/10 text-gray-600"}`}>
                                <span className="relative">
                                    {isActive ? item.filledIcon : item.outlinedIcon}
                                    <NavBadge count={badgeMap[item.name]} />
                                </span>
                                <span className="text-xs mt-0.5">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Desktop user + logout */}
                <div className="hidden md:flex items-center gap-3 justify-end">
                    <span className="text-base font-medium text-gray-700 mr-2 hidden sm:inline">
                        Welcome, {name}
                    </span>
                    <button
                        className="flex items-center gap-2 p-1 px-2 rounded hover:bg-gray-50 border border-gray-200"
                        onClick={onLogout}>
                        <AvatarOrInitial avatar={avatar} name={name} />
                        <span className="text-sm font-medium ml-1">Logout</span>
                    </button>
                </div>

                {/* Mobile hamburger */}
                <div className="flex items-center ml-auto md:hidden">
                    <button
                        className="relative flex items-center justify-center rounded-full p-2 bg-transparent"
                        onClick={() => setSidebarOpen(true)}>
                        <MenuIcon className="w-7 h-7 text-gray-700" />
                        <NavBadge count={totalBadge} />
                    </button>
                </div>
            </header>

            {/* Spacer */}
            <div className="h-[64px] w-full" />

            {/* ── Dashboard content ───────────────────────────────── */}
            <div className="flex flex-col bg-gray-50" style={{ fontFamily: "Georgia, serif", minHeight: "calc(100vh - 64px)" }}>
                <div className="bg-white border-b border-gray-100 px-5 py-4 shadow-sm">
                    <h1 className="text-xl font-bold text-gray-900">Guardian Dashboard</h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Assalamu Alaikum, {name} — review your ward's interests
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3 px-4 pt-4">
                    {[
                        { label: "Pending", value: pendingInterests.length, color: "bg-amber-50 border-amber-100 text-amber-700" },
                        { label: "Approved", value: allInterests.filter(i => i.guardian_approved).length, color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
                        { label: "Rejected", value: allInterests.filter(i => i.status === "rejected").length, color: "bg-red-50 border-red-100 text-red-600" },
                    ].map(s => (
                        <div key={s.label} className={`rounded-2xl p-3 border ${s.color} text-center`}>
                            <p className="text-xl font-bold leading-none">{s.value}</p>
                            <p className="text-xs mt-1 opacity-70">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white border-b border-gray-100 px-4 mt-4">
                    <div className="flex gap-1 overflow-x-auto">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2
                  ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                                {tab.label}
                                {tab.badge > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                                        {tab.badge > 9 ? "9+" : tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4">
                    {loading ? (
                        <div className="flex flex-col gap-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : currentList.length === 0 ? (
                        <EmptyState
                            icon={activeTab === "pending" ? "⏳" : activeTab === "approved" ? "✅" : activeTab === "rejected" ? "✕" : "◈"}
                            title={activeTab === "pending" ? "No pending approvals" : `No ${activeTab} interests`}
                            subtitle={activeTab === "pending" ? "All caught up! No interests awaiting your review." : `No interests in this category yet.`}
                        />
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-3">
                            {currentList.map(interest => (
                                <InterestCard key={interest.id} interest={interest} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom spacer for mobile nav */}
                <div className="h-20 md:hidden" />
            </div>

            {/* ── Mobile bottom nav (identical to AppBar) ─────────── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 shadow-inner flex w-full items-stretch h-16 z-[99997] px-0"
                style={{
                    background: "rgba(255,255,255,0.81)",
                    backdropFilter: "blur(12px) saturate(1.3)",
                    WebkitBackdropFilter: "blur(12px) saturate(1.3)",
                    borderTop: "1px solid rgba(221,232,228,0.75)",
                }}>
                {ALL_TABS.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                        <Link key={item.name} to={item.to}
                            className={`relative flex flex-col items-center justify-center flex-1 min-w-0 h-full transition
                ${isActive ? "bg-primary text-white shadow-sm font-semibold" : "bg-primary text-white/60"}`}
                            style={{ transition: "all 0.18s cubic-bezier(.4,0,.2,1)" }}
                            tabIndex={0} role="button" aria-current={isActive ? "page" : undefined}>
                            <span className="relative flex items-center justify-center" style={{ width: 26, height: 26 }}>
                                {isActive ? item.filledIcon : item.outlinedIcon}
                                <NavBadge count={badgeMap[item.name]} />
                            </span>
                            <span className={isActive ? "text-active-foreground" : "text-inactive-foreground"}
                                style={{ fontSize: "0.93em", whiteSpace: "nowrap" }}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
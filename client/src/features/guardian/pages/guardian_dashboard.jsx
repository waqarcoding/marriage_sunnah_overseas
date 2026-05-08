import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import GuardianService from "../services/GuardianService";
import { useSocket } from "../../../sockets/SocketContext";
import { useNavigate } from "react-router-dom";
import AuthService from "../../auth/services/AuthService";


export default function GuardianDashboard() {
    const user = AuthService.getTokenData();
    const name = user?.name || "Guardian";
    const socketCtx = useSocket();

    const [activeTab, setActiveTab] = useState("pending");
    const [tabData, setTabData] = useState({
        pending: [],
        all: [],
        approved: [],
        rejected: []
    });
    const [loading, setLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState(null);

    // ✅ Single source of truth - load function
    const loadAll = useCallback(async () => {
        try {
            const res = await GuardianService.getPendingInterests({
                onSuccess: (res) => res,
                onFailed: (err) => { throw err; }
            });

            const data = res?.data || {};
            setTabData({
                pending: Array.isArray(data.pending) ? data.pending : [],
                all: Array.isArray(data.all) ? data.all : [],
                approved: Array.isArray(data.approved) ? data.approved : [],
                rejected: Array.isArray(data.rejected) ? data.rejected : [],
            });
            setLoading(false);
        } catch (err) {
            toast.error("Failed to load interests");
            setLoading(false);
        }
    }, []);

    // ✅ Initial load only
    useEffect(() => {
        loadAll();
    }, [loadAll]);

    // ✅ Socket-based real-time updates (NO POLLING!)
    useEffect(() => {
        if (!socketCtx?.socket || !socketCtx.connected) {
            console.log('⏳ Socket not ready for guardian dashboard');
            return;
        }

        console.log('🎧 Setting up guardian dashboard listeners');

        const handleNotification = (notification) => {
            console.log('🔔 Guardian dashboard notification:', notification);

            // ✅ Reload data on relevant events
            if ([
                'interest_received',
                'interest_accepted',
                'interest_declined',
                'guardian_approved',
                'guardian_rejected'
            ].includes(notification.type)) {
                console.log('📊 Reloading dashboard data...');
                loadAll();
            }
        };

        // ✅ Listen to specific interest events
        const handleInterestUpdate = (data) => {
            console.log('💌 Interest update received:', data);
            loadAll();
        };

        socketCtx.socket.on('notification', handleNotification);
        socketCtx.socket.on('interest_update', handleInterestUpdate);

        console.log('✅ Guardian dashboard listeners attached');

        return () => {
            console.log('🔇 Removing guardian dashboard listeners');
            socketCtx.socket.off('notification', handleNotification);
            socketCtx.socket.off('interest_update', handleInterestUpdate);
        };
    }, [socketCtx?.socket, socketCtx?.connected, loadAll]);

    // ✅ Optimistic approve with instant UI update
    const handleApprove = async (interestId) => {
        setLoadingAction(interestId);

        // ✅ OPTIMISTIC UPDATE - Move item immediately
        const interestToMove = tabData.pending.find(i => i.id === interestId);
        if (interestToMove) {
            setTabData(prev => ({
                ...prev,
                pending: prev.pending.filter(i => i.id !== interestId),
                approved: [{ ...interestToMove, status: 'approved' }, ...prev.approved],
                all: prev.all.map(i =>
                    i.id === interestId ? { ...i, status: 'approved' } : i
                )
            }));
        }

        try {
            await GuardianService.approveInterest(interestId, {
                onSuccess: () => {
                    toast.success("Interest approved! 🤝");
                    setLoadingAction(null);
                    // ✅ Confirm with server data (silent refresh)
                    loadAll();
                },
                onFailed: (err) => {
                    // ✅ ROLLBACK on failure
                    toast.error(err?.message || "Failed to approve");
                    setLoadingAction(null);
                    loadAll(); // Reload to restore correct state
                },
            });
        } catch (err) {
            console.error('Approve error:', err);
            setLoadingAction(null);
            loadAll();
        }
    };

    // ✅ Optimistic reject with instant UI update
    const handleReject = async (interestId) => {
        setLoadingAction(`rej_${interestId}`);

        // ✅ OPTIMISTIC UPDATE - Move item immediately
        const interestToMove = tabData.pending.find(i => i.id === interestId);
        if (interestToMove) {
            setTabData(prev => ({
                ...prev,
                pending: prev.pending.filter(i => i.id !== interestId),
                rejected: [{ ...interestToMove, status: 'rejected' }, ...prev.rejected],
                all: prev.all.map(i =>
                    i.id === interestId ? { ...i, status: 'rejected' } : i
                )
            }));
        }

        try {
            await GuardianService.rejectInterest(interestId, {
                onSuccess: () => {
                    toast.success("Interest rejected");
                    setLoadingAction(null);
                    // ✅ Confirm with server data (silent refresh)
                    loadAll();
                },
                onFailed: (err) => {
                    // ✅ ROLLBACK on failure
                    toast.error(err?.message || "Failed to reject");
                    setLoadingAction(null);
                    loadAll(); // Reload to restore correct state
                },
            });
        } catch (err) {
            console.error('Reject error:', err);
            setLoadingAction(null);
            loadAll();
        }
    };

    const TABS = [
        { id: "pending", label: "Pending", badge: tabData.pending.length },
        { id: "all", label: "All", badge: tabData.all.length },
        { id: "approved", label: "Approved" },
        { id: "rejected", label: "Rejected" },
    ];

    const currentList = tabData[activeTab] ?? [];

    const EMPTY_CONFIG = {
        pending: { title: "All caught up", subtitle: "No interests are awaiting your review right now." },
        all: { title: "No interests yet", subtitle: "Interests involving your wards will appear here." },
        approved: { title: "Nothing approved yet", subtitle: "Interests you approve will be listed here." },
        rejected: { title: "Nothing rejected", subtitle: "Interests you decline will be listed here." },
    };

    return (
        <div className="flex flex-col min-h-full"  >

            {/* ── Page header ── */}
            <div className="px-5 pt-6 pb-4">
                <h1 className="text-[26px] font-extrabold tracking-tight leading-tight mb-1"
                    style={{ color: "#111827", letterSpacing: "-0.03em" }}>
                    Guardian Dashboard
                </h1>
                <p className="text-sm font-medium" style={{ color: "#9ca3af" }}>
                    Assalamu Alaikum, {name} — review your ward's interests
                </p>
            </div>

            {/* ── Stats row ── */}
            <div className="grid grid-cols-3 gap-2.5 px-5 mb-5">
                <StatCard
                    label="Pending"
                    value={tabData.pending.length}
                    gradient="linear-gradient(135deg,#fef3c7,#fde68a)"
                    accent="#92400e"
                    isActive={activeTab === "pending"}
                    onClick={() => setActiveTab("pending")}
                />
                <StatCard
                    label="Approved"
                    value={tabData.approved.length}
                    gradient="linear-gradient(135deg,#d1fae5,#a7f3d0)"
                    accent="#065f46"
                    isActive={activeTab === "approved"}
                    onClick={() => setActiveTab("approved")}
                />
                <StatCard
                    label="Rejected"
                    value={tabData.rejected.length}
                    gradient="linear-gradient(135deg,#fee2e2,#fca5a5)"
                    accent="#991b1b"
                    isActive={activeTab === "rejected"}
                    onClick={() => setActiveTab("rejected")}
                />
            </div>

            {/* ── Tab pills ── */}
            <div className="px-5 mb-3">
                <div className="flex p-1 rounded-2xl gap-1"
                    style={{ background: "#ebebeb" }}>
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
                                style={{
                                    background: isActive ? "#fff" : "transparent",
                                    color: isActive ? "#1B4D3E" : "#9ca3af",
                                    boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                                }}
                            >
                                {tab.label}
                                {tab.badge > 0 && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none"
                                        style={{
                                            background: isActive ? "#1B4D3E" : "#d1d5db",
                                            color: isActive ? "#fff" : "#6b7280",
                                        }}>
                                        {tab.badge > 99 ? "99+" : tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── List ── */}
            <div className="flex-1 px-5 pb-24">
                {loading ? (
                    <div className="grid sm:grid-cols-2 gap-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-2xl p-4 animate-pulse bg-white"
                                style={{ border: "0.5px solid rgba(27,77,62,0.08)" }}>
                                <div className="h-1 rounded-full mb-3" style={{ background: "#e5e7eb" }} />
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-200" />
                                        <div className="h-3 w-16 rounded bg-gray-200" />
                                    </div>
                                    <div className="w-7 h-7 rounded-full bg-gray-200" />
                                    <div className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-200" />
                                        <div className="h-3 w-16 rounded bg-gray-200" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 h-9 rounded-xl bg-gray-200" />
                                    <div className="flex-1 h-9 rounded-xl bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : currentList.length === 0 ? (
                    <EmptyState
                        title={EMPTY_CONFIG[activeTab]?.title}
                        subtitle={EMPTY_CONFIG[activeTab]?.subtitle}
                    />
                ) : (
                    <AnimatePresence mode="popLayout">
                        <div className="grid sm:grid-cols-2 gap-3">
                            {currentList.map(interest => (
                                <InterestCard
                                    key={interest.id}
                                    interest={interest}
                                    loadingAction={loadingAction}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    activeTab={activeTab}
                                />
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}


// ── Helpers ───────────────────────────────────────────────────────────────────
const parseImages = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try { return JSON.parse(images); } catch { return []; }
};



// ── Filled SVG Icons ──────────────────────────────────────────────────────────
function IcoCheck({ size = 14, color = "#fff" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
    );
}
function IcoX({ size = 14, color = "#fff" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
    );
}
function IcoClock({ size = 14, color = "#92400e" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
        </svg>
    );
}
function IcoHeart({ size = 13, color = "#1B4D3E" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );
}
function IcoSparkle({ size = 36, color = "#1B4D3E" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} opacity="0.55">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
    );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 56 }) {
    if (src) {
        return (
            <img src={src} alt={name}
                style={{
                    width: size, height: size,
                    borderRadius: 16,
                    objectFit: "cover",
                    border: "2px solid #fff",
                    boxShadow: "0 2px 8px rgba(27,77,62,0.12)",
                    flexShrink: 0,
                }} />
        );
    }
    return (
        <div style={{
            width: size, height: size,
            borderRadius: 16,
            background: "linear-gradient(135deg,#1B4D3E,#2d7a5f)",
            color: "#fef3c7",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.4, fontWeight: 700,
            border: "2px solid #fff",
            boxShadow: "0 2px 8px rgba(27,77,62,0.12)",
            flexShrink: 0,
        }}>
            {name?.[0]?.toUpperCase() ?? "?"}
        </div>
    );
}

// ── Status Pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }) {
    const map = {
        pending: { bg: "#fef3c7", color: "#92400e", border: "#fde68a", label: "Pending", icon: <IcoClock size={11} color="#92400e" /> },
        accepted: { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0", label: "Accepted", icon: <IcoCheck size={11} color="#065f46" /> },
        approved: { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0", label: "Approved", icon: <IcoCheck size={11} color="#065f46" /> },
        declined: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5", label: "Declined", icon: <IcoX size={11} color="#991b1b" /> },
        rejected: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5", label: "Rejected", icon: <IcoX size={11} color="#991b1b" /> },
    };
    const s = map[status] || map.pending;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 999,
            fontSize: 10, fontWeight: 700, letterSpacing: 0.2,
            background: s.bg, color: s.color, border: `0.5px solid ${s.border}`,
            textTransform: "capitalize",
        }}>
            {s.icon}
            {s.label}
        </span>
    );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ title, subtitle }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 px-8 text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ background: "#eaf2ee" }}>
                <IcoSparkle size={36} color="#1B4D3E" />
            </div>
            <div>
                <p className="text-base font-bold mb-1" style={{ color: "#1B4D3E" }}>{title}</p>
                <p className="text-sm max-w-[260px] leading-relaxed" style={{ color: "#9ca3af" }}>{subtitle}</p>
            </div>
        </div>
    );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, gradient, accent, isActive, onClick }) {
    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className="relative rounded-2xl p-4 text-left overflow-hidden cursor-pointer border-none transition-shadow"
            style={{
                background: gradient,
                boxShadow: isActive
                    ? `0 0 0 2px ${accent}30`
                    : `0 2px 10px ${accent}40`, // Increase opacity to 0.25 → 0.40 in hex alpha


            }}
        >
            {/* Decorative blob */}
            <div className="absolute -top-2 -right-2 w-14 h-14 rounded-full opacity-20"
                style={{ background: "#fff" }} />

            <div className="relative">
                <p className="text-3xl font-extrabold leading-none mb-1.5"
                    style={{ color: accent, letterSpacing: "-0.04em" }}>
                    {value}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-80"
                    style={{ color: accent }}>
                    {label}
                </p>
            </div>
        </motion.button>
    );
}

// ── Interest Card ─────────────────────────────────────────────────────────────
function InterestCard({ interest, loadingAction, onApprove, onReject, activeTab }) {
    const sender = interest.fromProfile || {};
    const receiver = interest.toProfile || {};
    const senderAvatar = parseImages(sender.images)[0] || null;
    const receiverAvatar = parseImages(receiver.images)[0] || null;
    const isApproving = loadingAction === interest.id;
    const isRejecting = loadingAction === `rej_${interest.id}`;
    const navigate = useNavigate();
    const canAct = activeTab === "pending";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden bg-white"
            style={{
                border: "0.5px solid rgba(27,77,62,0.10)",
                boxShadow: "0 2px 12px rgba(27,77,62,0.06), 0 0 0 0.5px rgba(0,0,0,0.02)",
            }}
        >

            <div className="p-4">
                {/* Header — date + status */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold tracking-wide uppercase"
                        style={{ color: "#9ca3af" }}>
                        {new Date(interest.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                    <StatusPill status={interest.status} />
                </div>

                {/* People row */}
                <div className="flex items-center gap-3 mb-3">
                    {/* Sender */}
                    <button
                        onClick={() => navigate("/guardian/profile", { state: { profile: sender, profileReceiver: receiver, profileSender: sender } })}

                        className="flex flex-col items-center gap-1.5 flex-1 min-w-0 bg-transparent border-none p-0 cursor-pointer"
                    >
                        <Avatar src={senderAvatar} name={sender.name} size={70} />
                        <p className="text-xs font-bold truncate w-full text-center"
                            style={{ color: "#1B4D3E" }}>
                            {sender.name || "Unknown"}
                        </p>
                        {sender.city && (
                            <p className="text-[10px] truncate w-full text-center"
                                style={{ color: "#9ca3af", fontWeight: 500 }}>
                                {sender.city}
                            </p>
                        )}
                    </button>

                    {/* Connector with heart */}
                    <div className="flex flex-col items-center gap-1 px-2 shrink-0">
                        <div className="flex items-center">
                            <div className="w-3 h-px" style={{ background: "rgba(27,77,62,0.25)" }} />
                            <div className="w-7 h-7 rounded-full flex items-center justify-center"
                                style={{ background: "#eaf2ee", border: "0.5px solid rgba(27,77,62,0.15)" }}>
                                <IcoHeart size={13} color="#1B4D3E" />
                            </div>
                            <div className="w-3 h-px" style={{ background: "rgba(27,77,62,0.25)" }} />
                        </div>
                    </div>

                    {/* Receiver */}
                    <button
                        onClick={() => navigate("/guardian/profile", { state: { profile: receiver, profileReceiver: receiver, profileSender: sender } })}
                        className="flex flex-col items-center gap-1.5 flex-1 min-w-0 bg-transparent border-none p-0 cursor-pointer"
                    >
                        <Avatar src={receiverAvatar} name={receiver.name} size={70} />
                        <p className="text-xs font-bold truncate w-full text-center"
                            style={{ color: "#1B4D3E" }}>
                            {receiver.name || "Unknown"}
                        </p>
                        {receiver.city && (
                            <p className="text-[10px] truncate w-full text-center"
                                style={{ color: "#9ca3af", fontWeight: 500 }}>
                                {receiver.city}
                            </p>
                        )}
                    </button>
                </div>

                {/* Profession tags */}
                {(sender.profession || receiver.profession) && (
                    <div className="flex flex-wrap gap-1 mb-3 justify-center">
                        {sender.profession && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                                style={{ background: "#f0f5f3", color: "#1B4D3E", border: "0.5px solid rgba(27,77,62,0.10)" }}>
                                {sender.profession}
                            </span>
                        )}
                        {receiver.profession && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                                style={{ background: "#f0f5f3", color: "#1B4D3E", border: "0.5px solid rgba(27,77,62,0.10)" }}>
                                {receiver.profession}
                            </span>
                        )}
                    </div>
                )}

                {/* Actions / status note */}
                {canAct && (
                    <div className="flex gap-2 mt-2">
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => onApprove(interest.id)}
                            disabled={isApproving || isRejecting}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border-none cursor-pointer transition-all disabled:opacity-50"
                            style={{
                                background: "linear-gradient(135deg,#1B4D3E,#2d7a5f)",
                                color: "#fff",
                                boxShadow: "0 2px 8px rgba(27,77,62,0.25)",
                            }}
                        >
                            {isApproving ? (
                                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                <IcoCheck size={13} color="#fff" />
                            )}
                            Approve
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => onReject(interest.id)}
                            disabled={isApproving || isRejecting}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
                            style={{
                                background: "#fff",
                                color: "#dc2626",
                                border: "1px solid #fca5a5",
                            }}
                        >
                            {isRejecting ? (
                                <span className="w-3 h-3 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                                <IcoX size={13} color="#dc2626" />
                            )}
                            Reject
                        </motion.button>
                    </div>
                )}

                {activeTab === "approved" && (
                    <div className="flex items-center gap-2 py-2 px-3 rounded-xl"
                        style={{ background: "#f0fdf4", border: "0.5px solid #bbf7d0" }}>
                        <span className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "#16a34a" }}>
                            <IcoCheck size={11} color="#fff" />
                        </span>
                        <p className="text-[11px] font-semibold" style={{ color: "#15803d" }}>
                            You approved this match
                        </p>
                    </div>
                )}

                {activeTab === "rejected" && (
                    <div className="flex items-center gap-2 py-2 px-3 rounded-xl"
                        style={{ background: "#fef2f2", border: "0.5px solid #fecaca" }}>
                        <span className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "#dc2626" }}>
                            <IcoX size={11} color="#fff" />
                        </span>
                        <p className="text-[11px] font-semibold" style={{ color: "#b91c1c" }}>
                            You rejected this interest
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}


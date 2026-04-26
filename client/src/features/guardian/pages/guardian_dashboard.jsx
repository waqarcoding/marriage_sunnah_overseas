// @ts-nocheck
// features/guardian/pages/guardian_dashboard.jsx
// Works INSIDE GuardianLayout — no own header/nav

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import GuardianService from "../services/GuardianService";
import ProfileService from "../../profile/services/ProfileService";

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseImages = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try { return JSON.parse(images); } catch { return []; }
};


// ── Sub-components defined OUTSIDE main component (avoids remount loop) ───────
function Avatar({ src, name, size = "md" }) {
    const sizes = { sm: "w-9 h-9", md: "w-12 h-12", lg: "w-16 h-16" };
    return src ? (
        <img src={src} alt={name}
            className={`${sizes[size]} rounded-2xl object-cover border-2 border-white shadow-sm flex-shrink-0`} />
    ) : (
        <div className={`${sizes[size]} rounded-2xl font-bold flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm text-sm`}
            style={{ background: "var(--secondary)", color: "var(--primary)" }}>
            {name?.[0]?.toUpperCase() ?? "?"}
        </div>
    );
}

function StatusBadge({ label, variant = "default" }) {
    const styles = {
        default: { background: "var(--secondary)", color: "var(--primary)", border: "1px solid var(--secondary)" },
        pending: { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" },
        approved: { background: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" },
        rejected: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
    };
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
            style={styles[variant] || styles.default}>
            {label}
        </span>
    );
}

function EmptyState({ icon, title, subtitle }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-5xl">{icon}</span>
            <p className="font-semibold text-base" style={{ color: "var(--primary)" }}>{title}</p>
            <p className="text-sm text-center max-w-xs" style={{ color: "var(--primary)", opacity: 0.5 }}>{subtitle}</p>
        </div>
    );
}

// ✅ InterestCard defined OUTSIDE GuardianDashboard — prevents remount loop
function InterestCard({ interest, loadingAction, onApprove, onReject }) {
    const sender = interest.fromProfile || {};
    const receiver = interest.toProfile || {};
    const senderAvatar = parseImages(sender.images)[0] || null;
    const receiverAvatar = parseImages(receiver.images)[0] || null;
    const isApproving = loadingAction === interest.id;
    const isRejecting = loadingAction === `rej_${interest.id}`;
    const canAct = !interest.guardian_approved && interest.status !== "rejected";

    return (
        <div className="rounded-2xl border shadow-sm overflow-hidden"
            style={{ background: "var(--primary-foreground)", borderColor: "var(--secondary)" }}>
            <div className="h-0.5" style={{ background: "var(--primary)" }} />
            <div className="p-4">
                {/* Sender ↔ Receiver */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <Avatar src={senderAvatar} name={sender.name} size="md" />
                        <p className="text-xs font-semibold truncate w-full text-center" style={{ color: "var(--primary)" }}>
                            {sender.name || "Unknown"}
                        </p>
                        <p className="text-xs truncate w-full text-center" style={{ color: "var(--primary)", opacity: 0.5 }}>
                            {sender.city || ""}
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0 px-1">
                        <div className="flex items-center gap-1">
                            <div className="w-5 h-px" style={{ background: "var(--primary)", opacity: 0.3 }} />
                            <span style={{ color: "var(--primary)" }}>♡</span>
                            <div className="w-5 h-px" style={{ background: "var(--primary)", opacity: 0.3 }} />
                        </div>
                        <StatusBadge
                            label={interest.status}
                            variant={interest.status === "accepted" ? "approved" : interest.status === "rejected" ? "rejected" : "pending"} />
                        <StatusBadge
                            label={interest.guardian_approved ? "Approved ✓" : "Awaiting"}
                            variant={interest.guardian_approved ? "approved" : "pending"} />
                    </div>

                    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <Avatar src={receiverAvatar} name={receiver.name} size="md" />
                        <p className="text-xs font-semibold truncate w-full text-center" style={{ color: "var(--primary)" }}>
                            {receiver.name || "Unknown"}
                        </p>
                        <p className="text-xs truncate w-full text-center" style={{ color: "var(--primary)", opacity: 0.5 }}>
                            {receiver.city || ""}
                        </p>
                    </div>
                </div>

                {/* Professions + date */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {sender.profession && (
                        <span className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: "var(--secondary)", color: "var(--primary)" }}>
                            {sender.profession}
                        </span>
                    )}
                    {receiver.profession && (
                        <span className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: "var(--secondary)", color: "var(--primary)" }}>
                            {receiver.profession}
                        </span>
                    )}
                    <span className="ml-auto text-xs" style={{ color: "var(--primary)", opacity: 0.4 }}>
                        {new Date(interest.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                </div>

                {/* Actions */}
                {canAct && (
                    <div className="flex gap-2">
                        <button onClick={() => onApprove(interest.id)} disabled={isApproving || isRejecting}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold active:scale-95 transition-all disabled:opacity-50"
                            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                            {isApproving
                                ? <span className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                                    style={{ borderColor: "var(--primary-foreground)" }} />
                                : "✓"}
                            Approve
                        </button>
                        <button onClick={() => onReject(interest.id)} disabled={isApproving || isRejecting}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50">
                            {isRejecting
                                ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                                : "✕"}
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
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GuardianDashboard() {



    const [activeTab, setActiveTab] = useState("pending");
    const [pendingInterests, setPendingInterests] = useState([]);
    const [allInterests, setAllInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    // Add state for the current user info
    const [user, setUser] = useState(null);
    const [loadingAction, setLoadingAction] = useState(null);

    const loadAll = () => {
        setLoading(true);
        GuardianService.getPendingInterests({
            onSuccess: (res) => {
                const list = res?.data ?? [];
                setPendingInterests(list.filter(i => !i.guardian_approved && i.status !== "rejected"));
                setAllInterests(list);
                setLoading(false);
            },
            onFailed: () => {
                toast.error("Failed to load interests");
                setLoading(false);
            },
        });
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await ProfileService.getCurrentUser();
                setUser(res?.data ?? []);

                console.log(res);

            } catch (err) {
                console.error(err)
                toast.error(err.message || 'Failed to load')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

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

    const TABS = [
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

    const currentList = tabData[activeTab] ?? [];

    return (
        <div className="flex flex-col min-h-full" style={{ background: "var(--secondary)" }}>

            {/* Page header */}
            <div className="px-5 py-4 border-b" style={{ background: "var(--primary-foreground)", borderColor: "var(--secondary)" }}>
                <h1 className="text-xl font-bold" style={{ color: "var(--primary)" }}>Guardian Dashboard</h1>
                <p className="text-xs mt-0.5" style={{ color: "var(--primary)", opacity: 0.5 }}>
                    Assalamu Alaikum, {name} — review your ward's interests
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 px-4 pt-4">
                {[
                    { label: "Pending", value: pendingInterests.length, bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
                    { label: "Approved", value: allInterests.filter(i => i.guardian_approved).length, bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
                    { label: "Rejected", value: allInterests.filter(i => i.status === "rejected").length, bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl p-3 border text-center"
                        style={{ background: s.bg, borderColor: s.border, color: s.color }}>
                        <p className="text-xl font-bold leading-none">{s.value}</p>
                        <p className="text-xs mt-1 opacity-70">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="border-b px-4 mt-4" style={{ background: "var(--primary-foreground)", borderColor: "var(--secondary)" }}>
                <div className="flex gap-1 overflow-x-auto">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2"
                            style={{
                                borderColor: activeTab === tab.id ? "var(--primary)" : "transparent",
                                color: "var(--primary)",
                                opacity: activeTab === tab.id ? 1 : 0.45,
                            }}>
                            {tab.label}
                            {tab.badge > 0 && (
                                <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                                    {tab.badge > 9 ? "9+" : tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="rounded-2xl p-4 border animate-pulse"
                                style={{ background: "var(--primary-foreground)", borderColor: "var(--secondary)" }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl" style={{ background: "var(--secondary)" }} />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 rounded w-1/3" style={{ background: "var(--secondary)" }} />
                                        <div className="h-3 rounded w-1/2" style={{ background: "var(--secondary)" }} />
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl" style={{ background: "var(--secondary)" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : currentList.length === 0 ? (
                    <EmptyState
                        icon={activeTab === "pending" ? "⏳" : activeTab === "approved" ? "✅" : activeTab === "rejected" ? "✕" : "◈"}
                        title={activeTab === "pending" ? "No pending approvals" : `No ${activeTab} interests`}
                        subtitle={activeTab === "pending" ? "All caught up!" : `No interests in this category yet.`}
                    />
                ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                        {currentList.map(interest => (
                            <InterestCard
                                key={interest.id}
                                interest={interest}
                                loadingAction={loadingAction}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
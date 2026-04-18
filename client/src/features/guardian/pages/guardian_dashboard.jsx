import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import GuardianService from "../api/GuardianService";

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

export default function GuardianDashboard({ }) {
    const [activeTab, setActiveTab] = useState("pending");
    const [pendingInterests, setPendingInterests] = useState([]);
    const [allInterests, setAllInterests] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const InterestCard = ({ interest }) => {
        // In InterestCard — change these two lines:
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
        <div className="flex flex-col h-full bg-gray-50" style={{ fontFamily: "Georgia, serif" }}>
            <div className="bg-white border-b border-gray-100 px-5 py-4 shadow-sm">
                <h1 className="text-xl font-bold text-gray-900">Guardian Dashboard</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                    Assalamu Alaikum, {"Guardian"} — review your ward's interests
                </p>
            </div>
            <div className="grid grid-cols-3 gap-3 px-4 pt-4">
                {[
                    { label: "Pending", value: pendingInterests.length, color: "bg-amber-50   border-amber-100   text-amber-700" },
                    { label: "Approved", value: allInterests.filter(i => i.guardian_approved).length, color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
                    { label: "Rejected", value: allInterests.filter(i => i.status === "rejected").length, color: "bg-red-50     border-red-100     text-red-600" },
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
            <div className="h-20 md:hidden" />
        </div>
    );
}
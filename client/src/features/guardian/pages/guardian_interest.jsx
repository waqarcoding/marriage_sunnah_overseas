// @ts-nocheck
// features/guardian/pages/guardian_interest.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, X, MessageCircle, MapPin, GraduationCap, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import InterestService from "../../interest/services/InterestService";
import ChatService from "../../chat/services/ChatService";

const tabs = ["Received", "Sent", "Accepted"];

const parseImages = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try { return JSON.parse(images); } catch { return []; }
};

function isOnline(dateStr) {
    if (!dateStr) return false;
    return (Date.now() - new Date(dateStr)) / 1000 < 3600;
}

function Avatar({ src, name, size = "md" }) {
    const sizes = { sm: "w-10 h-10", md: "w-14 h-14", lg: "w-20 h-20" };
    return src ? (
        <img src={src} alt={name} className={`${sizes[size]} rounded-2xl object-cover border-2 border-white shadow`} />
    ) : (
        <div className={`${sizes[size]} rounded-2xl flex items-center justify-center font-bold border-2 border-white shadow`}
            style={{ background: "var(--secondary)", color: "var(--primary)", fontSize: size === "sm" ? 16 : 20 }}>
            {name?.[0]?.toUpperCase() ?? "?"}
        </div>
    );
}

function EmptyState({ tab }) {
    const config = {
        Received: { icon: "💝", title: "No received interests", desc: "No interests received on behalf of your ward yet." },
        Sent: { icon: "💌", title: "No sent interests", desc: "No interests sent on behalf of your ward yet." },
        Accepted: { icon: "💞", title: "No matches yet", desc: "Accepted interests will appear here." },
    };
    const { icon, title, desc } = config[tab] || config.Received;
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                style={{ background: "var(--accent)" }}>{icon}</div>
            <h3 className="text-base font-semibold" style={{ color: "var(--primary)" }}>{title}</h3>
            <p className="text-sm text-center max-w-xs" style={{ color: "var(--primary)", opacity: 0.5 }}>{desc}</p>
        </div>
    );
}

export default function GuardianInterest() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Received");
    const [tabData, setTabData] = useState({ sent: [], received: [], matches: [] });
    const [loading, setLoading] = useState(false);
    const [dialog, setDialog] = useState(null);

    let currentUserId = null;
    try { currentUserId = JSON.parse(atob(localStorage.getItem("jwtToken").split(".")[1]))?.id; } catch { }

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await InterestService.getallInterests();
            const data = res?.data || {};
            setTabData({
                sent: Array.isArray(data.sent) ? data.sent : [],
                received: Array.isArray(data.received) ? data.received : [],
                matches: Array.isArray(data.matches) ? data.matches : [],
            });
        } catch (err) {
            toast.error(err.message || "Failed to load");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const items = activeTab === "Sent" ? tabData.sent : activeTab === "Received" ? tabData.received : tabData.matches;
    const counts = { Sent: tabData.sent.length, Received: tabData.received.length, Accepted: tabData.matches.length };

    const resolveProfile = (item) => {
        if (activeTab === "Sent") return item.toProfile;
        if (activeTab === "Received") return item.fromProfile;
        return item.from_user === currentUserId ? item.toProfile : item.fromProfile;
    };

    const handleConfirm = async () => {
        if (!dialog) return;
        const { type, interestId } = dialog;
        setDialog(null);
        try {
            if (type === "accept") { await InterestService.accept(interestId); toast.success("Interest accepted!"); }
            else { await InterestService.decline(interestId); toast.success("Interest declined."); }
            fetchData();
        } catch (err) { toast.error(err.message || "Action failed"); }
    };

    const handleChat = async (profile) => {
        if (!profile?.individual_id) return;
        try { await ChatService.addConversationUser(profile.individual_id); } catch { }
        navigate(`/chats?receiver_id=${profile.individual_id}`);
    };

    return (
        <div className="flex flex-col min-h-full" style={{ background: "var(--secondary)" }}>

            {/* Page header */}
            <div className="px-5 py-4 border-b" style={{ background: "var(--primary-foreground)", borderColor: "var(--secondary)" }}>
                <h1 className="text-lg font-bold" style={{ color: "var(--primary)" }}>Ward's Interests</h1>
                <p className="text-xs mt-0.5" style={{ color: "var(--primary)", opacity: 0.5 }}>Review and manage interests on behalf of your ward</p>
            </div>

            {/* Tabs */}
            <div className="border-b px-4" style={{ background: "var(--primary-foreground)", borderColor: "var(--secondary)" }}>
                <div className="flex gap-4">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className="py-3 text-sm font-medium border-b-2 transition-all"
                            style={{
                                borderColor: activeTab === tab ? "var(--primary)" : "transparent",
                                color: "var(--primary)",
                                opacity: activeTab === tab ? 1 : 0.45,
                            }}>
                            {tab}
                            <span className="ml-1.5 text-xs">({counts[tab]})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {loading ? (
                    <div className="grid grid-cols-2 gap-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-2xl animate-pulse aspect-[3/4]"
                                style={{ background: "var(--primary-foreground)" }} />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState tab={activeTab} />
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {items.map((item, idx) => {
                            const profile = resolveProfile(item);
                            if (!profile) return null;
                            const images = parseImages(profile.images);
                            const img = images[0] || null;

                            return (
                                <motion.div key={item.id ?? idx} layout
                                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }} whileHover={{ scale: 1.02 }}
                                    className="relative cursor-pointer"
                                    onClick={() => navigate("/profile", { state: { profile: { ...profile, images } } })}>
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md"
                                        style={{ background: "var(--primary-foreground)" }}>
                                        {img ? (
                                            <img src={img} alt={profile.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl font-bold"
                                                style={{ background: "var(--secondary)", color: "var(--primary)" }}>
                                                {profile.name?.[0]?.toUpperCase() ?? "?"}
                                            </div>
                                        )}

                                        {/* Gradient */}
                                        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

                                        {/* Info */}
                                        <div className="absolute bottom-3 left-3 right-3 text-white z-10">
                                            <p className="font-bold text-sm leading-tight">
                                                {profile.name}{profile.age ? `, ${profile.age}` : ""}
                                            </p>
                                            {(profile.city || profile.country) && (
                                                <p className="text-xs opacity-80 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3" />
                                                    {[profile.city, profile.country].filter(Boolean).join(", ")}
                                                </p>
                                            )}
                                            {profile.education && (
                                                <p className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                                                    <GraduationCap className="w-3 h-3" />{profile.education}
                                                </p>
                                            )}

                                            {/* Status */}
                                            <div className="mt-1.5">
                                                {item.status === "accepted"
                                                    ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/80">✓ Accepted</span>
                                                    : item.status === "declined"
                                                        ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/80">✗ Declined</span>
                                                        : <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/80">⏳ Pending</span>}
                                            </div>

                                            {item.status === "accepted" && (
                                                <button onClick={e => { e.stopPropagation(); handleChat(profile); }}
                                                    className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold"
                                                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                                                    <MessageCircle className="w-3.5 h-3.5" /> Chat
                                                </button>
                                            )}
                                        </div>

                                        {/* Accept/Decline — Received only */}
                                        {activeTab === "Received" && item.status === "pending" && (
                                            <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
                                                <motion.button whileTap={{ scale: 0.9 }}
                                                    onClick={e => { e.stopPropagation(); setDialog({ type: "accept", interestId: item.id, name: profile.name }); }}
                                                    className="p-2 rounded-full shadow-md"
                                                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                                                    <Heart className="w-4 h-4" />
                                                </motion.button>
                                                <motion.button whileTap={{ scale: 0.9 }}
                                                    onClick={e => { e.stopPropagation(); setDialog({ type: "decline", interestId: item.id, name: profile.name }); }}
                                                    className="p-2 rounded-full shadow-md bg-white/20">
                                                    <X className="w-4 h-4 text-white" />
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Dialog */}
            <AnimatePresence>
                {dialog && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
                        onClick={() => setDialog(null)}>
                        <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
                            className="rounded-3xl p-6 w-full max-w-sm"
                            style={{ background: "var(--primary-foreground)" }}
                            onClick={e => e.stopPropagation()}>
                            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                                style={{ background: dialog.type === "accept" ? "#d1fae5" : "#fee2e2" }}>
                                {dialog.type === "accept"
                                    ? <Heart className="w-7 h-7 text-emerald-600" />
                                    : <X className="w-7 h-7 text-red-500" />}
                            </div>
                            <h3 className="text-lg font-bold text-center mb-2" style={{ color: "var(--primary)" }}>
                                {dialog.type === "accept" ? "Approve this interest?" : "Decline this interest?"}
                            </h3>
                            <p className="text-sm text-center mb-6" style={{ color: "var(--primary)", opacity: 0.6 }}>
                                {dialog.type === "accept"
                                    ? `Approving ${dialog.name}'s interest on behalf of your ward.`
                                    : `Declining ${dialog.name}'s interest on behalf of your ward.`}
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setDialog(null)}
                                    className="flex-1 py-3 rounded-2xl text-sm font-medium border"
                                    style={{ borderColor: "var(--secondary)", color: "var(--primary)", background: "var(--secondary)" }}>
                                    Cancel
                                </button>
                                <button onClick={handleConfirm}
                                    className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
                                    style={{ background: dialog.type === "accept" ? "#10b981" : "#ef4444" }}>
                                    {dialog.type === "accept" ? "Yes, Approve" : "Yes, Decline"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MapPin, X, Lock, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InterestService from "../services/InterestService";
import ChatService from "../../chat/services/ChatService";
import { toast } from "react-toastify";
import ImageAvatar from "../../../ui/image";
import ProfileCard from "../components/interest_item";
import PremiumBanner from "../components/premium_banner";
import AuthService from "../../auth/services/AuthService";
import { useSocket } from "../../../sockets/SocketContext";
import PageHeader from "../../../ui/page_header";




async function isSubscribed() {
    return await AuthService.isPro();
}

function preloadImage(src) {
    if (!src || typeof src !== "string") return Promise.resolve();
    return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = src;
    });
}

async function cacheImages(images) {
    if (!Array.isArray(images)) return;
    await Promise.all(images.map(preloadImage));
}

function parseImages(raw) {
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw || "[]"); } catch { return []; }
}

function isOnline(dateStr) {
    if (!dateStr) return false;
    return Math.floor((Date.now() - new Date(dateStr)) / 1000) < 3600;
}

function formatLastSeen(dateStr) {
    if (!dateStr) return "";
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ tab, onExplore }) {
    const config = {
        Received: {
            icon: (
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                    <path d="M32 54s-22-13-22-28c0-7.7 6.3-14 14-14 4.5 0 8.5 2.1 11 5.4C37.5 14.1 41.5 12 46 12c7.7 0 14 6.3 14 14 0 15-28 28-28 28z" fill="rgba(27,77,62,0.08)" stroke="rgba(27,77,62,0.25)" strokeWidth="1.5" />
                </svg>
            ),
            title: "No interests received yet",
            desc: "When someone sends you an interest, it will appear here.",
            action: null,
        },
        Sent: {
            icon: (
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                    <path d="M8 20C8 17.8 9.8 16 12 16h40c2.2 0 4 1.8 4 4v24c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V20z" fill="rgba(27,77,62,0.08)" stroke="rgba(27,77,62,0.25)" strokeWidth="1.5" />
                    <path d="M8 20l24 16 24-16" stroke="rgba(27,77,62,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
            title: "No interests sent yet",
            desc: "Browse profiles and send your first interest to start connecting.",
            action: "Explore Profiles",
        },
        Accepted: {
            icon: (
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                    <path d="M32 54s-22-13-22-28c0-7.7 6.3-14 14-14 4.5 0 8.5 2.1 11 5.4C37.5 14.1 41.5 12 46 12c7.7 0 14 6.3 14 14 0 15-28 28-28 28z" fill="rgba(27,77,62,0.08)" stroke="rgba(27,77,62,0.25)" strokeWidth="1.5" />
                </svg>
            ),
            title: "No matches yet",
            desc: "When someone accepts your interest, you'll see them here.",
            action: null,
        },
        Rejected: {
            icon: (
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                    <circle cx="32" cy="32" r="20" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.25)" strokeWidth="1.5" />
                    <path d="M22 22l20 20M42 22L22 42" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
            title: "No rejected interests",
            desc: "Interests that were declined will appear here.",
            action: null,
        },
    };
    const { icon, title, desc, action } = config[tab] || config.Sent;
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center py-20 px-8 gap-5"
        >
            <div className="relative">
                <div
                    className="w-24 h-24 rounded-3xl flex items-center justify-center"
                    style={{
                        background: "linear-gradient(135deg, rgba(27,77,62,0.06) 0%, rgba(27,77,62,0.12) 100%)",
                        border: "1px solid rgba(27,77,62,0.1)",
                        boxShadow: "0 8px 32px rgba(27,77,62,0.08)",
                    }}
                >
                    {icon}
                </div>
            </div>
            <div className="text-center flex flex-col gap-2">
                <h3
                    className="text-base font-semibold"
                    style={{ color: "var(--primary, #1B4D3E)", letterSpacing: "-0.01em" }}
                >
                    {title}
                </h3>
                <p className="text-sm leading-relaxed max-w-[220px] mx-auto" style={{ color: "#9ca3af" }}>
                    {desc}
                </p>
            </div>
            {action && (
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={onExplore}
                    className="px-6 py-2.5 rounded-2xl text-sm font-semibold text-white"
                    style={{
                        background: "linear-gradient(135deg, var(--primary,#1B4D3E), #2d7a5f)",
                        boxShadow: "0 4px 16px rgba(27,77,62,0.25)",
                    }}
                >
                    {action} →
                </motion.button>
            )}
        </motion.div>
    );
}

// ── Skeleton Loader ───────────────────────────────────────────────────────────
function SkeletonGrid() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="rounded-[20px] overflow-hidden animate-pulse"
                    style={{
                        aspectRatio: "3/4",
                        background: "transparent",
                    }}
                >
                    <div
                        className="w-full h-full"
                        style={{
                            background: "linear-gradient(135deg, rgba(27,77,62,0.02) 0%, rgba(27,77,62,0.09) 100%)"
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ dialog, onConfirm, onCancel }) {
    if (!dialog) return null;
    const isAccept = dialog.type === "accept";
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="rounded-3xl p-6 w-full max-w-sm"
                style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.25)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isAccept ? "bg-green-500/20" : "bg-red-500/20"}`}>
                    {isAccept
                        ? <Heart className="w-8 h-8 text-green-400" />
                        : <X className="w-8 h-8 text-red-400" />}
                </div>
                <h3 className="text-xl text-center text-white font-bold mb-2">
                    {isAccept ? "Accept Interest?" : "Decline Interest?"}
                </h3>
                <p className="text-center text-white/70 text-sm mb-6">
                    {isAccept
                        ? `You are about to accept ${dialog.name}'s interest. This will allow you to chat.`
                        : `You are about to decline ${dialog.name}'s interest. This cannot be undone.`}
                </p>
                <div className="flex gap-3">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-2xl text-white/80 text-sm font-medium"
                        style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={onConfirm}
                        className={`flex-1 py-3 rounded-2xl text-white text-sm font-bold ${isAccept ? "bg-green-500" : "bg-red-500"}`}
                    >
                        {isAccept ? "Yes, Accept" : "Yes, Decline"}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Two-Tab Switcher ──────────────────────────────────────────────────────────
function TwoTabSwitcher({ activeTab, onSelect, sentCount, receivedCount, isPro }) {
    return (
        <div className="px-4 pt-4 pb-2">
            <div
                className="flex p-1 rounded-2xl"
                style={{ background: "#ebebeb" }}
            >
                {/* Sent */}
                <button
                    onClick={() => onSelect("Sent")}
                    className="relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                    style={{
                        background: activeTab === "Sent" ? "#fff" : "transparent",
                        color: activeTab === "Sent" ? "var(--primary,#1B4D3E)" : "#9ca3af",
                        boxShadow: activeTab === "Sent" ? "0 1px 6px rgba(0,0,0,0.10)" : "none",
                    }}
                >
                    <span>Sent</span>
                    {sentCount > 0 && (
                        <span
                            className="text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none"
                            style={{
                                background: activeTab === "Sent" ? "var(--primary,#1B4D3E)" : "#d1d5db",
                                color: activeTab === "Sent" ? "#fff" : "#6b7280",
                            }}
                        >
                            {sentCount}
                        </span>
                    )}
                </button>

                {/* Received — pro gated */}
                <button
                    onClick={() => {
                        if (!isPro) return;
                        onSelect("Received");
                    }}
                    className="relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                    style={{
                        background: activeTab === "Received" ? "#fff" : "transparent",
                        color: activeTab === "Received" ? "var(--primary,#1B4D3E)" : isPro ? "#9ca3af" : "#c4b5a0",
                        boxShadow: activeTab === "Received" ? "0 1px 6px rgba(0,0,0,0.10)" : "none",
                        opacity: isPro ? 1 : 0.75,
                    }}
                >
                    <span>Received</span>
                    {receivedCount > 0 && (
                        <span
                            className="text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none"
                            style={{
                                background: activeTab === "Received" ? "var(--primary,#1B4D3E)" : "#d1d5db",
                                color: activeTab === "Received" ? "#fff" : "#6b7280",
                            }}
                        >
                            {receivedCount}
                        </span>
                    )}
                    {!isPro && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff" }}>
                            <Crown className="w-2.5 h-2.5" />
                            PRO
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InterestPage() {
    const [isPro, setIsPro] = useState(null);
    const navigate = useNavigate();
    const currentUserId = AuthService.getTokenData().id;
    const socketCtx = useSocket();

    const [activeTab, setActiveTab] = useState("Sent");
    const [tabData, setTabData] = useState({ sent: [], received: [], matches: [], rejected: [] });
    const [loading, setLoading] = useState(false);
    const [dialog, setDialog] = useState(null);
    const cachedUrlsRef = useRef(new Set());

    // ✅ Helper to get role-based paths
    const getRolePath = useCallback((path) => {
        const role = AuthService.getUserRole();
        const prefix = role === 'guardian' ? '/guardian' : '/individual';
        return `${prefix}${path}`;
    }, []);

    // ✅ Fetch Pro status
    useEffect(() => {
        const fetchIsPro = async () => {
            try {
                const res = await AuthService.isPro();
                setIsPro(res);
            } catch {
                setIsPro(false);
            }
        };
        fetchIsPro();
    }, []);

    // ✅ Clear interest badge on mount
    useEffect(() => {
        if (socketCtx) socketCtx.setInterestCount(0);

        const fetchCount = async () => {
            try {
                const response = await InterestService.pendingInterestCount();
                if (response.success && socketCtx) {
                    socketCtx.setInterestCount(response.data?.count || 0);
                }
            } catch (error) {
                console.error('❌ InterestPage: Error fetching interest count:', error);
            }
        };

        const timeoutId = setTimeout(fetchCount, 500);
        return () => clearTimeout(timeoutId);
    }, [socketCtx]);

    // ✅ Single source of truth - fetch function
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await InterestService.getallInterests();
            const data = res?.data || {};
            setTabData({
                sent: Array.isArray(data.sent) ? data.sent : [],
                received: Array.isArray(data.received) ? data.received : [],
                matches: Array.isArray(data.matches) ? data.matches : [],
                rejected: Array.isArray(data.rejected) ? data.rejected : [],
            });
        } catch (err) {
            toast.error(err?.message || "Failed to load interests");
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Initial load only
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ✅ Socket-based real-time updates
    useEffect(() => {
        if (!socketCtx?.socket || !socketCtx.connected) {
            console.log('⏳ Socket not ready for interest page');
            return;
        }

        console.log('🎧 Setting up interest page listeners');

        const handleNotification = (notification) => {
            console.log('🔔 Interest page notification:', notification);

            // ✅ Reload data on relevant events
            if ([
                'interest_received',
                'interest_accepted',
                'interest_declined',
                'interest_cancelled',
                'new_match'
            ].includes(notification.type)) {
                console.log('💌 Reloading interest data...');
                fetchData();
            }
        };

        socketCtx.socket.on('notification', handleNotification);

        console.log('✅ Interest page listeners attached');

        return () => {
            console.log('🔇 Removing interest page listeners');
            socketCtx.socket.off('notification', handleNotification);
        };
    }, [socketCtx?.socket, socketCtx?.connected, fetchData]);

    // ✅ Cache images when data changes
    useEffect(() => {
        const urls = [];
        [
            ...(tabData.sent || []).map(i => i.toProfile),
            ...(tabData.received || []).map(i => i.fromProfile),
            ...(tabData.matches || []).map(i => i.from_user === currentUserId ? i.toProfile : i.fromProfile),
            ...(tabData.rejected || []).map(i => i.from_user === currentUserId ? i.toProfile : i.fromProfile),
        ].forEach(profile => {
            parseImages(profile?.images).forEach(url => {
                if (url && !cachedUrlsRef.current.has(url)) {
                    cachedUrlsRef.current.add(url);
                    urls.push(url);
                }
            });
        });
        if (urls.length) cacheImages(urls);
    }, [tabData, currentUserId]);

    const handleOpenProfile = (profile) => {
        if (!profile) { console.warn("handleOpenProfile: No profile supplied"); return; }
        try {
            navigate(getRolePath("/profile"), { state: { profile }, replace: false });
        } catch (e) {
            console.error("handleOpenProfile: navigation error", e);
        }
    };

    const handleStartChat = async (profile) => {
        if (!profile?.individual_id) { toast.error("Invalid profile"); return; }

        try {
            await ChatService.addConversationUser(profile.individual_id);
        } catch (err) {
            if (err?.response?.status !== 409) {
                toast.error("Failed to start chat");
                return;
            }
        }

        navigate(`${getRolePath("/chats")}?receiver_id=${profile.individual_id}`, {
            state: { receiver: { id: profile.individual_id, name: profile.name } },
        });
    };

    // ✅ Optimistic accept/decline with instant UI update
    const handleConfirm = async () => {
        const { type, interestId, interest } = dialog;
        setDialog(null);

        // ✅ OPTIMISTIC UPDATE
        if (type === "accept") {
            setTabData(prev => ({
                ...prev,
                received: prev.received.filter(i => i.id !== interestId),
                matches: [interest, ...prev.matches]
            }));
        } else {
            setTabData(prev => ({
                ...prev,
                received: prev.received.filter(i => i.id !== interestId),
                rejected: [{ ...interest, status: 'rejected' }, ...prev.rejected]
            }));
        }

        try {
            if (type === "accept") {
                await InterestService.accept(interestId);
                toast.success("Interest accepted! 🎉");
            } else {
                await InterestService.decline(interestId);
                toast.success("Interest declined.");
            }
            // ✅ Silent refresh to confirm server state
            fetchData();
        } catch (err) {
            toast.error(err?.message || "Action failed");
            // ✅ ROLLBACK on failure
            fetchData();
        }
    };

    // Merge all statuses into two tabs
    const sentAll = [
        ...(tabData.sent || []),
        ...(tabData.matches || []).filter(i => i.from_user === currentUserId),
        ...(tabData.rejected || []).filter(i => i.from_user === currentUserId),
    ];

    const receivedAll = [
        ...(tabData.received || []),
        ...(tabData.matches || []).filter(i => i.from_user !== currentUserId),
        ...(tabData.rejected || []).filter(i => i.from_user !== currentUserId),
    ];

    const interests = activeTab === "Sent" ? sentAll : receivedAll;
    const sentCount = sentAll.length;
    const receivedCount = receivedAll.length;

    // If non-pro tries to land on Received, snap back to Sent
    useEffect(() => {
        if (!isPro && activeTab === "Received") setActiveTab("Sent");
    }, [isPro, activeTab]);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <PageHeader
                title="Interests"
                subtitle="Souls seeking halal connection with you"
            />


            {/* ── Two-Tab Switcher (sticky) ── */}
            <div
                className="sticky top-0 z-20"
                style={{

                    boxShadow: "0 1px 0 0 rgba(27,77,62,0.06)",
                }}
            >
                <TwoTabSwitcher
                    activeTab={activeTab}
                    onSelect={setActiveTab}
                    sentCount={sentCount}
                    receivedCount={receivedCount}
                    isPro={isPro}
                />
            </div>

            {/* ── Content ── */}
            <div style={{ flex: 1, overflow: "auto" }}>
                {/* Premium Banner */}
                {isPro === false && (
                    <PremiumBanner
                        onUpgrade={() => navigate("/subscription")}
                        likedCount={receivedCount}
                    />
                )}

                <div className="px-3 sm:px-4 pt-3 pb-3">
                    {/* Loading skeletons */}
                    {loading && <SkeletonGrid />}

                    {/* Empty state */}
                    {!loading && interests.length === 0 && (
                        <EmptyState
                            tab={activeTab}
                            onExplore={() => navigate(getRolePath("/explore"))}
                        />
                    )}

                    {/* Grid */}
                    {!loading && interests.length > 0 && (
                        <AnimatePresence>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {interests.map((item, i) => {
                                    const profile = activeTab === "Sent"
                                        ? item.toProfile
                                        : item.fromProfile;

                                    if (!profile) return null;

                                    return (
                                        <ProfileCard
                                            key={item.id ?? i}
                                            interest={item}
                                            profile={profile}
                                            images={parseImages(profile.images)}
                                            activeTab={activeTab}
                                            onOpenProfile={() => handleOpenProfile(profile)}
                                            onStartChat={handleStartChat}
                                            onAccept={(id, name) => setDialog({
                                                type: "accept",
                                                interestId: id,
                                                name,
                                                interest: item
                                            })}
                                            onDecline={(id, name) => setDialog({
                                                type: "decline",
                                                interestId: id,
                                                name,
                                                interest: item
                                            })}
                                            isPro={isPro}
                                            index={i}
                                        />
                                    );
                                })}
                            </div>
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Confirm Dialog */}
            <AnimatePresence>
                {dialog && (
                    <ConfirmDialog
                        dialog={dialog}
                        onConfirm={handleConfirm}
                        onCancel={() => setDialog(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Star, GraduationCap, Clock, MessageCircle, Heart, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InterestService from "../services/InterestService";
import ChatService from "../../chat/services/ChatService";
import { toast } from "react-toastify";
import { Badge } from "../../../components/ui/badge";
import ImageAvatar from "../../../components/ImageAvatar";
import { Toaster } from "react-hot-toast";
import AnimatedBackground from "../../../components/AnimatedBG";
import PremiumBanner from "../../setting/premiumbanner";

const tabs = ["Sent", "Received", "Accepted"];

// Helper: Preload one image and return a Promise
function preloadImage(src) {
    // Ignore falsy, non-string, or empty src.
    if (!src || typeof src !== "string") return Promise.resolve();
    // Already in browser cache? Just resolve immediately.
    return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = resolve;
        img.onerror = resolve; // tolerate failed loads
        img.src = src;
    });
}

// Preloads all given image URLs, skips non-strings/nulls
async function cacheImages(images) {
    if (!Array.isArray(images)) return;
    await Promise.all(images.map(preloadImage));
}

export default function InterestPage() {
    const navigate = useNavigate();
    const [dialog, setDialog] = useState(null);
    const [activeTab, setActiveTab] = useState("Sent");
    // Structure: { "sent": [...], "received": [...], "matches": [...] }
    const [tabData, setTabData] = useState({ sent: [], received: [], matches: [] });
    const [loading, setLoading] = useState(false);

    // Image caching: Track URLs we've already cached so we don't preload images repeatedly
    const cachedUrlsRef = useRef(new Set());

    function isOnline(dateStr) {
        if (!dateStr) return false;
        // @ts-ignore
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        return diff < 3600;
    }

    function formatLastSeen(dateStr) {
        if (!dateStr) return "";
        // @ts-ignore
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return new Date(dateStr).toLocaleDateString();
    }

    // Correctly handles API structure: { sent: [...], received: [...], matches: [...] }
    const fetchData = async () => {
        setLoading(true);
        try {
            // Use any tab fetch, all return the full object
            // (interest.controller.js, getSentInterests)
            const res = await InterestService.getallInterests();
            const data = res?.data || {};
            setTabData({
                sent: Array.isArray(data.sent) ? data.sent : [],
                received: Array.isArray(data.received) ? data.received : [],
                matches: Array.isArray(data.matches) ? data.matches : [],
            });
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Fetch failed");
            setTabData({ sent: [], received: [], matches: [] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    // Cache images whenever any tabData changes (after initial data load/refetch)
    useEffect(() => {
        // Helper to extract all unique image URLs from the current tabData object (sent/received/matches)
        const collectAllImageUrls = (collections) => {
            const imageUrls = [];
            ["sent", "received", "matches"].forEach((key) => {
                for (const item of collections[key] || []) {
                    let profile = null;
                    if (key === "sent") profile = item.toProfile;
                    else if (key === "received") profile = item.fromProfile;
                    else if (key === "matches") profile = (item.from_user === currentUserId ? item.toProfile : item.fromProfile);
                    if (profile) {
                        let imgs = [];
                        if (typeof profile.images === "string") {
                            try { imgs = JSON.parse(profile.images); } catch { imgs = []; }
                        } else if (Array.isArray(profile.images)) {
                            imgs = profile.images;
                        }
                        // Only keep non-cached and valid URLs
                        imgs.forEach((url) => {
                            if (
                                url &&
                                typeof url === "string" &&
                                !cachedUrlsRef.current.has(url)
                            ) {
                                cachedUrlsRef.current.add(url);
                                imageUrls.push(url);
                            }
                        });
                    }
                }
            });
            return imageUrls;
        };

        // jwtToken: get current user's ID. We need this here because matches tab needs user id.
        let currentUserId = null;
        try {
            currentUserId = JSON.parse(atob(localStorage.getItem("jwtToken").split(".")[1]))?.id;
        } catch (e) { }

        const allImageUrls = collectAllImageUrls(tabData);

        if (allImageUrls.length > 0) {
            cacheImages(allImageUrls);
        }
        // Only want to run when tabData changes.
        // eslint-disable-next-line
    }, [tabData]);

    // --- Tab select handler: we DO NOT fetch again, just use tabData
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleOpenProfile = (profile) => {
        if (!profile) return;
        navigate("/profile", { state: { profile } });
    };

    const handleStartChat = async (profile) => {
        if (!profile?.individual_id) {
            toast.error("Invalid profile");
            return;
        }

        try {
            await ChatService.addConversationUser(profile.individual_id);
        } catch (err) {
            if (err?.response?.status !== 409) {
                toast.error("Failed to start chat");
                return;
            }
        }

        navigate(`/chats?receiver_id=${profile.individual_id}`, {
            state: {
                receiver: {
                    id: profile.individual_id,
                    name: profile.name,
                    avatar: profile.image,
                },
            },
        });
    };

    const handleAccept = (interestId, name) => {
        setDialog({ type: "accept", interestId, name });
    };

    const onUpgrade = () => {
        navigate("/subscription");
    };

    const handleDecline = (interestId, name) => {
        setDialog({ type: "decline", interestId, name });
    };

    // Accept/Decline handlers update backend and refetch ALL list data
    const handleConfirm = async () => {
        setDialog(null);
        const { type, interestId } = dialog;
        try {
            if (type === "accept") {
                await InterestService.accept(interestId);
                toast.success("Interest accepted!");
            } else {
                await InterestService.decline(interestId);
                toast.success("Interest declined.");
            }
            fetchData(); // Refresh all tabs, not just current one
        } catch (err) {
            toast.error(err.message || "Action failed");
        }
    };

    function EmptyState({ tab }) {
        const config = {
            "Sent": { icon: "💌", title: "No sent interests", desc: "You haven't sent any interests yet. Go explore!" },
            "Received": { icon: "💝", title: "No received interests", desc: "No one has sent you an interest yet. Check back later!" },
            "Accepted": { icon: "💞", title: "No matches yet", desc: "When someone accepts your interest, they'll appear here." },
        };
        const { icon, title, desc } = config[tab] || config["Sent"];

        return (
            <div className="flex flex-col items-center justify-center py-24 px-8 gap-4">
                <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center text-4xl">
                    {icon}
                </div>
                <h3 className="text-lg text-gray-700 font-medium">{title}</h3>
                <p className="text-sm text-gray-400 text-center">{desc}</p>
            </div>
        );
    }

    // jwtToken: get current user's ID
    let currentUserId = null;
    try {
        currentUserId = JSON.parse(atob(localStorage.getItem("jwtToken").split(".")[1]))?.id;
    } catch (e) { }

    // Pick items according to tab
    let items = [];
    if (activeTab === "Sent") {
        items = tabData.sent || [];
    } else if (activeTab === "Received") {
        items = tabData.received || [];
    } else if (activeTab === "Accepted") {
        items = tabData.matches || [];
    }

    // Count per tab
    const countByTab = {
        Sent: (tabData.sent || []).length,
        Received: (tabData.received || []).length,
        Accepted: (tabData.matches || []).length,
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Tabs */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        zIndex: 999999,  // ← higher than AppBar's 99997
                    },
                }}
                containerStyle={{
                    zIndex: 999999,   // ← this is what actually moves the container
                    top: 70,          // ← push down so it appears below AppBar (64px height + 6px gap)
                }}
            />
            {/* Premium Banner with gradient overlay and image loading spinner */}
            {(() => {
                const [imgLoaded, setImgLoaded] = React.useState(false);

                return (
                    <PremiumBanner onUpgrade={() => navigate("/subscription")} />

                );
            })()}



            <div className="bg-white border-b px-4">
                <div className="flex gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`py-4 relative ${activeTab === tab
                                ? "text-primary"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <span className="font-medium">
                                {tab}{" "}
                                <span className="text-xs text-gray-400 font-normal">
                                    ({countByTab[tab]})
                                </span>
                            </span>
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-24">
                {loading && (
                    <p className="text-center text-gray-500 mt-10">Loading...</p>
                )}

                {!loading && items.length === 0 && (
                    <p className="text-center text-gray-500 mt-20">
                        <EmptyState tab={activeTab} />
                    </p>
                )}

                {/* GRID */}
                {!loading && items.length > 0 && (
                    <div className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                            {items.map((item, index) => {
                                // Determine correct profile object per tab/interest shape
                                let profile;
                                if (activeTab === "Sent") {
                                    profile = item.toProfile;
                                } else if (activeTab === "Received") {
                                    profile = item.fromProfile;
                                } else if (activeTab === "Accepted") {
                                    // Try best guess (matches returned from backend)
                                    profile = item.from_user === currentUserId ? item.toProfile : item.fromProfile;
                                }
                                if (!profile) return null;

                                // Parse images/interests if stringified (backend returns as string)
                                let images = [];
                                if (typeof profile.images === "string") {
                                    try {
                                        images = JSON.parse(profile.images);
                                    } catch {
                                        images = [];
                                    }
                                } else if (Array.isArray(profile.images)) {
                                    images = profile.images;
                                }
                                let interests = [];
                                if (typeof profile.interests === "string") {
                                    try {
                                        interests = JSON.parse(profile.interests);
                                    } catch {
                                        interests = [];
                                    }
                                } else if (Array.isArray(profile.interests)) {
                                    interests = profile.interests;
                                }

                                return (
                                    <motion.div
                                        key={item.id ?? index}
                                        layout
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 12 }}
                                        transition={{ delay: index * 0.06 }}
                                        whileHover={{ scale: 1.025 }}
                                        className="group relative cursor-pointer"
                                        onClick={() => handleOpenProfile({ ...profile, images, interests })}
                                    >
                                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-background shadow-lg">
                                            {/* The ImageAvatar component is now responsible for the blur lock overlay (on top of image ONLY); 
                                                no backdrop-blur or blur should cover text/profile data below! */}
                                            <ImageAvatar
                                                images={images}
                                                gender={profile.gender}
                                                alt={profile.name}
                                                // @ts-ignore
                                                isAccepted={item.status}
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Gradient Overlay, sits over image but UNDER text */}
                                            <div className="absolute inset-x-0 bottom-0 h-70 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                                            {/* Profile Details & Actions - always on top, NEVER blurred */}
                                            <div className="absolute bottom-3 left-3 right-3 text-white z-10">

                                                <div className="text-lg mb-1">
                                                    {profile.name}
                                                    {profile.age ? `, ${profile.age}` : ""}
                                                </div>

                                                <div className="text-xs opacity-90 mb-2 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {profile.city
                                                        ? `${profile.city}, ${profile.country || ""}`
                                                        : profile.country || ""}
                                                </div>
                                                {isOnline(profile.last_seen) && (
                                                    <div className="text-xs opacity-90 flex items-center gap-1 mb-3">
                                                        <span className="w-2 h-2 rounded-full inline-block bg-green-400 animate-pulse" />
                                                        {`Active ${formatLastSeen(profile.last_seen)}`}
                                                    </div>
                                                )}
                                                <div className="text-xs opacity-90 mb-2 flex items-center gap-1">
                                                    <GraduationCap className="w-3 h-3" />
                                                    {profile.education || ""}
                                                </div>
                                                {/* Interest badges
                                                
                                                 {Array.isArray(interests) && interests.length > 0 && (item.status === "pending") && (
                                                    <div className="flex gap-1 flex-wrap">
                                                        {interests.slice(0, 2).map((interest, idx) => (
                                                            <Badge
                                                                key={idx}
                                                                variant="primary"
                                                                active={interests}

                                                            >
                                                                {interest}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}


*/}

                                                {/* Chat Button for all tabs, but only allow chat if item.status === "accepted" */}
                                                {item.status === "accepted" && (
                                                    <motion.button
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStartChat(profile);
                                                        }}
                                                        className="mt-2 w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-xl text-sm font-medium shadow-md"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                        Chat
                                                    </motion.button>
                                                )}
                                            </div>
                                            {/* Action Buttons for Received ONLY */}
                                            {activeTab === "Received" && (
                                                <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAccept(item.id, profile.name);
                                                        }}
                                                        className="p-2 rounded-full bg-white/10 text-white"
                                                    >
                                                        <Heart className="w-4 h-4 text-white" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDecline(item.id, profile.name);
                                                        }}
                                                        className="p-2 rounded-full bg-white/10 text-white"
                                                    >
                                                        <X className="w-4 h-4 text-white" />
                                                    </motion.button>
                                                </div>
                                            )}
                                        </div>

                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {!loading && items.length > 5 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        Check back later for more! 💕
                    </div>
                )}
            </div>
            {/* ── Confirmation Dialog ── */}
            <AnimatePresence>
                {dialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
                        onClick={() => setDialog(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: "spring", damping: 20 }}
                            className="rounded-3xl p-6 w-full max-w-sm"
                            style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.25)" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${dialog.type === "accept" ? "bg-green-500/20" : "bg-red-500/20"
                                }`}>
                                {dialog.type === "accept"
                                    ? <Heart className="w-8 h-8 text-green-400" />
                                    : <X className="w-8 h-8 text-red-400" />
                                }
                            </div>

                            <h3 className="text-xl text-center text-white mb-2">
                                {dialog.type === "accept" ? "Accept Interest?" : "Decline Interest?"}
                            </h3>
                            <p className="text-center text-white/70 text-sm mb-6">
                                {dialog.type === "accept"
                                    ? `You are about to accept ${dialog.name}'s interest. This will allow you to chat.`
                                    : `You are about to decline ${dialog.name}'s interest. This cannot be undone.`
                                }
                            </p>
                            <div className="flex gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setDialog(null)}
                                    className="flex-1 py-3 rounded-2xl text-white/80 text-sm font-medium"
                                    style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleConfirm}
                                    className={`flex-1 py-3 rounded-2xl text-white text-sm font-medium ${dialog.type === "accept"
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-red-500 hover:bg-red-600"
                                        }`}
                                >
                                    {dialog.type === "accept" ? "Yes, Accept" : "Yes, Decline"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
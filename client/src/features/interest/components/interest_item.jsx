// @ts-nocheck
import { motion, AnimatePresence } from "motion/react";
import { MapPin, GraduationCap, MessageCircle, Heart, X, Check, Info, Shield, Star } from "lucide-react";
import ImageAvatar from "../../../ui/image";
import { useEffect, useState } from "react";
import ProfileService from "../../profile/services/ProfileService";
import InterestService from "../../interest/services/InterestService";
import { toast } from "sonner";

function isOnline(dateStr) {
    if (!dateStr) return false;
    return Math.floor((Date.now() - new Date(dateStr)) / 1000) < 3600;
}

// ── Info Dialog ───────────────────────────────────────────────────────────────
function StatusInfoDialog({ isOpen, onClose, hasFromGuardian, hasToGuardian }) {
    if (!isOpen) return null;

    const steps = [
        {
            icon: Heart,
            title: "Mutual Interest",
            description: "Both you and the other person need to accept the interest request to move forward.",
            iconBg: "bg-pink-50 border-pink-200",
            badge: "bg-pink-50 text-pink-500",
            iconColor: "text-pink-500",
        },
        ...(hasFromGuardian ? [{
            icon: Shield,
            title: "Guardian Approval",
            description: "Their guardian reviews and approves the match to ensure it meets their family's values.",
            iconBg: "bg-violet-50 border-violet-200",
            badge: "bg-violet-50 text-violet-500",
            iconColor: "text-violet-500",
        }] : []),
        ...(hasToGuardian ? [{
            icon: Shield,
            title: "Your Guardian Approval",
            description: "Your guardian reviews and approves the match to ensure it aligns with your family's preferences.",
            iconBg: "bg-violet-50 border-violet-200",
            badge: "bg-violet-50 text-violet-500",
            iconColor: "text-violet-500",
        }] : []),
        {
            icon: Star,
            title: "Connected!",
            description: "Once everyone approves, you can start chatting and get to know each other better.",
            iconBg: "bg-emerald-50 border-emerald-200",
            badge: "bg-emerald-50 text-emerald-500",
            iconColor: "text-emerald-500",
        },
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[99999] flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 12 }}
                    transition={{ type: "spring", stiffness: 340, damping: 26 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-[20px] w-full max-w-[480px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.16),0_2px_8px_rgba(0,0,0,0.08)] max-h-[90vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="px-6 pt-6 pb-5 bg-[#eaf2ee] border-b border-[#1B4D3E]/[0.08] shrink-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="m-0 mb-1.5 text-xl font-bold text-[#1B4D3E] tracking-tight">
                                    How It Works
                                </h3>
                                <p className="m-0 text-sm text-gray-500 leading-relaxed">
                                    Your journey from interest to connection
                                </p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.92 }}
                                onClick={onClose}
                                className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-white border border-[#1B4D3E]/[0.12] cursor-pointer shrink-0 hover:bg-gray-50 transition-colors duration-150"
                            >
                                <X className="w-[18px] h-[18px] text-gray-500" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="px-6 py-7 overflow-y-auto flex-1 flex flex-col gap-6">
                        {steps.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex gap-[18px]"
                                >
                                    <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 border-2 ${step.iconBg}`}>
                                        <Icon className={`w-[22px] h-[22px] ${step.iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                                            <h4 className="m-0 text-[15px] font-semibold text-[#1B4D3E] tracking-tight">
                                                {step.title}
                                            </h4>
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wide whitespace-nowrap ${step.badge}`}>
                                                Step {i + 1}
                                            </span>
                                        </div>
                                        <p className="m-0 text-sm text-gray-500 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-[18px] bg-[#fafaf9] border-t border-[#1B4D3E]/[0.07] shrink-0 text-center">
                        <p className="m-0 text-[13px] font-medium text-gray-400 leading-relaxed">
                            All parties must approve before you can connect
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ── Cancel Confirm Modal ──────────────────────────────────────────────────────
function CancelConfirmModal({ cancelConfirm, onClose, onConfirm }) {
    return (
        <AnimatePresence>
            {cancelConfirm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-5"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl p-7 max-w-[360px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                    >
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full mx-auto mb-5 overflow-hidden border-[3px] border-[#f0f5f3]">
                            {cancelConfirm.image ? (
                                <img src={cancelConfirm.image} alt={cancelConfirm.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#1B4D3E] flex items-center justify-center text-3xl font-bold text-[#fef3c7]">
                                    {cancelConfirm.name?.[0]?.toUpperCase() || "?"}
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-[#1B4D3E] text-center mb-2 leading-snug">
                            Cancel Interest?
                        </h3>
                        <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
                            Are you sure you want to cancel your interest sent to{" "}
                            <strong className="text-[#1B4D3E]">{cancelConfirm.name}</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={onClose}
                                className="flex-1 py-3 px-5 rounded-xl border border-[#eaf2ee] bg-white text-[#1B4D3E] text-sm font-semibold cursor-pointer hover:bg-[#eaf2ee] transition-colors"
                            >
                                Keep Interest
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={onConfirm}
                                className="flex-1 py-3 px-5 rounded-xl border-none bg-red-500 text-white text-sm font-semibold cursor-pointer hover:bg-red-600 transition-colors shadow-[0_2px_8px_rgba(239,68,68,0.3)]"
                            >
                                Cancel Interest
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── Status Tracker ────────────────────────────────────────────────────────────
function StatusTracker({ interest, activeTab, onShowInfo }) {
    const hasFromGuardian = !!interest.from_guardian;
    const hasToGuardian = !!interest.to_guardian;
    const steps = [];
    const [currentUser, setCurrentUser] = useState(null);
    const [cancelConfirm, setCancelConfirm] = useState(null);

    const handleConfirmCancel = async () => {
        if (!cancelConfirm) return;
        try {
            const response = await InterestService.cancel(cancelConfirm.id);
            if (response.success) {
                toast.success(`Interest cancelled`);
                setCancelConfirm(null);
                refetch();
            } else {
                toast.error(response.message || "Failed to cancel interest");
            }
        } catch (err) {
            console.error("Cancel interest error:", err);
            toast.error("Failed to cancel interest");
        }
    };

    const isReceived = activeTab === "Received";
    const isSent = activeTab === "Sent";

    const otherProfile = isReceived ? interest.fromProfile : interest.toProfile;
    const otherPersonName = otherProfile?.name || 'Other Person';
    const currentUserName = currentUser?.profile?.name || 'You';

    const formatName = (name) => {
        if (!name) return '';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return name;
        return `${parts[0]}\n${parts.slice(1).join(' ')}`;
    };

    const youAccepted = isSent
        ? true
        : (interest.status === "accepted" || interest.both_users_approved === true);
    const youDeclined = interest.status === "declined";
    const otherApproved = isSent
        ? (interest.status === "accepted" || interest.both_users_approved === true)
        : true;
    const otherDeclined = interest.status === "declined";

    steps.push({
        key: "you",
        label: formatName(currentUserName),
        done: youAccepted,
        active: !youAccepted && !youDeclined && interest.status === "pending",
        failed: youDeclined,
    });

    const prevDone1 = youAccepted;
    steps.push({
        key: "other_person",
        label: formatName(otherPersonName),
        done: otherApproved,
        active: prevDone1 && !otherApproved && !otherDeclined && interest.status === "pending",
        failed: otherDeclined,
    });

    if (isReceived) {
        if (hasFromGuardian) {
            const approved = interest.from_guardian_status === "accepted";
            const declined = interest.from_guardian_status === "declined";
            const prevDone2 = youAccepted && otherApproved;
            const guardianName = interest.from_guardian?.name || "Other's Guardian";
            steps.push({
                key: "other_guardian",
                label: formatName(guardianName),
                done: approved,
                active: prevDone2 && !approved && !declined && interest.status === "pending",
                failed: declined,
            });
        }
    } else {
        if (hasToGuardian) {
            const approved = interest.to_guardian_status === "accepted";
            const declined = interest.to_guardian_status === "declined";
            const prevDone2 = youAccepted && otherApproved;
            const guardianName = interest.to_guardian?.name || "Other's Guardian";
            steps.push({
                key: "other_guardian",
                label: formatName(guardianName),
                done: approved,
                active: prevDone2 && !approved && !declined && interest.status === "pending",
                failed: declined,
            });
        }
    }

    if (isReceived) {
        if (hasToGuardian) {
            const approved = interest.to_guardian_status === "accepted";
            const declined = interest.to_guardian_status === "declined";
            const prevDone3 = youAccepted && otherApproved && (!hasFromGuardian || interest.from_guardian_status === "accepted");
            const guardianName = interest.to_guardian?.name || "Your Guardian";
            steps.push({
                key: "your_guardian",
                label: formatName(guardianName),
                done: approved,
                active: prevDone3 && !approved && !declined && interest.status === "pending",
                failed: declined,
            });
        }
    } else {
        if (hasFromGuardian) {
            const approved = interest.from_guardian_status === "accepted";
            const declined = interest.from_guardian_status === "declined";
            const prevDone3 = youAccepted && otherApproved && (!hasToGuardian || interest.to_guardian_status === "accepted");
            const guardianName = interest.from_guardian?.name || "Your Guardian";
            steps.push({
                key: "your_guardian",
                label: formatName(guardianName),
                done: approved,
                active: prevDone3 && !approved && !declined && interest.status === "pending",
                failed: declined,
            });
        }
    }

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const user = await ProfileService.getCurrentUser();
                setCurrentUser(user);
            } catch (error) {
                console.error('Failed to get current user:', error);
            }
        };
        fetchCurrentUser();
    }, []);

    if (steps.length <= 1 || interest.status !== "pending") return null;

    // Progress line width
    const doneCount = steps.filter(s => s.done).length;
    const progressPct = steps.length > 1
        ? Math.max(0, ((doneCount - 1) / (steps.length - 1)) * 100)
        : 0;

    return (
        <>
            <div className="px-4 pt-3 pb-4 bg-[#fafaf9] border-t border-[#1B4D3E]/[0.07]">
                {/* Label + info btn */}
                <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-[9px] font-bold tracking-[0.07em] uppercase text-gray-400">
                        Approval Progress
                    </span>
                    <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={(e) => { e.stopPropagation(); onShowInfo(); }}
                        className="w-[18px] h-[18px] rounded-full flex items-center justify-center bg-[#1B4D3E]/10 border-none cursor-pointer hover:bg-[#1B4D3E]/20 transition-colors"
                    >
                        <Info className="w-3 h-3 text-[#1B4D3E]" />
                    </motion.button>
                </div>

                {/* Steps row with connecting line */}
                <div className="relative flex items-start">
                    {/* Track */}
                    <div className="absolute top-[11px] left-3 right-3 h-0.5 bg-gray-200 z-0" />
                    {/* Progress fill */}
                    <div
                        className="absolute top-[11px] left-3 h-0.5 z-[1] transition-all duration-500"
                        style={{
                            width: `calc(${progressPct}% * (100% - 24px) / 100%)`,
                            background: "linear-gradient(to right, #10b981, #1B4D3E)",
                        }}
                    />

                    {steps.map((step, i) => (
                        <div key={step.key} className="flex-1 flex flex-col items-center gap-1.5 z-[2]">
                            {/* Dot */}
                            <motion.div
                                initial={{ scale: 0.7 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200
                                    ${step.failed
                                        ? "bg-red-50 border-red-400"
                                        : step.done
                                            ? "bg-emerald-50 border-emerald-400"
                                            : step.active
                                                ? "bg-amber-50 border-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]"
                                                : "bg-gray-100 border-gray-200"
                                    }`}
                            >
                                {step.failed ? (
                                    <X className="w-3 h-3 text-red-400 stroke-[2.5]" />
                                ) : step.done ? (
                                    <Check className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
                                ) : step.active ? (
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-2 h-2 rounded-full bg-amber-400"
                                    />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                                )}
                            </motion.div>

                            {/* Label */}
                            <span className={`text-[7px] text-center leading-tight w-full tracking-wide whitespace-pre-line flex items-center justify-center min-h-6
                                ${step.failed
                                    ? "text-red-400 font-semibold"
                                    : step.done
                                        ? "text-emerald-600 font-bold"
                                        : step.active
                                            ? "text-amber-600 font-bold"
                                            : "text-gray-400 font-medium"
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <CancelConfirmModal
                cancelConfirm={cancelConfirm}
                onClose={() => setCancelConfirm(null)}
                onConfirm={handleConfirmCancel}
            />
        </>
    );
}

// ── Main Card ─────────────────────────────────────────────────────────────────
export default function InterestItem({ interest, profile, images, activeTab, onOpenProfile, onStartChat, onAccept, onDecline, index, isPro }) {
    const [showInfo, setShowInfo] = useState(false);

    const online = isOnline(profile?.last_seen);
    const item = interest;
    const hasFromGuardian = !!interest.from_guardian;
    const hasToGuardian = !!interest.to_guardian;

    // Status pill config
    const statusConfig = {
        pending: { label: "Pending", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50  border-amber-200" },
        accepted: { label: "Connected", dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
        declined: { label: "Declined", dot: "bg-red-400", text: "text-red-700", bg: "bg-red-50    border-red-200" },
    };
    const sc = statusConfig[item.status] || statusConfig.pending;

    const showAcceptDecline = activeTab === "Received" && item.status === "pending" && item.both_users_approved === false;

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{
                    delay: Math.min(index * 0.04, 0.25),
                    type: "spring",
                    stiffness: 340,
                    damping: 26,
                }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="relative cursor-pointer"
                onClick={() => onOpenProfile({ ...profile, images })}
            >

                <div
                    className="relative rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(27,77,62,0.08),0_1px_4px_rgba(0,0,0,0.04)] flex flex-col bg-[#f5f5f5]"
                    style={{ aspectRatio: "3/4" }}
                >
                    {/* Image */}
                    <div className="relative flex-1 min-h-0">
                        <ImageAvatar
                            images={images}
                            gender={profile?.gender}
                            alt={profile?.name}
                            isBlurred={profile?.is_blurred_images}
                            viewerIsPro={isPro}
                            shouldShowOverlay={false}
                            className="absolute inset-0 w-full h-full object-cover"
                        />

                        {/* Online badge */}
                        {online && (
                            <div className="absolute top-3 left-3 flex items-center gap-[5px] px-2.5 py-[5px] rounded-[10px] bg-black/60 backdrop-blur-md border border-white/15 z-10">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_0_2px_rgba(74,222,128,0.3)]" />
                                <span className="text-[10px] font-semibold text-white tracking-wide">Online</span>
                            </div>
                        )}

                        {/* Status pill — top right (shifts left when accept/decline visible) */}
                        <div className={`absolute top-3 flex items-center gap-1.5 px-2.5 py-1 rounded-[9px] border text-[9px] font-bold tracking-[0.04em] uppercase ${sc.bg} ${sc.text} ${showAcceptDecline ? "right-14" : "right-3"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                        </div>

                        {/* Accept / Decline */}
                        {showAcceptDecline && (
                            <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                                <motion.button
                                    whileTap={{ scale: 0.92 }}
                                    whileHover={{ scale: 1.05 }}
                                    onClick={(e) => { e.stopPropagation(); onAccept(item.id, profile?.name); }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1B4D3E] border-none cursor-pointer shadow-[0_4px_12px_rgba(27,77,62,0.35)]"
                                >
                                    <Heart className="w-[18px] h-[18px] text-white fill-white" />
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.92 }}
                                    whileHover={{ scale: 1.05 }}
                                    onClick={(e) => { e.stopPropagation(); onDecline(item.id, profile?.name); }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500 border-none cursor-pointer shadow-[0_4px_12px_rgba(239,68,68,0.35)]"
                                >
                                    <X className="w-[18px] h-[18px] text-white" />
                                </motion.button>
                            </div>
                        )}

                        {/* Gradient */}
                        <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                        {/* Profile info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white z-10">
                            <p className="m-0 text-[15px] font-semibold leading-snug overflow-hidden text-ellipsis whitespace-nowrap tracking-tight">
                                {profile?.name}{profile?.age ? `, ${profile.age}` : ""}
                            </p>
                            {/* Profile info
    
       {(profile?.city || profile?.country) && (
                                <p className="flex items-center gap-1 mt-1 text-xs text-white/80 overflow-hidden text-ellipsis whitespace-nowrap m-0">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span className="overflow-hidden text-ellipsis">
                                        {[profile.city, profile.country].filter(Boolean).join(", ")}
                                    </span>
                                </p>
                            )}

                            {profile?.education && (
                                <p className="flex items-center gap-1 mt-0.5 text-[11px] text-white/70 overflow-hidden text-ellipsis whitespace-nowrap m-0">
                                    <GraduationCap className="w-3 h-3 shrink-0" />
                                    <span className="overflow-hidden text-ellipsis">{profile.education}</span>
                                </p>
                            )}
    */}


                            {/* Chat button */}
                            {item.status === "accepted" && (
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={(e) => { e.stopPropagation(); onStartChat(profile); }}
                                    className="mt-2.5 w-full py-2.5 px-4 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 bg-[#1B4D3E] text-white border-none cursor-pointer tracking-wide shadow-[0_4px_12px_rgba(27,77,62,0.4)]"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Chat
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Status Tracker */}
                    {!(item.both_users_approved && item.both_guardians_approved) && (
                        <StatusTracker
                            interest={item}
                            activeTab={activeTab}
                            onShowInfo={() => setShowInfo(true)}
                        />
                    )}
                </div>
            </motion.div>

            {/* Info Dialog — outside card to avoid layout re-renders */}
            <StatusInfoDialog
                isOpen={showInfo}
                onClose={() => setShowInfo(false)}
                hasFromGuardian={hasFromGuardian}
                hasToGuardian={hasToGuardian}
            />
        </>
    );
}

import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Calendar } from "lucide-react";
import ImageAvatar from "../../../ui/image";
import { useEffect, useState } from "react";
import AuthService from "../../auth/services/AuthService";
import toast from "react-hot-toast";
import Api from "../../../api/Api";
import ScheduleMeetingModal from "../../meeting/components/schedulemeetingmodal";


export default function ChatHeader({
    receiverInfo, receiverId, connected, isTyping,
    onBack, onViewProfile
}) {
    const avatarLetter = String(receiverInfo?.name || receiverId || "?")?.[0]?.toUpperCase();
    const isOnline = receiverInfo?.online ?? connected;
    const [isPro, setIsPro] = useState(false);
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [matchId, setMatchId] = useState(null);
    const [loadingMatch, setLoadingMatch] = useState(true);

    // Fetch isPro status
    useEffect(() => {
        const fetchData = async () => {
            try {
                const ispro = await AuthService.isPro();
                setIsPro(ispro);
            } catch (err) { }
        };
        fetchData();
    }, []);

    // Fetch matchId when receiverId changes
    useEffect(() => {
        const fetchMatchId = async () => {
            if (!receiverId) return;
            try {
                setLoadingMatch(true);
                const response = await Api.get(`/chat/conversation/${receiverId}`);
                if (response?.success && response?.data?.match_id) {
                    setMatchId(response.data.match_id);
                } else {
                    setMatchId(null);
                }
            } catch (error) {
                console.log("No match found for this conversation");
                setMatchId(null);
            } finally {
                setLoadingMatch(false);
            }
        };

        fetchMatchId();
    }, [receiverId]);

    const handleScheduleMeeting = () => {
        if (!matchId) {
            toast.error("No match found for this conversation");
            return;
        }
        setShowMeetingModal(true);
    };

    return (
        <>
            <div
                className="px-4 py-3 flex-shrink-0 border-b"
                style={{
                    flexShrink: 0,
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                }}
            >
                <div className="flex items-center gap-3">

                    {/* Back button */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={onBack}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                        style={{ color: "var(--foreground)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </motion.button>

                    {/* Avatar + Name */}
                    <button
                        onClick={() => onViewProfile()}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                        <div className="relative flex-shrink-0">
                            <div
                                className="w-11 h-11 rounded-full overflow-hidden"
                                style={{ backgroundColor: "var(--muted)" }}
                            >
                                {receiverInfo?.avatar ? (
                                    <ImageAvatar
                                        images={receiverInfo?.avatar}
                                        gender={receiverInfo?.gender}
                                        alt={receiverInfo?.name}
                                        isBlurred={receiverInfo?.is_blurred_images}
                                        viewerIsPro={isPro}
                                        shouldShowOverlay={false}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full flex items-center justify-center font-bold text-sm select-none"
                                        style={{
                                            backgroundColor: "var(--secondary)",
                                            color: "var(--foreground)",
                                        }}
                                    >
                                        {avatarLetter}
                                    </div>
                                )}
                            </div>

                            {/* Online dot */}
                            {isOnline && (
                                <div
                                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2"
                                    style={{ borderColor: "var(--background)" }}
                                />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p
                                className="font-semibold text-sm truncate leading-tight"
                                style={{ color: "var(--foreground)" }}
                            >
                                {receiverInfo?.name || `User #${receiverId}`}
                                {receiverInfo?.age && (
                                    <span className="font-normal" style={{ color: "var(--muted-foreground)" }}>
                                        , {receiverInfo.age}
                                    </span>
                                )}
                            </p>
                            <p className="text-xs mt-0.5">
                                {isTyping ? (
                                    <span
                                        className="animate-pulse font-medium"
                                        style={{ color: "var(--foreground)" }}
                                    >
                                        typing…
                                    </span>
                                ) : isOnline ? (
                                    <span className="text-green-500">Active now</span>
                                ) : (
                                    <span style={{ color: "var(--muted-foreground)" }}>Last seen recently</span>
                                )}
                            </p>
                        </div>
                    </button>

                    {/* Schedule Meeting button */}
                    {!loadingMatch && matchId && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={handleScheduleMeeting}
                            className="h-10 px-4 rounded-full flex items-center gap-2 font-medium text-sm transition-all flex-shrink-0"
                            style={{
                                background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)",
                                color: "white",
                            }}
                            title="Schedule a meeting"
                        >
                            <Calendar className="w-4 h-4" />
                            <span className="hidden sm:inline">Schedule Meeting</span>
                            <span className="sm:hidden">Meet</span>
                        </motion.button>
                    )}

                </div>
            </div>

            {/* Meeting Modal */}
            <ScheduleMeetingModal
                isOpen={showMeetingModal}
                onClose={() => setShowMeetingModal(false)}
                matchId={matchId}
                receiverInfo={receiverInfo}
            />
        </>
    );
}
import { motion } from "motion/react";
import { ChevronLeft, Phone, Video, Info } from "lucide-react";
import ImageAvatar from "../../../ui/image";
import { useEffect, useState } from "react";
import AuthService from "../../auth/services/AuthService";


export default function ChatHeader({
    receiverInfo, receiverId, connected, isTyping,
    onBack, onViewProfile, onPhone, onVideo, onInfo
}) {
    const avatarLetter = String(receiverInfo?.name || receiverId || "?")?.[0]?.toUpperCase();
    const isOnline = receiverInfo?.online ?? connected;
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {


                const ispro = await AuthService.isPro();
                setIsPro(ispro);



            } catch (err) {


            } finally {

            }
        }
        fetchData()
    }, [])
    return (
        <div className="px-4 py-3 flex-shrink-0 border-b"
            style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            }}>
            <div className="flex items-center gap-3">

                {/* Back */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onBack}
                    className="w-10 h-10 rounded-full flex items-center justify-center
                        transition-colors flex-shrink-0"
                    style={{ color: "var(--foreground)" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--accent)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                    <ChevronLeft className="w-6 h-6" />
                </motion.button>

                {/* Avatar + Name — clickable */}
                <button
                    onClick={() => onViewProfile()}

                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                    <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full overflow-hidden"
                            style={{ backgroundColor: "var(--muted)" }}>
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
                                <div className="w-full h-full flex items-center justify-center
                                    font-bold text-sm select-none"
                                    style={{
                                        backgroundColor: "var(--secondary)",
                                        color: "var(--foreground)",
                                    }}>
                                    {avatarLetter}
                                </div>
                            )}
                        </div>
                        {/* Online dot */}
                        {isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500
                                rounded-full border-2" style={{ borderColor: "var(--background)" }} />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate leading-tight"
                            style={{ color: "var(--foreground)" }}>
                            {receiverInfo?.name || `User #${receiverId}`}
                            {receiverInfo?.age && (
                                <span className="font-normal" style={{ color: "var(--muted-foreground)" }}>
                                    , {receiverInfo.age}
                                </span>
                            )}
                        </p>
                        <p className="text-xs mt-0.5">
                            {isTyping ? (
                                <span className="animate-pulse font-medium"
                                    style={{ color: "var(--foreground)" }}>typing…</span>
                            ) : isOnline ? (
                                <span className="text-green-500">Active now</span>
                            ) : (
                                <span style={{ color: "var(--muted-foreground)" }}>Last seen recently</span>
                            )}
                        </p>
                    </div>
                </button>


                {/*     
                
                <div className="flex items-center gap-1 flex-shrink-0">
                    {[
                        { icon: Phone, fn: onPhone },
                        { icon: Video, fn: onVideo },
                        { icon: Info, fn: onInfo },
                    ].map(({ icon: Icon, fn }, i) => (
                        <motion.button key={i}
                            whileTap={{ scale: 0.9 }}
                            onClick={fn}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                            style={{ color: "var(--muted-foreground)" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--accent)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                            <Icon className="w-5 h-5" />
                        </motion.button>
                    ))}
                </div> */}

            </div>
        </div>
    );
}

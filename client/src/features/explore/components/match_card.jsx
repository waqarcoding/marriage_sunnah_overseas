// @ts-nocheck
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, X, Star, MapPin, MessageCircle, Info, Verified } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ImageAvatar from "../../../ui/image";
import ProfileService from "../../profile/services/ProfileService";
import AuthService from "../../auth/services/AuthService";
import IslamicChatDialog from "./islamic_chat_dialogue";

function parseImages(profile) {
    try {
        const imgs = typeof profile.images === "string"
            ? JSON.parse(profile.images)
            : Array.isArray(profile.images) ? profile.images : [];
        return imgs.filter(Boolean);
    } catch { return []; }
}

function parseInterests(profile) {
    try {
        const arr = typeof profile.interests === "string"
            ? JSON.parse(profile.interests)
            : Array.isArray(profile.interests) ? profile.interests : [];
        return arr.filter(Boolean);
    } catch { return []; }
}

function isOnline(d) { return d && Math.floor((Date.now() - new Date(d)) / 1000) < 3600; }

function formatLastSeen(d) {
    if (!d) return "";
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

// ── Photo dots ────────────────────────────────────────────────────────────────
function PhotoDots({ total, current }) {
    if (total <= 1) return null;
    return (
        <div style={{
            position: "absolute",
            top: "10px",
            left: 0,
            right: 0,
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            gap: "4px",
            padding: "0 48px",
            pointerEvents: "none"
        }}>
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        height: "2px",
                        borderRadius: "1px",
                        flex: 1,
                        maxWidth: "40px",
                        background: i === current ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
                        transition: "all 0.25s ease"
                    }}
                />
            ))}
        </div>
    );
}

// ── Pill tag ──────────────────────────────────────────────────────────────────
function Pill({ children, icon: Icon }) {
    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 10px",
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: "500",
            background: "#f0f5f3",
            color: "#1B4D3E",
            border: "0.5px solid rgba(27,77,62,0.10)",
            letterSpacing: "0.01em"
        }}>
            {Icon && <Icon style={{ width: "12px", height: "12px" }} />}
            {children}
        </span>
    );
}

// ── Action button ─────────────────────────────────────────────────────────────
function ActionBtn({ onClick, children, variant = "secondary", size = "md" }) {
    const sizes = {
        sm: { width: "44px", height: "44px" },
        md: { width: "52px", height: "52px" },
        lg: { width: "64px", height: "64px" }
    };

    const styles = {
        secondary: {
            background: "#ffffff",
            border: "0.5px solid rgba(27,77,62,0.14)"
        },
        primary: {
            background: "#1B4D3E",
            border: "none",
            boxShadow: "0 4px 14px rgba(27,77,62,0.25), 0 2px 4px rgba(0,0,0,0.08)"
        },
        danger: {
            background: "#ffffff",
            border: "0.5px solid rgba(239,68,68,0.2)"
        },
        super: {
            background: "#faf5ff",
            border: "0.5px solid rgba(168,85,247,0.2)"
        },
        message: {
            background: "#ffffff",
            border: "0.5px solid rgba(27,77,62,0.14)"
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
            onClick={onClick}
            style={{
                ...sizes[size],
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                ...styles[variant]
            }}
        >
            {children}
        </motion.button>
    );
}

export default function ProfileCard({ profile, onLike, onPass, onSuperLike }) {
    const [photoIdx, setPhotoIdx] = useState(0);
    const [isVerified, setIsVerified] = useState(false);
    const [isShowLastSeen, setIsShowLastSeen] = useState(false);
    const [isPro, setIsPro] = useState(false);
    const [iamPro, setiamPro] = useState(false);
    const [showChatDialog, setShowChatDialog] = useState(false); // Chat dialog state
    const navigate = useNavigate();

    const photos = parseImages(profile);
    const interests = parseInterests(profile);

    const location = [profile.city, profile.country].filter(Boolean).join(", ");

    const handlePhotoTap = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setPhotoIdx(i =>
            x < rect.width / 2
                ? Math.max(0, i - 1)
                : Math.min(photos.length - 1, i + 1)
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await AuthService.getUserById(profile.individual_id);
                setIsPro(res?.is_pro);
                const isipro = await AuthService.isPro();
                setiamPro(isipro);
                setIsShowLastSeen(res.profile.is_show_last_seen);
                setIsVerified(res?.is_verified);
            } catch (err) {
                console.error(err);
            }
        }
        fetchData()
    }, [])

    const gotoProfile = (e) => {
        e.stopPropagation();
        navigate("/individual/profile", { state: { profile } });
    };

    // Handle chat button click
    const handleChatClick = () => {
        setShowChatDialog(true);
    };

    // Handle confirm chat
    const handleConfirmChat = () => {
        setShowChatDialog(false);
        if (profile.individual_id) {
            navigate(`/individual/chats?receiver_id=${profile.individual_id}`, {
                state: {
                    receiver: {
                        id: profile.individual_id,
                        name: profile.name,
                        avatar: photos[0]
                    }
                }
            });
        }
    };

    // Converts height in inches to a string in feet and inches (e.g., "5' 7\"")
    function formatHeight(heightInches) {
        if (!heightInches || typeof heightInches !== "number") return "";
        const feet = Math.floor(heightInches / 12);
        const inches = heightInches % 12;
        return `${feet}' ${inches}"`;
    }

    return (
        <>
            {/* Islamic Chat Dialog */}
            <IslamicChatDialog
                isOpen={showChatDialog}
                onClose={() => setShowChatDialog(false)}
                onConfirm={handleConfirmChat}
                profileName={profile.name}
            />

            <div style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: "24px",
                overflow: "hidden",
                background: "#ffffff",
                boxShadow: "0 2px 16px rgba(27,77,62,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                border: "0.5px solid rgba(27,77,62,0.06)"
            }}>
                {/* ── Photo area — 70% ── */}
                <div
                    style={{
                        position: "relative",
                        height: "70%",
                        flexShrink: 0,
                        cursor: "pointer",
                        background: "#f5f5f5"
                    }}
                    onClick={handlePhotoTap}
                >
                    <PhotoDots total={photos.length} current={photoIdx} />

                    <ImageAvatar
                        images={photos.length ? [photos[photoIdx]] : []}
                        gender={profile.gender}
                        alt={profile.name}
                        isBlurred={profile.is_blurred_images}
                        viewerIsPro={iamPro}
                        className="w-full h-full object-cover"
                    />

                    {/* Status badges */}
                    <div style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        right: "10px",
                        zIndex: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        pointerEvents: "none"
                    }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {isPro ? (
                                <div style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "4px 10px",
                                    borderRadius: "10px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    background: "rgba(234,179,8,0.95)",
                                    color: "#854d0e",
                                    backdropFilter: "blur(10px)",
                                    letterSpacing: "0.02em"
                                }}>
                                    <Star style={{ width: "12px", height: "12px", fill: "#854d0e" }} />
                                    Premium
                                </div>
                            ) : null}

                            {isVerified && (
                                <div style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "4px 10px",
                                    borderRadius: "10px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    background: "rgba(59,130,246,0.95)",
                                    color: "#ffffff",
                                    backdropFilter: "blur(10px)",
                                    letterSpacing: "0.02em"
                                }}>
                                    <Verified style={{ width: "12px", height: "12px", fill: "#ffffff" }} />
                                    Verified
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gradient overlay + name */}
                    <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        padding: "52px 18px 16px",
                        background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.24) 50%, transparent 100%)"
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: "22px",
                            fontWeight: "500",
                            color: "#ffffff",
                            letterSpacing: "-0.015em",
                            lineHeight: "1.2"
                        }}>
                            {profile.name}{profile.age ? `, ${profile.age}` : ""}
                        </h2>
                        {location && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                marginTop: "6px"
                            }}>
                                <MapPin style={{ width: "13px", height: "13px", color: "rgba(255,255,255,0.75)" }} />
                                <span style={{
                                    fontSize: "13px",
                                    color: "rgba(255,255,255,0.85)",
                                    fontWeight: "400"
                                }}>
                                    {location}
                                </span>
                                {(typeof isShowLastSeen === "undefined" || !!isShowLastSeen) && profile.last_seen && (
                                    <span style={{
                                        fontSize: "13px",
                                        color: "rgba(255,255,255,0.55)",
                                        fontWeight: "400"
                                    }}>
                                        · {formatLastSeen(profile.last_seen)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Info panel — remaining 30% ── */}
                <div style={{
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    background: "#ffffff"
                }}>
                    {/* Pill tags */}
                    <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        padding: "14px 16px 10px"
                    }}>
                        {profile.profession && <Pill>{profile.profession}</Pill>}
                        {profile.height_inches && <Pill>{formatHeight(profile.height_inches)}</Pill>}
                        {profile.marital_status && <Pill>{profile.marital_status}</Pill>}
                        {profile.sect && <Pill>{profile.sect}</Pill>}

                        {profile.education && <Pill>{profile.education}</Pill>}
                    </div>

                    {/* Action bar */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 16px"
                    }}>
                        {/* Pass */}
                        <ActionBtn onClick={onPass} variant="danger">
                            <X style={{ width: "22px", height: "22px", color: "#ef4444" }} />
                        </ActionBtn>

                        {/* Info */}
                        <ActionBtn onClick={gotoProfile}>
                            <Info style={{ width: "20px", height: "20px", color: "#1B4D3E" }} />
                        </ActionBtn>

                        {/* Like — primary large */}
                        <ActionBtn onClick={onLike} variant="primary" size="lg">
                            <Heart style={{ width: "28px", height: "28px", color: "#ffffff", fill: "#ffffff" }} />
                        </ActionBtn>

                        {/* Message - NEW */}
                        <ActionBtn onClick={handleChatClick} variant="message">
                            <MessageCircle style={{ width: "20px", height: "20px", color: "#1B4D3E" }} />
                        </ActionBtn>

                        {/* Super like */}
                        <ActionBtn onClick={onSuperLike} variant="super">
                            <Star style={{ width: "22px", height: "22px", color: "#a855f7", fill: "#a855f7" }} />
                        </ActionBtn>
                    </div>
                </div>
            </div>
        </>
    );
}
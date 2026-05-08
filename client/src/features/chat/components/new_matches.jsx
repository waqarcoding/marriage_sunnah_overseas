// @ts-nocheck
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import ImageAvatar from "../../../ui/image";
import AuthService from "../../auth/services/AuthService";

function getFirstAvatar(match) {
    if (Array.isArray(match.avatar) && match.avatar.length > 0) return match.avatar[0];
    if (typeof match.avatar === "string" && match.avatar.trim()) return match.avatar;
    if (Array.isArray(match.images) && match.images.length > 0) return match.images[0];
    if (typeof match.images === "string" && match.images.trim()) {
        try {
            const arr = JSON.parse(match.images);
            if (Array.isArray(arr) && arr.length > 0) return arr[0];
        } catch { }
    }
    if (typeof match.photo === "string" && match.photo.trim()) return match.photo;
    return null;
}
async function isPro() {
    return await AuthService.isPro();
}
export default function NewMatches({ matches, onClick }) {
    if (!matches?.length) return null;

    // ✅ Current viewer's pro status — not the match's
    const viewerIsPro = isPro();

    return (
        <div className="border-b px-5 py-4 flex-shrink-0"
            style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3.5">
                <h2 className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--muted-foreground)" }}>
                    New Matches
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--secondary)", color: "var(--foreground)" }}>
                    {matches.length} new
                </span>
            </div>

            <div className="flex gap-3.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {matches.map((match, i) => {
                    const avatarSrc = getFirstAvatar(match);

                    return (
                        <motion.button key={match.id} onClick={() => onClick?.(match)}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: i * 0.05 }}
                            whileHover={{ y: -2 }} whileTap={{ scale: 0.93 }}
                            className="flex-shrink-0 flex flex-col items-center gap-2">

                            {/* Avatar with ring */}
                            <div className="relative">
                                <div className="absolute inset-0 rounded-2xl scale-[1.06] -z-10"
                                    style={{ backgroundColor: "var(--foreground)", opacity: 0.12 }} />

                                {/* ✅ Use ImageAvatar with blur support */}
                                <div className="w-[68px] h-[68px] rounded-2xl overflow-hidden"
                                    style={{ backgroundColor: "var(--muted)" }}>
                                    <ImageAvatar
                                        images={avatarSrc ? [avatarSrc] : []}
                                        gender={match.gender}
                                        alt={match.name}
                                        isBlurred={match.is_blurred_images}
                                        viewerIsPro={viewerIsPro}
                                        className="w-full h-full rounded-2xl"
                                    />
                                </div>

                                {/* Heart badge */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.05 + 0.2, type: "spring", stiffness: 300 }}
                                    className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2"
                                    style={{ backgroundColor: "var(--foreground)", borderColor: "var(--background)" }}>
                                    <Heart className="w-3 h-3"
                                        style={{ color: "var(--background)", fill: "var(--background)" }} />
                                </motion.div>
                            </div>

                            <span className="text-[11px] font-medium text-center truncate w-[72px] leading-tight"
                                style={{ color: "var(--muted-foreground)" }}>
                                {match.name}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
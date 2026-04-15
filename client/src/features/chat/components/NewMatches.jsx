import { motion } from "motion/react";
import { Heart } from "lucide-react";

export default function NewMatches({ matches, onClick }) {
    if (!matches?.length) return null;

    return (
        <div className="border-b px-5 py-4 flex-shrink-0"
            style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>

            <div className="flex items-center justify-between mb-3.5">
                <h2 className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--muted-foreground)" }}>New Matches</h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--secondary)", color: "var(--foreground)" }}>
                    {matches.length} new
                </span>
            </div>

            <div className="flex gap-3.5 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none" }}>
                {matches.map((match, i) => (
                    <motion.button
                        key={match.id}
                        onClick={() => onClick?.(match)}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.93 }}
                        className="flex-shrink-0 flex flex-col items-center gap-2"
                    >
                        {/* Avatar with ring */}
                        <div className="relative">
                            <div className="absolute inset-0 rounded-2xl scale-[1.06] -z-10"
                                style={{ backgroundColor: "var(--foreground)", opacity: 0.12 }} />
                            <div className="w-[68px] h-[68px] rounded-2xl overflow-hidden"
                                style={{ backgroundColor: "var(--muted)" }}>
                                {match.photo ? (
                                    <img src={match.photo} alt={match.name}
                                        className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center
                                        font-bold text-xl select-none"
                                        style={{ backgroundColor: "var(--secondary)", color: "var(--foreground)" }}>
                                        {match.name?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                )}
                            </div>

                            {/* Heart badge */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.05 + 0.2, type: "spring", stiffness: 300 }}
                                className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full
                                    flex items-center justify-center border-2"
                                style={{ backgroundColor: "var(--foreground)", borderColor: "var(--background)" }}
                            >
                                <Heart className="w-3 h-3" style={{ color: "var(--background)", fill: "var(--background)" }} />
                            </motion.div>
                        </div>

                        <span className="text-[11px] font-medium text-center truncate w-[72px] leading-tight"
                            style={{ color: "var(--muted-foreground)" }}>
                            {match.name}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

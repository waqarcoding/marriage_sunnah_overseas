// @ts-nocheck
import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, MapPin, Maximize2 } from "lucide-react";
import ImageAvatar from "../../../../ui/image";

function isOnline(d) { return d && Math.floor((Date.now() - new Date(d)) / 1000) < 3600; }
function formatLastSeen(d) {
    if (!d) return "";
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

// ── Match ring ────────────────────────────────────────────────────────────────
function MatchRing({ pct }) {
    if (!pct) return null;
    const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#9ca3af";
    const r = 24, circ = 2 * Math.PI * r;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px"
        }}>
            <svg width="64" height="64" viewBox="0 0 64 64">
                <circle
                    cx="32"
                    cy="32"
                    r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4.5"
                />
                <motion.circle
                    cx="32"
                    cy="32"
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    transform="rotate(-90 32 32)"
                    initial={{ strokeDasharray: `0 ${circ}` }}
                    animate={{ strokeDasharray: `${circ * pct / 100} ${circ}` }}
                    transition={{ duration: 1.2, ease: [0.34, 0.7, 0.18, 1] }}
                />
                <text
                    x="32"
                    y="37"
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="600"
                    fill="white"
                >
                    {pct}%
                </text>
            </svg>
            <span style={{
                fontSize: "9px",
                fontWeight: "600",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.08em",
                textTransform: "uppercase"
            }}>
                Match
            </span>
        </div>
    );
}

// ── Image slide ───────────────────────────────────────────────────────────────
function ImageSlide({ src, isFirst, profile, isPro }) {
    return (
        <div style={{
            minWidth: "100%",
            height: "100%",
            scrollSnapAlign: "center",
            flexShrink: 0
        }}>
            <ImageAvatar
                images={[src]}
                alt=""
                isBlurred={profile?.is_blurred_images}
                viewerIsPro={isPro}

                className="w-full h-full object-cover"
                style={{
                    opacity: 0,
                    transition: "opacity 0.25s ease"
                }}
                onLoad={(e) => { e.target.style.opacity = "1"; }}
                loading={isFirst ? "eager" : "lazy"}
                fetchPriority={isFirst ? "high" : "auto"}
            />

        </div>
    );
}

// ── Video slide ───────────────────────────────────────────────────────────────
function VideoSlide({ src, isActive, onEnded }) {
    const ref = useRef(null);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const v = ref.current;
        if (!v) return;
        if (isActive) {
            v.currentTime = 0;
            v.play().then(() => setPlaying(true)).catch(() => { });
        } else {
            v.pause();
            setPlaying(false);
        }
    }, [isActive]);

    const toggle = (e) => {
        e.stopPropagation();
        const v = ref.current;
        if (!v) return;
        if (playing) {
            v.pause();
            setPlaying(false);
        } else {
            v.play();
            setPlaying(true);
        }
    };

    return (
        <div style={{
            minWidth: "100%",
            height: "100%",
            scrollSnapAlign: "center",
            flexShrink: 0,
            position: "relative",
            background: "#000000"
        }}>
            <video
                ref={ref}
                src={src}
                muted
                playsInline
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                }}
                onEnded={() => {
                    setPlaying(false);
                    onEnded?.();
                }}
            />

            {/* Play button */}
            {!playing && (
                <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    zIndex: 20
                }}>
                    <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={toggle}
                        style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(0,0,0,0.65)",
                            backdropFilter: "blur(12px)",
                            border: "0.5px solid rgba(255,255,255,0.2)",
                            cursor: "pointer",
                            pointerEvents: "auto"
                        }}
                    >
                        <Play style={{
                            width: "24px",
                            height: "24px",
                            color: "#ffffff",
                            fill: "#ffffff",
                            marginLeft: "2px"
                        }} />
                    </motion.button>
                </div>
            )}

            {/* Pause button (top right when playing) */}
            {playing && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={toggle}
                    style={{
                        position: "absolute",
                        top: "60px",
                        right: "14px",
                        zIndex: 20,
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(8px)",
                        border: "0.5px solid rgba(255,255,255,0.15)",
                        cursor: "pointer"
                    }}
                >
                    <Pause style={{
                        width: "16px",
                        height: "16px",
                        color: "#ffffff",
                        fill: "#ffffff"
                    }} />
                </motion.button>
            )}

            {/* Video badge */}
            <div style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                padding: "4px 10px",
                borderRadius: "10px",
                fontSize: "10px",
                fontWeight: "600",
                color: "#ffffff",
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                border: "0.5px solid rgba(255,255,255,0.15)",
                zIndex: 20,
                pointerEvents: "none",
                letterSpacing: "0.05em"
            }}>
                VIDEO
            </div>
        </div>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ProfileMediaSection({ media, profile, matchPct, onExpand, isPro }) {
    const carouselRef = useRef(null);
    const isProgrammatic = useRef(false);
    const [idx, setIdx] = useState(0);

    const p = {
        name: profile.name || "Anonymous",
        age: profile.age || null,
        location: [profile.city, profile.country].filter(Boolean).join(", "),
        last_seen: profile.last_seen || null,
    };

    // Preload images
    useEffect(() => {
        media.filter(m => m.type === "image").forEach(m => {
            const img = new Image();
            img.fetchPriority = "high";
            img.src = m.url;
        });
    }, [profile?.individual_id]);

    useEffect(() => { setIdx(0); }, [profile?.individual_id]);

    const onScroll = useCallback(() => {
        if (isProgrammatic.current) {
            isProgrammatic.current = false;
            return;
        }
        if (!carouselRef.current) return;
        setIdx(Math.round(carouselRef.current.scrollLeft / carouselRef.current.offsetWidth));
    }, []);

    const scrollTo = useCallback((i) => {
        if (!carouselRef.current) return;
        isProgrammatic.current = true;
        carouselRef.current.scrollTo({
            left: carouselRef.current.offsetWidth * i,
            behavior: "smooth"
        });
        setIdx(i);
    }, []);

    if (!media.length) return null;

    return (
        <div style={{ padding: "16px 16px 0" }}>
            {/* Main carousel */}
            <div style={{
                position: "relative",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
                background: "#000000",
                aspectRatio: "1/1"
            }}>
                {/* Scroll container */}
                <div
                    ref={carouselRef}
                    onScroll={onScroll}
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        scrollSnapType: "x mandatory",
                        overflowX: "scroll",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        WebkitOverflowScrolling: "touch",
                        scrollBehavior: "smooth"
                    }}
                >
                    {media.map((item, i) =>
                        item.type === "video" ? (
                            <VideoSlide
                                key={`v${i}`}
                                src={item.url}
                                isActive={idx === i}
                                onEnded={() => scrollTo((i + 1) % media.length)}
                            />
                        ) : (
                            <ImageSlide key={`p${i}`} src={item.url} isFirst={i === 0} profile={profile} isPro={isPro} />

                        )
                    )}
                </div>

                {/* Tap zones for navigation */}
                {media.length > 1 && (
                    <>
                        <button
                            onClick={() => scrollTo((idx - 1 + media.length) % media.length)}
                            style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                width: "50%",
                                height: "100%",
                                zIndex: 10,
                                background: "none",
                                border: "none",
                                cursor: "pointer"
                            }}
                        />
                        <button
                            onClick={() => scrollTo((idx + 1) % media.length)}
                            style={{
                                position: "absolute",
                                right: 0,
                                top: 0,
                                width: "50%",
                                height: "100%",
                                zIndex: 10,
                                background: "none",
                                border: "none",
                                cursor: "pointer"
                            }}
                        />
                    </>
                )}

                {/* Dot indicators */}
                {media.length > 1 && (
                    <div style={{
                        position: "absolute",
                        top: "14px",
                        left: 0,
                        right: 0,
                        zIndex: 15,
                        display: "flex",
                        justifyContent: "center",
                        gap: "6px",
                        pointerEvents: "none"
                    }}>
                        {media.map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    height: "3px",
                                    borderRadius: "2px",
                                    background: i === idx ? "#ffffff" : "rgba(255,255,255,0.4)",
                                    width: i === idx ? "24px" : "12px",
                                    transition: "all 0.25s cubic-bezier(0.34, 0.7, 0.18, 1)"
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Media counter */}
                {media.length > 1 && (
                    <div style={{
                        position: "absolute",
                        top: "14px",
                        right: "14px",
                        padding: "4px 10px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#ffffff",
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(8px)",
                        border: "0.5px solid rgba(255,255,255,0.15)",
                        zIndex: 15,
                        pointerEvents: "none",
                        letterSpacing: "0.01em"
                    }}>
                        {idx + 1}/{media.length}
                    </div>
                )}

                {/* Expand button */}
                <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onExpand(idx);
                    }}
                    style={{
                        position: "absolute",
                        top: "14px",
                        left: "14px",
                        zIndex: 15, // Lower so it doesn't appear on top of appbar
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(8px)",
                        border: "0.5px solid rgba(255,255,255,0.15)",
                        cursor: "pointer"
                    }}

                >
                    <Maximize2 style={{ width: "18px", height: "18px", color: "#ffffff" }} />
                </motion.button>

                {/* Bottom overlay - name, location, status, match */}
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    padding: "80px 18px 18px",
                    background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
                    pointerEvents: "none"
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between"
                    }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h1 style={{
                                margin: 0,
                                fontSize: "22px",
                                fontWeight: "500",
                                color: "#ffffff",
                                lineHeight: "1.2",
                                letterSpacing: "-0.015em"
                            }}>
                                {p.name}{p.age ? `, ${p.age}` : ""}
                            </h1>
                            {p.location && (
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    marginTop: "6px"
                                }}>
                                    <MapPin style={{ width: "13px", height: "13px", color: "rgba(255,255,255,0.7)" }} />
                                    <span style={{
                                        fontSize: "13px",
                                        fontWeight: "400",
                                        color: "rgba(255,255,255,0.75)"
                                    }}>
                                        {p.location}
                                    </span>
                                </div>
                            )}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                marginTop: "8px"
                            }}>
                                <span style={{
                                    width: "7px",
                                    height: "7px",
                                    borderRadius: "50%",
                                    background: isOnline(p.last_seen) ? "#10b981" : "#6b7280",
                                    animation: isOnline(p.last_seen) ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none"
                                }} />
                                <span style={{
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    color: "rgba(255,255,255,0.65)"
                                }}>
                                    {isOnline(p.last_seen) ? `Active ${formatLastSeen(p.last_seen)}` : "Offline"}
                                </span>
                            </div>
                        </div>
                        <MatchRing pct={matchPct} />
                    </div>
                </div>
            </div>

            {/* Thumbnails */}
            {media.length > 1 && (
                <div style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "12px",
                    paddingBottom: "4px",
                    overflowX: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none"
                }}>
                    {media.map((item, i) => (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => scrollTo(i)}
                            style={{
                                flexShrink: 0,
                                width: "60px",
                                height: "60px",
                                borderRadius: "14px",
                                overflow: "hidden",
                                border: i === idx ? "2px solid #1B4D3E" : "2px solid transparent",
                                opacity: i === idx ? 1 : 0.5,
                                background: "#000000",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                        >
                            {item.type === "video" ? (
                                <div style={{
                                    width: "100%",
                                    height: "100%",
                                    background: "#1a1a1a",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Play style={{
                                        width: "20px",
                                        height: "20px",
                                        color: "#ffffff",
                                        fill: "#ffffff"
                                    }} />
                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    alt=""
                                    loading="lazy"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                    }}
                                />
                            )}
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    );
}
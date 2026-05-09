import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, Maximize2, Play } from "lucide-react";
import ImageAvatar from "../../../../ui/image";

// ── Media Skeleton ────────────────────────────────────────────────────────────
function MediaSkeleton() {
    return (
        <div style={{ padding: "16px 16px 0" }}>
            <div style={{
                position: "relative",
                borderRadius: "24px",
                overflow: "hidden",
                background: "linear-gradient(135deg, rgba(27,77,62,0.03) 0%, rgba(27,77,62,0.1) 100%)",
                aspectRatio: "1/1"
            }}>
                {/* Main skeleton */}
                <div className="animate-pulse" style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, rgba(27,77,62,0.05) 0%, rgba(27,77,62,0.15) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    {/* Loading icon placeholder */}
                    <div style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: "rgba(27,77,62,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <div style={{
                            width: "32px",
                            height: "32px",
                            border: "3px solid rgba(27,77,62,0.2)",
                            borderTopColor: "#1B4D3E",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite"
                        }} />
                    </div>
                </div>

                {/* Skeleton dots */}
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
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse"
                            style={{
                                height: "3px",
                                width: "12px",
                                borderRadius: "2px",
                                background: "rgba(27,77,62,0.15)"
                            }}
                        />
                    ))}
                </div>

                {/* Bottom info skeleton */}
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    padding: "18px",
                    background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)"
                }}>
                    <div className="animate-pulse" style={{
                        height: "24px",
                        width: "60%",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.15)",
                        marginBottom: "8px"
                    }} />
                    <div className="animate-pulse" style={{
                        height: "16px",
                        width: "40%",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.1)"
                    }} />
                </div>
            </div>

            {/* Thumbnail skeletons */}
            <div style={{
                display: "flex",
                gap: "8px",
                marginTop: "12px",
                paddingBottom: "4px"
            }}>
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="animate-pulse"
                        style={{
                            flexShrink: 0,
                            width: "60px",
                            height: "60px",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, rgba(27,77,62,0.05) 0%, rgba(27,77,62,0.12) 100%)"
                        }}
                    />
                ))}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

// ── Image Slide with Loading State ───────────────────────────────────────────
function ImageSlide({ src, isFirst, profile, isPro }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div style={{
            minWidth: "100%",
            height: "100%",
            scrollSnapAlign: "start",
            position: "relative",
            background: "#000000"
        }}>
            {/* Skeleton while loading */}
            {!loaded && (
                <div className="animate-pulse" style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg, rgba(27,77,62,0.08) 0%, rgba(27,77,62,0.15) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        border: "3px solid rgba(27,77,62,0.2)",
                        borderTopColor: "#1B4D3E",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }} />
                </div>
            )}

            {/* Actual image */}
            <ImageAvatar
                images={[src]}
                gender={profile.gender}
                alt={profile.name}
                isBlurred={profile.is_blurred_images}
                viewerIsPro={isPro}
                className="w-full h-full object-cover"
                // @ts-ignore
                style={{
                    opacity: loaded ? 1 : 0,
                    transition: "opacity 0.3s ease-in-out"
                }}
                onLoad={() => setLoaded(true)}
            />
        </div>
    );
}

// ── Video Slide ───────────────────────────────────────────────────────────────
function VideoSlide({ src, isActive, onEnded }) {
    const videoRef = useRef(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!videoRef.current) return;
        if (isActive) {
            videoRef.current.play().catch(() => { });
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [isActive]);

    return (
        <div style={{
            minWidth: "100%",
            height: "100%",
            scrollSnapAlign: "start",
            position: "relative",
            background: "#000000"
        }}>
            {/* Skeleton while loading */}
            {!loaded && (
                <div className="animate-pulse" style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg, rgba(27,77,62,0.08) 0%, rgba(27,77,62,0.15) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        border: "3px solid rgba(27,77,62,0.2)",
                        borderTopColor: "#1B4D3E",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }} />
                </div>
            )}

            <video
                ref={videoRef}
                src={src}
                onEnded={onEnded}
                onLoadedData={() => setLoaded(true)}
                playsInline
                loop
                muted
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: loaded ? 1 : 0,
                    transition: "opacity 0.3s ease-in-out"
                }}
            />
        </div>
    );
}

// ── Match Ring ────────────────────────────────────────────────────────────────
function MatchRing({ pct }) {
    if (pct == null) return null;
    const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
    return (
        <div style={{
            position: "relative",
            width: "64px",
            height: "64px",
            flexShrink: 0
        }}>
            <svg style={{
                position: "absolute",
                inset: 0,
                transform: "rotate(-90deg)"
            }}>
                <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="4"
                />
                <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeDasharray={`${(pct / 100) * 176} 176`}
                    strokeLinecap="round"
                />
            </svg>
            <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column"
            }}>
                <span style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#ffffff",
                    lineHeight: "1"
                }}>
                    {pct}%
                </span>
                <span style={{
                    fontSize: "9px",
                    fontWeight: "500",
                    color: "rgba(255,255,255,0.7)",
                    marginTop: "2px"
                }}>
                    Match
                </span>
            </div>
        </div>
    );
}

// @ts-ignore
function isOnline(d) { return d && Math.floor((Date.now() - new Date(d)) / 1000) < 3600; }

function formatLastSeen(d) {
    if (!d) return "";
    // @ts-ignore
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return "now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

export default function ProfileMediaSection({ media, profile, matchPct, onExpand, isPro }) {
    const carouselRef = useRef(null);
    const isProgrammatic = useRef(false);
    const [idx, setIdx] = useState(0);
    const [allImagesLoaded, setAllImagesLoaded] = useState(false);

    const p = {
        name: profile.name || "Anonymous",
        age: profile.age || null,
        location: [profile.city, profile.country].filter(Boolean).join(", "),
        last_seen: profile.last_seen || null,
    };

    // Preload images and track loading state
    useEffect(() => {
        const imageMedia = media.filter(m => m.type === "image");
        if (imageMedia.length === 0) {
            setAllImagesLoaded(true);
            return;
        }

        let loadedCount = 0;
        const totalImages = imageMedia.length;

        imageMedia.forEach(m => {
            const img = new Image();
            img.fetchPriority = "high";
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    setAllImagesLoaded(true);
                }
            };
            img.onerror = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    setAllImagesLoaded(true);
                }
            };
            img.src = m.url;
        });
    }, [media]);

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

    // Show skeleton while images are loading
    if (!allImagesLoaded && !media.length) {
        return <MediaSkeleton />;
    }

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
                            <ImageSlide
                                key={`p${i}`}
                                src={item.url}
                                isFirst={i === 0}
                                profile={profile}
                                isPro={isPro}
                            />
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
                        zIndex: 15,
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

                {/* Bottom overlay */}
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
// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from "lucide-react";

// ── Pinch-zoom for images ─────────────────────────────────────────────────────
function ZoomableImage({ src, alt }) {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const lastDist = useRef(null);
    const startPos = useRef(null);
    const isDragging = useRef(false);
    const lastTap = useRef(0);

    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const onTouchStart = (e) => {
        if (e.touches.length === 2) {
            lastDist.current = dist(e.touches);
        } else if (e.touches.length === 1 && scale > 1) {
            startPos.current = { x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y };
            isDragging.current = true;
        }
    };

    const onTouchMove = (e) => {
        if (e.touches.length === 2 && lastDist.current) {
            const newDist = dist(e.touches);
            setScale(s => Math.max(1, Math.min(4, s * (newDist / lastDist.current))));
            lastDist.current = newDist;
        } else if (e.touches.length === 1 && isDragging.current && startPos.current) {
            setOffset({ x: e.touches[0].clientX - startPos.current.x, y: e.touches[0].clientY - startPos.current.y });
        }
    };

    const onTouchEnd = () => {
        lastDist.current = null;
        isDragging.current = false;
        if (scale <= 1) setOffset({ x: 0, y: 0 });
    };

    const onTap = () => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            setScale(s => s > 1 ? 1 : 2.5);
            setOffset({ x: 0, y: 0 });
        }
        lastTap.current = now;
    };

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={onTap}
        >
            <img
                src={src}
                alt={alt}
                style={{
                    transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
                    transition: isDragging.current ? "none" : "transform 0.2s ease",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    touchAction: "none",
                    userSelect: "none"
                }}
            />
        </div>
    );
}

// ── Video player with controls ────────────────────────────────────────────────
function VideoPlayer({ src }) {
    const ref = useRef(null);
    const [playing, setPlaying] = useState(true);
    const [muted, setMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showCtrl, setShowCtrl] = useState(true);
    const hideTimer = useRef(null);

    useEffect(() => {
        const v = ref.current;
        if (!v) return;
        v.play().catch(() => { });
        const onTime = () => setProgress(v.currentTime / (v.duration || 1));
        const onMeta = () => setDuration(v.duration);
        v.addEventListener("timeupdate", onTime);
        v.addEventListener("loadedmetadata", onMeta);
        return () => {
            v.removeEventListener("timeupdate", onTime);
            v.removeEventListener("loadedmetadata", onMeta);
        };
    }, [src]);

    const autoHide = () => {
        clearTimeout(hideTimer.current);
        setShowCtrl(true);
        hideTimer.current = setTimeout(() => setShowCtrl(false), 3000);
    };

    const togglePlay = () => {
        const v = ref.current;
        if (!v) return;
        if (playing) {
            v.pause();
            setPlaying(false);
        } else {
            v.play();
            setPlaying(true);
        }
        autoHide();
    };

    const seek = (e) => {
        const v = ref.current;
        if (!v) return;
        const rect = e.currentTarget.getBoundingClientRect();
        v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
        autoHide();
    };

    const fmt = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#000000"
            }}
            onClick={togglePlay}
            onTouchStart={autoHide}
        >
            <video
                ref={ref}
                src={src}
                muted={muted}
                playsInline
                loop
                style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain"
                }}
            />

            <AnimatePresence>
                {showCtrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            padding: "20px",
                            background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 35%, transparent 70%, rgba(0,0,0,0.4) 100%)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mute button */}
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <motion.button
                                whileTap={{ scale: 0.92 }}
                                onClick={() => setMuted(m => !m)}
                                style={{
                                    width: "44px",
                                    height: "44px",
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
                                {muted ? (
                                    <VolumeX style={{ width: "20px", height: "20px", color: "#ffffff" }} />
                                ) : (
                                    <Volume2 style={{ width: "20px", height: "20px", color: "#ffffff" }} />
                                )}
                            </motion.button>
                        </div>

                        {/* Play/pause button */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <motion.button
                                whileTap={{ scale: 0.92 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={togglePlay}
                                style={{
                                    width: "68px",
                                    height: "68px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "rgba(0,0,0,0.65)",
                                    backdropFilter: "blur(12px)",
                                    border: "0.5px solid rgba(255,255,255,0.2)",
                                    cursor: "pointer"
                                }}
                            >
                                {playing ? (
                                    <Pause style={{
                                        width: "28px",
                                        height: "28px",
                                        color: "#ffffff",
                                        fill: "#ffffff"
                                    }} />
                                ) : (
                                    <Play style={{
                                        width: "28px",
                                        height: "28px",
                                        color: "#ffffff",
                                        fill: "#ffffff",
                                        marginLeft: "3px"
                                    }} />
                                )}
                            </motion.button>
                        </div>

                        {/* Seekbar */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            color: "#ffffff",
                            fontSize: "12px",
                            fontWeight: "500"
                        }}>
                            <span style={{ minWidth: "38px", textAlign: "right" }}>
                                {fmt(progress * duration)}
                            </span>
                            <div
                                onClick={seek}
                                style={{
                                    flex: 1,
                                    height: "4px",
                                    borderRadius: "2px",
                                    background: "rgba(255,255,255,0.25)",
                                    cursor: "pointer",
                                    position: "relative"
                                }}
                            >
                                <div style={{
                                    height: "100%",
                                    borderRadius: "2px",
                                    background: "#ffffff",
                                    width: `${progress * 100}%`
                                }} />
                                <div style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: `${progress * 100}%`,
                                    transform: "translate(-50%, -50%)",
                                    width: "14px",
                                    height: "14px",
                                    borderRadius: "50%",
                                    background: "#ffffff",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                                }} />
                            </div>
                            <span style={{ minWidth: "38px" }}>
                                {fmt(duration)}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Main MediaViewer ──────────────────────────────────────────────────────────
export default function MediaViewer({ media, initialIdx = 0, onClose }) {
    const [cur, setCur] = useState(initialIdx);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const prev = () => setCur(i => (i - 1 + media.length) % media.length);
    const next = () => setCur(i => (i + 1) % media.length);
    const item = media[cur];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 99999,
                background: "#000000",
                display: "flex",
                flexDirection: "column",
                touchAction: "none"
            }}
        >
            {/* Header */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                paddingTop: "calc(env(safe-area-inset-top, 16px) + 8px)",
                background: "linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)"
            }}>
                <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={onClose}
                    style={{
                        width: "44px",
                        height: "44px",
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
                    <X style={{ width: "22px", height: "22px", color: "#ffffff" }} />
                </motion.button>

                <div style={{
                    padding: "6px 14px",
                    borderRadius: "12px",
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(8px)",
                    border: "0.5px solid rgba(255,255,255,0.15)"
                }}>
                    <span style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#ffffff",
                        letterSpacing: "0.01em"
                    }}>
                        {cur + 1} / {media.length}
                    </span>
                </div>

                <div style={{ width: "44px" }} />
            </div>

            {/* Media area */}
            <div style={{ flex: 1, position: "relative" }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={cur}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.04 }}
                        transition={{ duration: 0.22, ease: [0.34, 0.7, 0.18, 1] }}
                        style={{
                            position: "absolute",
                            inset: 0
                        }}
                    >
                        {item?.type === "video" ? (
                            <VideoPlayer src={item.url} />
                        ) : (
                            <ZoomableImage src={item?.url} alt="" />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                {media.length > 1 && (
                    <>
                        <motion.button
                            whileTap={{ scale: 0.92 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={prev}
                            style={{
                                position: "absolute",
                                left: "16px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: "44px",
                                height: "44px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(0,0,0,0.6)",
                                backdropFilter: "blur(8px)",
                                border: "0.5px solid rgba(255,255,255,0.15)",
                                cursor: "pointer",
                                zIndex: 20
                            }}
                        >
                            <ChevronLeft style={{ width: "24px", height: "24px", color: "#ffffff" }} />
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.92 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={next}
                            style={{
                                position: "absolute",
                                right: "16px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: "44px",
                                height: "44px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(0,0,0,0.6)",
                                backdropFilter: "blur(8px)",
                                border: "0.5px solid rgba(255,255,255,0.15)",
                                cursor: "pointer",
                                zIndex: 20
                            }}
                        >
                            <ChevronRight style={{ width: "24px", height: "24px", color: "#ffffff" }} />
                        </motion.button>
                    </>
                )}
            </div>

            {/* Dot indicators */}
            {media.length > 1 && (
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "20px",
                    paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 8px)"
                }}>
                    {media.map((_, i) => (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCur(i)}
                            style={{
                                height: "6px",
                                borderRadius: "3px",
                                background: i === cur ? "#ffffff" : "rgba(255,255,255,0.35)",
                                width: i === cur ? "24px" : "6px",
                                transition: "all 0.25s cubic-bezier(0.34, 0.7, 0.18, 1)",
                                cursor: "pointer",
                                border: "none",
                                padding: 0
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}
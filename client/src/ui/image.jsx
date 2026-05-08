// @ts-nocheck
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// ✅ SUPER FAST: Preload image in browser cache
function useCachedImage(src) {
    return useQuery({
        queryKey: ["img", src],
        queryFn: async () => {
            if (!src) throw new Error("no src");

            // ✅ Create image and wait for it to fully load into browser cache
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    // ✅ Image is now in browser cache - instant on next render
                    resolve(src);
                };
                img.onerror = () => reject(new Error("failed"));
                img.src = src;
            });
        },
        enabled: !!src,
        staleTime: Infinity,
        gcTime: Infinity,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });
}

export function formatLastSeen(dateStr) {
    if (!dateStr) return "";
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export function isOnline(dateStr) {
    if (!dateStr) return false;
    return Math.floor((Date.now() - new Date(dateStr)) / 1000) < 3600;
}

export function LastSeenBadge({ profile, viewerIsPro = false }) {
    const profileCanShowIt = profile?.is_pro && profile?.show_last_seen !== false;
    if (!profileCanShowIt || !viewerIsPro) return null;

    const online = isOnline(profile.last_seen);
    const seen = formatLastSeen(profile.last_seen);
    if (!seen) return null;

    return (
        <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${online ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
            <span className="text-xs" style={{ color: online ? "#10b981" : "#9ca3af" }}>
                {online ? "Online" : (seen === "0m ago" ? "just now" : seen)}
            </span>
        </div>
    );
}

function GenderPlaceholder({ gender }) {
    const isFemale = gender?.toLowerCase() === "female";
    return (
        <span className="flex items-center justify-center w-full h-full rounded-[inherit]"
            style={{ backgroundColor: '#f3f4f6' }}>
            {isFemale ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2" style={{ color: '#9ca3af' }}>
                    <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c3.17 0 6 1.34 6 3v1H6v-1c0-1.66 2.83-3 6-3zm1 4v4h-2v-4h-2v-2h6v2h-2z" />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2" style={{ color: '#9ca3af' }}>
                    <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c3.17 0 6 1.34 6 3v1H6v-1c0-1.66 2.83-3 6-3z" />
                </svg>
            )}
        </span>
    );
}

function CircularSpinner({ size = 32, thickness = 3 }) {
    // Calculate styles based on size and thickness for inner/outer rings
    const containerStyle = {
        width: size,
        height: size,
    };
    const borderBase = `${thickness}px solid`;
    return (
        <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 20 }}
        >
            <div className="relative" style={containerStyle}>
                {/* Track (faded) */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        border: `${borderBase} rgba(27, 77, 62, 0.13)`,
                        borderRadius: '50%',
                        boxSizing: 'border-box',
                    }}
                />
                {/* Spinner (colored arc) */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        border: `${borderBase} transparent`,
                        borderTopColor: '#1B4D3E',
                        borderRightColor: '#1B4D3E',
                        borderRadius: '50%',
                        animation: 'spinAnimation 0.85s linear infinite',
                        boxSizing: 'border-box',
                    }}
                />
                {/* Inline keyframes (since tailwind doesn't define these) */}
                <style>{`
                    @keyframes spinAnimation {
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}

export default function ImageAvatar({
    images,
    gender,
    alt = "",
    className = "",
    interestStatus = "pending",
    isShowPending = true,
    isBlurred = false,
    viewerIsPro = false,
    shouldShowOverlay = true,
}) {
    const [imgError, setImgError] = useState(false);

    const src = useMemo(() => {
        if (Array.isArray(images) && typeof images[0] === "string") return images[0];
        if (typeof images === "string" && images.trim()) {
            try {
                const arr = JSON.parse(images);
                if (Array.isArray(arr) && typeof arr[0] === "string") return arr[0];
            } catch (_) { }
            if (images.startsWith("http")) return images;
        }
        return null;
    }, [images]);

    // ✅ Preload image into browser cache
    const { data: cachedSrc, isLoading, isError } = useCachedImage(src);

    const showFallback = !src || isError || imgError;
    const shouldBlur = isBlurred && !viewerIsPro;

    return (
        <span className={`relative block overflow-hidden ${className}`}>
            <span className="relative block w-full h-full overflow-hidden rounded-[inherit]">

                {/* ✅ Loading - only shows during initial fetch */}
                {isLoading && !cachedSrc && (
                    <>
                        <div
                            className="absolute inset-0"
                            style={{ backgroundColor: '#e8f5f1', zIndex: 0, }}
                        />
                        <CircularSpinner />
                    </>
                )}

                {/* ✅ Fallback */}
                {showFallback && !isLoading && (
                    <GenderPlaceholder gender={gender} />
                )}

                {/* ✅ Image - instant display (already in browser cache) */}
                {cachedSrc && !showFallback && (
                    <img
                        src={cachedSrc}
                        alt={shouldBlur ? "" : alt}
                        loading="eager"
                        decoding="sync"
                        className="object-cover w-full h-full rounded-[inherit] block"
                        style={{
                            aspectRatio: "1 / 1",
                            filter: shouldBlur ? "blur(2px)" : "none",
                            transform: shouldBlur ? "scale(1.1)" : "none",
                            backgroundColor: '#f3f4f6',

                        }}
                        onError={() => setImgError(true)}
                    />
                )}

                {/* ✅ Blur overlay */}
                {shouldBlur && shouldShowOverlay && cachedSrc && !showFallback && (
                    <span
                        className="absolute inset-0 flex flex-col items-center justify-center gap-1 cursor-pointer"
                        style={{ zIndex: 20, outline: "none" }}
                        onClick={() => window.location.href = "/subscription"}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                window.location.href = "/subscription";
                            }
                        }}
                    >
                        <span style={{ fontSize: "22px" }}>🔒</span>
                        <span
                            className="text-white text-center px-2 leading-tight"
                            style={{
                                fontSize: '10px',
                                fontWeight: 'bold',
                                textShadow: "0 1px 4px rgba(0,0,0,0.8)"
                            }}
                        >
                            Upgrade to view
                        </span>
                    </span>
                )}
            </span>

            {/* ✅ Bottom gradient */}
            {!shouldBlur && cachedSrc && !showFallback && (
                <span
                    className="pointer-events-none absolute inset-x-0 bottom-0"
                    style={{
                        height: '80px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                        zIndex: 10
                    }}
                />
            )}

            <style>{`
                @keyframes spinAnimation {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </span>
    );
}
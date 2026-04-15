import React, { useRef, useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";

// ⚡ Fetches image as blob URL — browser never re-downloads the same src
// ✅ exported

export async function fetchImageBlob(src) {
    const res = await fetch(src, { priority: "high" });
    if (!res.ok) throw new Error("Failed");
    const blob = await res.blob();
    return URL.createObjectURL(blob);  // stable local URL
}

function useCachedImage(src) {
    return useQuery({
        queryKey: ["img", src],
        queryFn: () => fetchImageBlob(src),
        enabled: !!src,
        staleTime: Infinity,      // ⚡ never refetch — image won't change
        gcTime: Infinity,  // ⚡ keep in memory forever
        retry: 1,
    });
}

export default function ImageAvatar({
    images,
    gender,
    alt = "",
    className = "",
    interestStatus = "pending",
    isShowPending = true,
}) {
    const src = React.useMemo(() => {
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

    // ⚡ react-query handles caching, dedup, loading, error — all in one
    const { data: blobUrl, isLoading, isError } = useCachedImage(src);

    const imgRef = useRef(null);
    const spinnerRef = useRef(null);

    const handleLoad = useCallback(() => {
        if (imgRef.current) imgRef.current.style.opacity = "1";
        if (spinnerRef.current) spinnerRef.current.style.display = "none";
    }, []);

    const showFallback = !src || isError;
    const alreadyLoaded = !!blobUrl && !isLoading;

    return (
        <span className={`relative block w-fit ${className}`}>
            <span className="relative block w-full h-full">
                {showFallback ? (
                    <GenderPlaceholder gender={gender} />
                ) : (
                    <>
                        {isLoading && (
                            <span
                                ref={spinnerRef}
                                className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                            >
                                <span className="block w-6 h-6 border-4 border-white/40 border-t-white border-b-white/60 rounded-full animate-spin" />
                            </span>
                        )}
                        {blobUrl && (
                            <img
                                ref={imgRef}
                                src={blobUrl}   // ⚡ local blob — instant, no network
                                alt={alt}
                                decoding="async"
                                className="bg-card object-cover w-full h-full rounded-[inherit] block"
                                style={{
                                    aspectRatio: "1 / 1",
                                    opacity: alreadyLoaded ? 1 : 0,
                                    transition: alreadyLoaded ? "none" : "opacity 0.15s ease",
                                }}
                                onLoad={handleLoad}
                            />
                        )}
                    </>
                )}
            </span>
            {/* Faded black gradient at image bottom */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent rounded-b-[inherit] z-10" />
            {interestStatus === "pending" && (
                <div className="absolute inset-0 backdrop-blur-sm sm:backdrop-blur-md z-10 flex items-start justify-end">
                    {isShowPending && (
                        <div className="mt-2 mr-2 bg-secondary/60 text-gray-accent px-2 py-0.5 rounded-full text-xs font-semibold shadow   select-none">
                            {interestStatus}
                        </div>
                    )}
                </div>
            )}
        </span>
    );
}

function GenderPlaceholder({ gender }) {
    const isFemale = gender?.toLowerCase() === "female";
    const isMale = gender?.toLowerCase() === "male";

    return (
        <span className="flex items-center justify-center w-full h-full rounded-[inherit] bg-card">
            {isFemale ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2 text-muted-foreground/50">
                    <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c3.17 0 6 1.34 6 3v1H6v-1c0-1.66 2.83-3 6-3zm1 4v4h-2v-4h-2v-2h6v2h-2z" />
                </svg>
            ) : isMale ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2 text-muted-foreground/50">
                    <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c3.17 0 6 1.34 6 3v1H6v-1c0-1.66 2.83-3 6-3z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2 text-muted-foreground/50">
                    <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c3.17 0 6 1.34 6 3v1H6v-1c0-1.66 2.83-3 6-3z" />
                </svg>
            )}
        </span>
    );
}
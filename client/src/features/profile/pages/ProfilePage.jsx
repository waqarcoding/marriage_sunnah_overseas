import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Heart, MapPin, Briefcase, GraduationCap,
    Info, Star, MessageCircle, ChevronLeft, X,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileService from "../api/ProfileService";
import ImageAvatar from "../../../components/ImageAvatar";

function formatLastSeen(dateStr) {
    if (!dateStr) return "";
    // @ts-ignore
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function isOnline(dateStr) {
    if (!dateStr) return false;
    // @ts-ignore
    return Math.floor((Date.now() - new Date(dateStr)) / 1000) < 3600;
}

// ⚡ Preload a list of image URLs into browser cache immediately
function preloadImages(urls) {
    urls.forEach((url) => {
        if (!url) return;
        const img = new Image();
        img.fetchPriority = "high";
        img.src = url;
    });
}

// ⚡ Lightweight carousel slide — no React state, no spinner overhead
const CarouselSlide = ({ photo, alt, index, isFirst }) => {
    const imgRef = useRef(null);

    const handleLoad = useCallback(() => {
        if (imgRef.current) imgRef.current.style.opacity = "1";
    }, []);

    return (
        <div className="min-w-full h-full snap-center flex-shrink-0" style={{ userSelect: "none" }}>
            <img
                ref={imgRef}
                src={photo}
                alt={alt}
                // ⚡ First slide loads eagerly + high priority; rest load lazily
                loading={isFirst ? "eager" : "lazy"}
                fetchPriority={isFirst ? "high" : "auto"}
                decoding="async"
                className="w-full h-full object-cover"
                style={{
                    opacity: 0,
                    transition: "opacity 0.15s ease",
                }}
                onLoad={handleLoad}
            />
        </div>
    );
};

export default function ProfileDetailPage({ onLike, onPass }) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const profile = location.state?.profile;
    const carouselRef = useRef(null);
    // ⚡ Flag to suppress scroll events triggered by programmatic scrollTo
    const isProgrammaticScroll = useRef(false);

    if (!profile) {
        return <div className="p-6 text-center text-gray-500">Profile data not available</div>;
    }

    const parseInterests = () => {
        if (Array.isArray(profile.interests)) return profile.interests;
        try { return JSON.parse(profile.interests) || []; } catch { return []; }
    };

    const safeProfile = {
        id: profile.id || 0,
        individual_id: profile.individual_id || null,
        name: profile.name || "Anonymous",
        age: profile.age || null,
        gender: profile.gender || null,
        location: [profile.city, profile.country].filter(Boolean).join(", ") || "",
        occupation: profile.profession || null,
        education: profile.education || null,
        bio: profile.bio || null,
        marital_status: profile.marital_status || null,
        nationality: profile.nationality || null,
        religious_practice_level: profile.religious_practice_level || null,
        family_background: profile.family_background || null,
        last_seen: profile.last_seen || null,
        interests: parseInterests(),
        photos: ProfileService.parseImages(profile),
        status: profile.status || null,
    };

    // ⚡ Preload ALL photos immediately on mount — browser caches them in parallel
    useEffect(() => {
        if (safeProfile.photos.length > 1) {
            preloadImages(safeProfile.photos);
        }
    }, [profile?.id]);

    // Reset on profile change
    useEffect(() => {
        setCurrentPhotoIndex(0);
    }, [profile?.id]);

    // FIX 1: Actually set state from scroll event
    const handleCarouselScroll = useCallback(() => {
        if (isProgrammaticScroll.current) {
            isProgrammaticScroll.current = false;
            return;
        }
        if (!carouselRef.current) return;
        const { scrollLeft, offsetWidth } = carouselRef.current;
        const index = Math.round(scrollLeft / offsetWidth);
        setCurrentPhotoIndex(index);
    }, []);

    // FIX 2: Single source of truth for scrolling — no duplicate useEffect
    const scrollToPhoto = useCallback((index) => {
        if (!carouselRef.current) return;
        isProgrammaticScroll.current = true;
        carouselRef.current.scrollTo({
            left: carouselRef.current.offsetWidth * index,
            behavior: "smooth",
        });
        setCurrentPhotoIndex(index);
    }, []);

    const prevPhoto = useCallback(() => {
        if (safeProfile.photos.length < 2) return;
        scrollToPhoto((currentPhotoIndex - 1 + safeProfile.photos.length) % safeProfile.photos.length);
    }, [currentPhotoIndex, safeProfile.photos.length, scrollToPhoto]);

    const nextPhoto = useCallback(() => {
        if (safeProfile.photos.length < 2) return;
        scrollToPhoto((currentPhotoIndex + 1) % safeProfile.photos.length);
    }, [currentPhotoIndex, safeProfile.photos.length, scrollToPhoto]);

    const handleStartChat = () => {
        if (!safeProfile.individual_id) return;
        navigate(`/chats?receiver_id=${safeProfile.individual_id}`, {
            state: {
                receiver: {
                    id: safeProfile.individual_id,
                    name: safeProfile.name,
                    avatar: safeProfile.photos[0],
                },
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="flex items-center justify-between px-4 py-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </motion.button>
                    <span className="font-medium text-gray-900">
                        {safeProfile.name}{safeProfile.age ? `, ${safeProfile.age}` : ""}
                    </span>
                    <div className="w-10" />
                </div>
            </div>

            <div className="pb-36">
                {safeProfile.photos.length > 0 && (
                    <div className="relative">
                        {/* Dot indicators */}
                        {safeProfile.photos.length > 1 && (
                            <div className="absolute top-5 left-0 right-0 z-10 flex justify-center gap-1.5 pointer-events-none">
                                {safeProfile.photos.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 rounded-full transition-all duration-300 ${i === currentPhotoIndex ? "bg-white w-6" : "bg-white/50 w-2"}`}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="relative aspect-square mx-4 mt-4 rounded-3xl overflow-hidden bg-gray-200 shadow-xl">
                            {/* ⚡ Carousel uses CarouselSlide instead of ImageAvatar */}
                            <div
                                className="w-full h-full flex overflow-x-auto scroll-smooth snap-x snap-mandatory"
                                style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
                                ref={carouselRef}
                                onScroll={handleCarouselScroll}
                            >
                                {safeProfile.photos.map((photo, i) => (
                                    <CarouselSlide
                                        key={i}
                                        photo={photo}
                                        alt={safeProfile.name}
                                        index={i}
                                        isFirst={i === 0}
                                    />
                                ))}
                            </div>

                            {/* Prev/Next tap zones */}
                            {safeProfile.photos.length > 1 && (
                                <>
                                    <button aria-label="Previous" onClick={prevPhoto}
                                        className="absolute left-0 top-0 w-1/2 h-full z-10"
                                        style={{ cursor: "pointer", background: "none", border: "none" }}
                                    />
                                    <button aria-label="Next" onClick={nextPhoto}
                                        className="absolute right-0 top-0 w-1/2 h-full z-10"
                                        style={{ cursor: "pointer", background: "none", border: "none" }}
                                    />
                                </>
                            )}

                            {/* Online status */}
                            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full z-20">
                                <span className={`w-2 h-2 rounded-full inline-block flex-shrink-0 ${isOnline(safeProfile.last_seen) ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
                                <span className="text-white text-xs">
                                    {isOnline(safeProfile.last_seen) ? `Active ${formatLastSeen(safeProfile.last_seen)}` : "Offline"}
                                </span>
                            </div>

                            {/* Photo count */}
                            {safeProfile.photos.length > 1 && (
                                <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs z-20">
                                    {currentPhotoIndex + 1} / {safeProfile.photos.length}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail strip */}
                        {safeProfile.photos.length > 1 && (
                            <div className="flex gap-2 px-4 mt-3 overflow-x-auto pb-1">
                                {safeProfile.photos.map((photo, i) => (
                                    <motion.button
                                        key={i}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => scrollToPhoto(i)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === currentPhotoIndex ? "border-pink-500 opacity-100" : "border-transparent opacity-50"}`}
                                    >
                                        <img src={photo} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Profile Info Card */}
                <div className="mx-4 mt-4 bg-white rounded-3xl shadow-sm p-5 space-y-5">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                            {safeProfile.name}{safeProfile.age ? `, ${safeProfile.age}` : ""}
                        </h1>
                        {safeProfile.location && (
                            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{safeProfile.location}</span>
                            </div>
                        )}
                    </div>

                    {(safeProfile.marital_status || safeProfile.nationality || safeProfile.religious_practice_level || safeProfile.family_background) && (
                        <div className="flex flex-wrap gap-2">
                            {safeProfile.marital_status && <span className="px-3 py-1.5 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">💍 {safeProfile.marital_status}</span>}
                            {safeProfile.nationality && <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">🌍 {safeProfile.nationality}</span>}
                            {safeProfile.religious_practice_level && <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">🕌 {safeProfile.religious_practice_level}</span>}
                            {safeProfile.family_background && <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">👨‍👩‍👧 {safeProfile.family_background}</span>}
                        </div>
                    )}

                    {safeProfile.occupation && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                                <Briefcase className="w-5 h-5 text-pink-600" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-400">Occupation</div>
                                <div className="text-sm text-gray-800">{safeProfile.occupation}</div>
                            </div>
                        </div>
                    )}

                    {safeProfile.education && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <GraduationCap className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-400">Education</div>
                                <div className="text-sm text-gray-800">{safeProfile.education}</div>
                            </div>
                        </div>
                    )}
                </div>

                {safeProfile.bio && (
                    <div className="mx-4 mt-3 bg-white rounded-3xl shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Info className="w-4 h-4 text-gray-400" />
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">About</h3>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{safeProfile.bio}</p>
                    </div>
                )}

                {safeProfile.interests.length > 0 && (
                    <div className="mx-4 mt-3 bg-white rounded-3xl shadow-sm p-5">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                            {safeProfile.interests.map((interest, i) => (
                                <
                                    // @ts-ignore
                                    Badge key={i} variant="accent" >{interest}</Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-center gap-4">
                    {onPass && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => { onPass?.(); navigate(-1); }}
                            className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg">
                            <X className="w-6 h-6 text-red-500" />
                        </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={handleStartChat}
                        className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg">
                        <MessageCircle className="w-6 h-6 text-blue-500" />
                    </motion.button>
                    {onLike && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => { onLike?.(); navigate(-1); }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg">
                            <Heart className="w-9 h-9 text-white fill-white" />
                        </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                        <Star className="w-6 h-6 text-white fill-white" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
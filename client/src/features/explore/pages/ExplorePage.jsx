import { useState, useEffect } from "react";
import { Heart, Minus, X, MapPin, Briefcase, GraduationCap, Info, Sliders, Search, Sparkles, Loader2, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import ExploreService from "../../explore/api/ExploreService";
import InterestService from "../../interest/services/InterestService";
import { useNavigate } from "react-router-dom";
import ImageAvatar from "../../../components/ImageAvatar";
import { Badge } from "../../../components/ui/badge";
import FilterRow from "../components/filter";
import ProfileService from "../../profile/services/ProfileService";
import AuthApi from "../../auth/services/AuthService";
import AuthService from "../../auth/services/AuthService";




// ─── Helpers ──────────────────────────────────────────────────────────────────
// ✅ Fixed — guard against undefined profile
const parseImages = (profile) => {
    if (!profile) return ["https://cdn-icons-png.flaticon.com/512/1077/1077114.png"];
    // @ts-ignore
    const base = import.meta.env.VITE_BASE_URL || "";
    let imgs = [];
    if (profile.images) {
        try { imgs = typeof profile.images === "string" ? JSON.parse(profile.images) : profile.images; }
        catch { imgs = []; }
    }
    imgs = (imgs || []).filter(Boolean).map(u => u.startsWith("http") ? u : `${base}${u}`);
    if (imgs.length === 0) return [profile.gender === "female"
        ? "https://cdn-icons-png.flaticon.com/512/1077/1077063.png"
        : "https://cdn-icons-png.flaticon.com/512/1077/1077114.png"];
    return imgs;
};

const parseInterests = (profile) => {
    if (!profile?.interests) return [];
    if (Array.isArray(profile.interests)) return profile.interests;
    try { const p = JSON.parse(profile.interests); return Array.isArray(p) ? p : []; }
    catch { return []; }
};

const formatLastSeen = (dateStr) => {
    if (!dateStr) return "Offline";
    // @ts-ignore
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return "Active now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

// @ts-ignore
const isOnline = (dateStr) => dateStr && (Date.now() - new Date(dateStr)) / 1000 < 3600;



// ─── Filter Bar ───────────────────────────────────────────────────────────────
const filterOptions = [
    "All",
    "Dubai",
    "Pakistan",
    "Qatar",
    "Saudi Arabia",
    "Bahrain",
    "Kuwait",
    "Oman",
    "USA",
    "Verified",
    "Premium",
    "Active Now"
];
function FilterBar({ activeFilters, onFilterToggle, onOpenSettings, searchQuery, onSearchChange }) {
    return (
        <div className="     border-border-50 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onOpenSettings}
                    className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center bg-card shadow"
                    type="button"
                >
                    <Sliders className="w-5 h-5 text-primary" />
                </motion.button>

                <div className="flex-1 relative flex items-center">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                        <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    </span>
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="Search name or city"
                        aria-label="Search profiles"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-100 text-sm bg-bg-50 placeholder-gray-400 font-normal outline-none focus:ring-2 focus:ring-primary transition"
                        autoComplete="off"
                        spellCheck={false}
                    />
                </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
                {filterOptions.map((filter) => (
                    <motion.button
                        key={filter}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onFilterToggle(filter)}
                        className="bg-none border-none shadow-none p-0 cursor-pointer"
                        type="button"
                    >
                        <Badge variant="accent"
                            active={activeFilters.includes(filter)} >{filter}</Badge>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────
function ProfileCard({ profile, onLike, onPass, onSuperLike, onCardClick }) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showDetails, setShowDetails] = useState(false);

    const photos = parseImages(profile);
    const interests = parseInterests(profile);
    const online = isOnline(profile.last_seen);
    const navigate = useNavigate();

    const gotoProfile = () => {
        if (!profile) return;
        navigate("/profile", { state: { profile } });
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}

            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full h-full rounded-2xl overflow-hidden bg-background shadow-sm"
        >
            {/* Photo Section */}
            <div className="relative h-[70%] cursor-pointer " onClick={gotoProfile}>
                <ImageAvatar
                    images={[photos[currentPhotoIndex]]}
                    gender={profile.gender}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    interestStatus={profile.status}
                    isShowPending={false}
                />



                {/* Photo indicators */}

                {/*  
                {photos.length > 1 && (
                    <div className="absolute top-3 left-0 right-0 flex gap-1 px-3">
                        {photos.map((_, i) => (
                            <div key={i} className="flex-1 h-1 rounded bg-white/30 overflow-hidden">
                                <div className={`h-full bg-white transition-all duration-300 ${i === currentPhotoIndex ? "w-full" : "w-0"}`} />
                            </div>
                        ))}
                    </div>
                )}
                
                */}

                {/* Online badge */}
                {online && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-green-500/70 shadow-md" />
                        <span className="text-xs text-white">Active now</span>
                    </div>
                )}

                {/* Premium badge */}
                {profile.is_pro && (
                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 shadow-sm">
                        <span className="text-xs text-yellow-400">⭐ Premium</span>
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />

                {/* Name overlay */}
                <div className="absolute bottom-4 left-5 right-5 text-white select-none ">
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{profile.name}{profile.age ? `, ${profile.age}` : ""}</h2>
                            <div className="flex items-center gap-1.5 text-[13px] opacity-90">
                                <MapPin className="w-4 h-4 text-white" />
                                <span>{[profile.city, profile.country].filter(Boolean).join(", ") || "—"}</span>
                                {!online && profile.last_seen && (
                                    <>
                                        <span className="mx-1.5">•</span>
                                        <span>{formatLastSeen(profile.last_seen)}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={e => {
                                e.stopPropagation();
                                setShowDetails(v => !v);
                            }}
                            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-0 cursor-pointer"
                            type="button"
                        >
                            <Info className="w-4 h-4 text-white" />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <motion.div
                animate={{ height: showDetails ? "auto" : "30%" }}
                className="bg-background overflow-y-auto"
            >
                <div className="px-5 pt-4 pb-2 flex flex-col gap-2  ">
                    {profile.profession && (
                        <div className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span>{profile.profession}</span>
                        </div>
                    )}
                    {profile.education && (
                        <div className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                            <GraduationCap className="w-4 h-4 text-accent" />
                            <span>{profile.education}</span>
                        </div>
                    )}

                    <AnimatePresence>
                        {showDetails && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col gap-2.5 pt-2"
                            >
                                {profile.bio && (
                                    <div>
                                        <p className="uppercase text-[10px] font-semibold text-gray-400 mb-1 tracking-wider">About</p>
                                        <p className="text-[13px] leading-relaxed text-neutral-800 mb-0">{profile.bio}</p>
                                    </div>
                                )}
                                {interests.length > 0 && (
                                    <div>
                                        <p className="uppercase text-[10px] font-semibold text-gray-400 mb-1.5 tracking-wider">Interests</p>
                                        <div className="flex flex-wrap gap-1">
                                            {interests.map((item, i) => (
                                                <span key={i} className="px-3 py-1 rounded-full bg-accent-50 text-accent text-xs">{item}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {profile.marital_status && (
                                    <div className="flex gap-2 flex-wrap mt-1">
                                        {[
                                            {
                                                label: profile.marital_status,
                                                extra: "bg-orange-50 text-orange-700"
                                            },
                                            {
                                                label: profile.nationality,
                                                extra: "bg-green-50 text-green-800"
                                            },
                                            {
                                                label: profile.religious_practice_level,
                                                extra: "bg-blue-50 text-blue-700"
                                            }
                                        ].filter(p => p.label).map(({ label, extra }) => (
                                            <span key={label} className={`px-3 py-1 rounded-full text-xs font-medium ${extra}`}>{label}</span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Action Buttons */}
                <div className="px-5 pb-5 flex items-center justify-center gap-4 mt-1">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onPass}
                        type="button"
                        className="w-14 h-14 rounded-full bg-white border-2 border-border-100 flex items-center justify-center cursor-pointer shadow transition"
                    >
                        <X className="w-7 h-7 text-danger-500" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onLike}
                        type="button"
                        className="w-16 h-16 rounded-full bg-primary flex items-center justify-center border-none shadow-lg cursor-pointer"
                    >
                        <Heart className="w-8 h-8 text-white fill-white" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onSuperLike}
                        type="button"
                        className="w-14 h-14 rounded-full bg-accent flex items-center justify-center border-none shadow-md cursor-pointer"
                    >
                        <Star className="w-7 h-7 text-white fill-white" />
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onRefresh }) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
                <Sparkles className="w-9 h-9 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 m-0">No more profiles</h3>
            <p className="text-sm text-gray-400 text-center m-0">You have seen everyone for now. Check back later!</p>
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onRefresh}
                className="mt-2 px-7 py-3 rounded-full bg-primary text-white text-sm font-semibold border-none cursor-pointer shadow transition"
                type="button"
            >
                Refresh
            </motion.button>
        </div>
    );
}

// ─── Main ExplorePage ─────────────────────────────────────────────────────────

export default function ExplorePage({ onProfileClick }) {
    const [profiles, setProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [direction, setDirection] = useState(0);
    const [activeFilters, setActiveFilters] = useState(["All"]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);


    // Filters for modal filter
    const [ageRange, setAgeRange] = useState([18, 50]);
    const [filterCity, setFilterCity] = useState("");
    const [interestedIn, setInterestedIn] = useState("");
    const navigate = useNavigate();
    const qc = useQueryClient();
    useEffect(() => {
        AuthApi.checkProfile(navigate);
    }, []);
    useEffect(() => { fetchProfiles(); }, []);

    useEffect(() => {
        // Guard against undefined InterestService
        if (
            typeof InterestService !== "undefined" &&
            typeof InterestService.getallInterests === "function"
        ) {
            InterestService.getallInterests().then(res => {
                // ⚡ Prefetch all images silently in background
                if (typeof InterestService.prefetchAllImages === "function") {
                    InterestService.prefetchAllImages(res.data?.data, qc);
                }
            });
        }
    }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const res = await ExploreService.getExplore();
            const list = res?.profiles || res?.data?.profiles || [];
            setProfiles(list);
            setCurrentIndex(0);
        } catch (error) {
            console.log("Failed to load profiles error:", error);
        } finally {
            setLoading(false);
        }

    };

    const handleFilterToggle = (filter) => {
        if (filter === "All") { setActiveFilters(["All"]); return; }
        setActiveFilters(prev => {
            const without = prev.filter(f => f !== "All");
            return without.includes(filter) ? (without.filter(f => f !== filter) || ["All"]) : [...without, filter];
        });
    };

    // Show filter overlay from filter.jsx and update state on apply
    const handleShowFilters = () => setShowFilters(true);
    const handleCloseFilters = () => setShowFilters(false);

    const handleApplyFilters = ({ ageRange: ar, city, interestedIn: intIn }) => {
        setAgeRange(ar);
        setFilterCity(city);
        setInterestedIn(intIn);
        setShowFilters(false);
    };

    // Apply filters: search, filter bar, and advanced (age/city/gender)
    const filteredProfiles = profiles.filter(p => {
        // ✅ Guard against undefined/null profiles
        if (!p) return false;

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (!p.name?.toLowerCase().includes(q) && !p.city?.toLowerCase().includes(q)) return false;
        }
        // FilterBar filters
        if (!activeFilters.includes("All")) {
            if (activeFilters.includes("Female") && p.gender !== "female") return false;
            if (activeFilters.includes("Male") && p.gender !== "male") return false;
            if (activeFilters.includes("Verified") && !p.individual?.is_verified) return false;
            if (activeFilters.includes("Premium") && !p.individual?.is_premium) return false;
            if (activeFilters.includes("Active Now") && !isOnline(p.last_seen)) return false;
            // Country filters
            const countryFilters = ["Dubai", "Pakistan", "Qatar", "Saudi Arabia", "Bahrain", "Kuwait", "Oman", "USA"];
            const activeCountry = activeFilters.find(f => countryFilters.includes(f));
            if (activeCountry && p.country !== activeCountry && p.city !== activeCountry) return false;
        }
        // Modal Filters
        if (filterCity && !p.city?.toLowerCase().includes(filterCity.toLowerCase())) return false;
        if (interestedIn) {
            if (interestedIn === "Men" && p.gender !== "male") return false;
            if (interestedIn === "Women" && p.gender !== "female") return false;
        }
        // ✅ Guard ageRange before accessing [0]
        if (p.age && Array.isArray(ageRange) && ageRange.length === 2) {
            const userAge = Number(p.age);
            if (userAge < ageRange[0] || userAge > ageRange[1]) return false;
        }
        return true;
    });

    const currentProfile = filteredProfiles[currentIndex];
    const remaining = filteredProfiles.length - currentIndex;

    const advance = async (dir) => {
        setDirection(dir);
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setDirection(0);
        }, 300);
    };

    const handleLike = async () => {
        if (!currentProfile) return;
        try {
            await ExploreService.sendInterest(currentProfile.individual_id);
            toast.success(`Interest sent to ${currentProfile.name}!`);
        } catch {
            toast.error("Failed to send interest");
        }
        advance(1);
    };

    const handlePass = async () => {
        if (!currentProfile) return;
        try {
            await ExploreService.sendDislike(currentProfile.individual_id);
        } catch { /* silent */ }
        advance(-1);
    };

    const handleSuperLike = async () => {
        if (!currentProfile) return;
        try {
            await ExploreService.sendInterest(currentProfile.individual_id, true);
            toast.success(`Super like sent to ${currentProfile.name}! ⭐`);
        } catch {
            toast.error("Failed to send super like");
        }
        advance(1);
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center h-full bg-bg-50">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="relative flex flex-col h-full min-h-0 bg-background">
            {/* BG Hero image */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-background" />
            </div>
            <div className="relative z-10 flex flex-col h-full min-h-0">
                {/* Optional: old topbar UI */}
                {/* 
                <div className="bg-white border-b border-border-50 px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-primary">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-primary font-display">
                                Discover
                            </span>
                        </div>
                        {remaining > 0 && (
                            <div className="px-4 py-1.5 rounded-full bg-primary text-white text-sm font-medium">
                                {remaining} new
                            </div>
                        )}
                    </div>
                </div>
                */}

                {/* Filter Bar */}
                <FilterBar
                    activeFilters={activeFilters}
                    onFilterToggle={handleFilterToggle}
                    onOpenSettings={handleShowFilters}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Advanced/Modal Filters */}
                <FilterRow
                    isOpen={showFilters}
                    onClose={handleCloseFilters}
                    onApply={handleApplyFilters}
                />

                {/* Cards */}
                <div className="flex-1 overflow-hidden px-4 pb-24 pt-4 min-h-0">
                    <div className="max-w-xl mx-auto h-full">
                        <AnimatePresence mode="wait">
                            {currentProfile ? (
                                <motion.div
                                    key={currentProfile.id}
                                    initial={{ x: direction === 1 ? 300 : direction === -1 ? -300 : 0, opacity: 0, rotate: direction === 1 ? 10 : direction === -1 ? -10 : 0 }}
                                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                                    exit={{ x: direction === 1 ? -300 : 300, opacity: 0, rotate: direction === 1 ? -10 : 10 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full"
                                >
                                    <ProfileCard
                                        profile={currentProfile}
                                        onLike={handleLike}
                                        onPass={handlePass}
                                        onSuperLike={handleSuperLike}
                                        onCardClick={() => onProfileClick?.(currentProfile)}
                                    />
                                </motion.div>
                            ) : (
                                <EmptyState onRefresh={fetchProfiles} />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
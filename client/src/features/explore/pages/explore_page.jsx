// @ts-nocheck
import { useState, useEffect } from "react";
import { SlidersHorizontal, Search, Sparkles, Loader2, LogIn } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import ExploreService from "../services/ExploreService";
import InterestService from "../../interest/services/InterestService";
import { useNavigate } from "react-router-dom";
import FilterRow from "../components/filter_card";
import AuthApi from "../../auth/services/AuthService";
import ProfileCard from "../components/match_card";
import AuthService from "../../auth/services/AuthService";

const isOnline = (d) => d && (Date.now() - new Date(d)) / 1000 < 3600;

const FILTER_CHIPS = ["All", "Online", "Premium", "Verified", "UAE", "UK", "USA", "Saudi Arabia", "Qatar", "Pakistan",];

// ── Filter bar ────────────────────────────────────────────────────────────────
function FilterBar({ active, onToggle, onSettings, search, onSearch }) {
    return (
        <div style={{
            padding: "16px 16px 12px",

            borderBottom: "0.5px solid rgba(27,77,62,0.08)"
        }}>
            {/* Search + settings */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                <div style={{ flex: 1, position: "relative" }}>
                    <Search
                        style={{
                            position: "absolute",
                            left: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "16px",
                            height: "16px",
                            color: "#9ca3af",
                            pointerEvents: "none"
                        }}
                    />
                    <input
                        type="search"
                        value={search}
                        onChange={e => onSearch(e.target.value)}
                        placeholder="Search by name or city…"
                        style={{
                            width: "100%",
                            height: "40px",
                            paddingLeft: "40px",
                            paddingRight: "14px",
                            fontSize: "14px",
                            fontWeight: "400",
                            border: "0.5px solid rgba(27,77,62,0.12)",
                            borderRadius: "10px",
                            background: "#fafaf9",
                            color: "#1B4D3E",
                            outline: "none",
                            transition: "all 0.15s ease"
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = "rgba(27,77,62,0.24)";
                            e.target.style.background = "#ffffff";
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = "rgba(27,77,62,0.12)";
                            e.target.style.background = "#fafaf9";
                        }}
                    />
                </div>
                <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={onSettings}
                    style={{
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "10px",
                        background: "#fafaf9",
                        border: "0.5px solid rgba(27,77,62,0.12)",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f0f5f3";
                        e.currentTarget.style.borderColor = "rgba(27,77,62,0.24)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fafaf9";
                        e.currentTarget.style.borderColor = "rgba(27,77,62,0.12)";
                    }}
                >
                    <SlidersHorizontal style={{ width: "18px", height: "18px", color: "#1B4D3E" }} />
                </motion.button>
            </div>

            {/* Filter chips */}
            <div style={{
                display: "flex",
                gap: "6px",
                overflowX: "auto",
                scrollbarWidth: "none",
                paddingBottom: "2px"
            }}>
                {FILTER_CHIPS.map(f => {
                    const isActive = active.includes(f);
                    return (
                        <motion.button
                            key={f}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => onToggle(f)}
                            style={{
                                flexShrink: 0,
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "500",
                                border: isActive ? "" : "0.5px solid rgba(27,77,62,0.14)",
                                background: isActive ? "linear-gradient(135deg, #1B4D3E, #2d7a5f)" : "#ffffff",
                                color: isActive ? "#ffffff" : "#1B4D3E",
                                cursor: "pointer",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                whiteSpace: "nowrap"
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.borderColor = "rgba(27,77,62,0.24)";
                                    e.currentTarget.style.background = "#fafaf9";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.borderColor = "rgba(27,77,62,0.14)";
                                    e.currentTarget.style.background = "#ffffff";
                                }
                            }}
                        >
                            {f}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

// ── Counter pill ──────────────────────────────────────────────────────────────
function CounterPill({ remaining }) {
    if (!remaining) return null;
    return (
        <div style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            zIndex: 10,
            padding: "5px 12px",
            borderRadius: "16px",
            fontSize: "11px",
            fontWeight: "600",
            background: "rgba(27,77,62,0.92)",
            color: "#ffffff",
            backdropFilter: "blur(8px)",
            pointerEvents: "none",
            letterSpacing: "0.01em"
        }}>
            {remaining} left
        </div>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onRefresh }) {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "32px 24px",
            textAlign: "center"
        }}>
            <div style={{
                width: "88px",
                height: "88px",
                borderRadius: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--background)",
                marginBottom: "24px"
            }}>
                <Sparkles style={{ width: "40px", height: "40px", color: "#1B4D3E", opacity: 0.6 }} />
            </div>
            <h3 style={{
                margin: "0 0 8px",
                fontSize: "20px",
                fontWeight: "500",
                color: "#1B4D3E",
                letterSpacing: "-0.01em"
            }}>
                You're all caught up
            </h3>
            <p style={{
                margin: "0 0 32px",
                fontSize: "14px",
                fontWeight: "400",
                color: "#6b7280",
                lineHeight: "1.5",
                maxWidth: "280px"
            }}>
                No more profiles for now. Check back later or adjust your filters.
            </p>
            <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onRefresh}
                style={{
                    padding: "11px 28px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                    background: "#1B4D3E",
                    color: "#ffffff",
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "0.01em"
                }}
            >
                Refresh
            </motion.button>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
// ── Main ──────────────────────────────────────────────────────────────────────
export default function ExplorePage() {
    const [profiles, setProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [direction, setDirection] = useState(0);
    const [activeFilters, setActiveFilters] = useState(["All"]);
    const [search, setSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [ageRange, setAgeRange] = useState([18, 55]);
    const [filterCity, setFilterCity] = useState("");
    const [interestedIn, setInterestedIn] = useState("");
    // Holds whether the current user is a Pro subscriber

    const [isOtherUserPro, setisOtherUserPro] = useState(false);


    const navigate = useNavigate();
    const qc = useQueryClient();

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const res = await ExploreService.getExplore();
            console.log("explore::::", res);

            // Adapted to handle different possible server result shapes, and individual_id fallback to individual if needed
            let users = res?.profiles || res?.data?.profiles || [];
            // For compatibility with older/newer API results, normalize structure if needed
            users = users.map(user => {
                // If 'individual' key is missing but structure matches @file_context_0, fill it from 'user'
                if (!user.individual && user.user) {
                    return {
                        ...user,
                        individual: user.user
                    };
                }
                return user;
            });
            setProfiles(users);
            setCurrentIndex(0);
        } catch (err) {
            console.error("Failed to fetch profiles:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFilter = (f) => {
        if (f === "All") {
            setActiveFilters(["All"]);
            return;
        }
        setActiveFilters(prev => {
            const w = prev.filter(x => x !== "All");
            const next = w.includes(f) ? w.filter(x => x !== f) : [...w, f];
            return next.length ? next : ["All"];
        });
    };

    const filtered = profiles.filter(p => {
        if (!p) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!p.name?.toLowerCase().includes(q) && !p.city?.toLowerCase().includes(q)) return false;
        }
        if (!activeFilters.includes("All")) {
            if (activeFilters.includes("Verified") && !p.individual?.is_verified) return false;
            if (activeFilters.includes("Premium") && !p.individual?.is_pro) return false;
            if (activeFilters.includes("Online") && !isOnline(p.last_seen)) return false;
            const COUNTRIES = ["Pakistan", "UAE", "UK", "USA", "Saudi Arabia", "Qatar"];
            const ac = activeFilters.find(f => COUNTRIES.includes(f));
            if (ac && p.country !== ac && p.city !== ac) return false;
        }
        if (filterCity && !p.city?.toLowerCase().includes(filterCity.toLowerCase())) return false;
        if (interestedIn === "Men" && p.gender !== "male") return false;
        if (interestedIn === "Women" && p.gender !== "female") return false;
        if (p.age && ageRange.length === 2) {
            const a = Number(p.age);
            if (a < ageRange[0] || a > ageRange[1]) return false;
        }
        return true;
    });

    const current = filtered[currentIndex];
    const remaining = filtered.length - currentIndex - 1;

    const advance = (dir) => {
        setDirection(dir);
        setTimeout(() => {
            setCurrentIndex(i => i + 1);
            setDirection(0);
        }, 280);
    };

    const handleLike = async () => {
        if (!current) return;

        const result = await ExploreService.sendInterest(current.individual_id);

        // ✅ Check if result is successful (Api.js returns null on error)
        if (result && result.success) {
            toast.success(`Interest sent to ${current.name}!`);
            advance(1); // ✅ Right swipe animation
        } else {
            console.error('Send interest failed:', result);
            // toast.error("Failed to send interest. Please try again.");
            // ❌ Card stays - user can retry
        }
    };

    const handlePass = async () => {
        if (!current) return;

        const result = await ExploreService.sendDislike(current.individual_id);

        // ✅ Check if result is successful
        if (result && result.success) {
            advance(-1); // ✅ Left swipe animation
        } else {
            console.error('Send dislike failed:', result);
            toast.error("Failed to pass. Please try again.");
            // ❌ Card stays - user can retry
        }
    };

    const handleSuperLike = async () => {
        if (!current) return;

        const result = await ExploreService.sendInterest(current.individual_id, true);

        // ✅ Check if result is successful
        if (result && result.success) {
            toast.success(`Super like sent! ⭐`);
            advance(1); // ✅ Right swipe animation (same as like)
        } else {
            console.error('Send super like failed:', result);
            toast.error("Failed to send super like. Please try again.");
            // ❌ Card stays - user can retry
        }
    };

    if (loading) return (
        <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",

        }}>
            <Loader2 style={{ width: "32px", height: "32px", color: "#1B4D3E" }} className="animate-spin" />
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>


            {/* Filter bar */}
            <FilterBar
                active={activeFilters}
                onToggle={toggleFilter}
                onSettings={() => setShowFilters(true)}
                search={search}
                onSearch={setSearch}
            />

            {/* Advanced filters */}
            <FilterRow
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                onApply={({ ageRange: ar, city, interestedIn: intIn }) => {
                    setAgeRange(ar);
                    setFilterCity(city);
                    setInterestedIn(intIn);
                    setShowFilters(false);
                }}
            />

            {/* Card area */}
            <div style={{ flex: 1, minHeight: 0, padding: "16px 16px 20px" }}>
                <div style={{ maxWidth: "440px", margin: "0 auto", height: "100%", position: "relative" }}>
                    {/*   {typeof remaining === "number" && remaining > 0 && <CounterPill remaining={remaining} />}*/}


                    <AnimatePresence mode="wait" initial={false}>
                        {current ? (
                            <motion.div
                                key={`card-${currentIndex}`}
                                initial={{
                                    x: direction === 1 ? 300 : direction === -1 ? -300 : 0,
                                    opacity: 0,
                                    rotate: direction === 1 ? 4 : direction === -1 ? -4 : 0
                                }}
                                animate={{ x: 0, opacity: 1, rotate: 0 }}
                                exit={{
                                    x: direction === 1 ? -300 : 300,
                                    opacity: 0,
                                    rotate: direction === 1 ? -4 : 4
                                }}
                                transition={{ duration: 0.28, ease: [0.34, 0.7, 0.18, 1] }}
                                style={{ position: "absolute", inset: 0 }}
                            >
                                <ProfileCard
                                    profile={current}

                                    onLike={handleLike}
                                    onPass={handlePass}
                                    onSuperLike={handleSuperLike}

                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ position: "absolute", inset: 0 }}
                            >
                                <EmptyState onRefresh={fetchProfiles} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
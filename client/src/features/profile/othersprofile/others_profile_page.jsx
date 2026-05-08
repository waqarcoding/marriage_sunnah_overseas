// @ts-nocheck
import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileService from "../services/ProfileService";
import MediaViewer from "../myprofile/components/media_viewer";
import ProfileMediaSection from "./components/profile_media";
import ProfileInfoSection from "./components/profile_info";
import ProfileMatchSection from "./components/profile_match";
import AuthService from "../../auth/services/AuthService";
import ExploreService from "../../explore/services/ExploreService";

function parseArr(v) {
    if (Array.isArray(v)) return v;
    try { return JSON.parse(v || "[]"); } catch { return []; }
}
function inchesToFt(n) { return n ? `${Math.floor(n / 12)}'${n % 12}"` : null; }
function calcMatch(a, b) {
    if (!a || !b) return null;
    const fields = ["religion", "sect", "country", "marital_status", "religious_practice_level"];
    let score = 0, total = fields.length;
    fields.forEach(k => {
        if (a[k] == null || b[k] == null) { total--; return; }
        if (String(a[k]).toLowerCase() === String(b[k]).toLowerCase()) score++;
    });
    [["has_children"], ["willing_to_relocate"]].forEach(([k]) => {
        if (a[k] != null && b[k] != null) { total++; if (a[k] == b[k]) score++; }
    });
    const ai = parseArr(a.interests), bi = parseArr(b.interests);
    if (ai.length && bi.length) {
        total++;
        score += Math.min(ai.filter(i => bi.includes(i)).length / ai.length, 1);
    }
    return total > 0 ? Math.round((score / total) * 100) : null;
}

export default function ProfileDetailPage({ onLike }) {
    const location = useLocation();
    const navigate = useNavigate();

    // ── Route state ───────────────────────────────────────────────────────────
    const profile = location.state?.profile;         // the profile being viewed
    const receiver = location.state?.profileReceiver; // interest receiver
    const sender = location.state?.profileSender;   // interest sender

    // ── Component state ───────────────────────────────────────────────────────
    const [myProfile, setMyProfile] = useState(undefined);
    const [currentUserRole, setCurrentUserRole] = useState(undefined);
    const [isPro, setIsPro] = useState(undefined);
    const [viewer, setViewer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [compatibilityPair, setCompatibilityPair] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                // Fetch current user + role + pro status in parallel
                const [profileRes, proRes,] = await Promise.all([
                    ProfileService.getCurrentUser().catch(() => null),
                    AuthService.isPro().catch(() => false),
                ]);

                const p = profileRes?.profile || profileRes?.data?.profile || profileRes?.data || profileRes;
                const userRole = p?.role || null;
                setCurrentUserRole(userRole);
                setIsPro(proRes || false);

                // ── GUARDIAN MODE ─────────────────────────────────────────────
                if (userRole === "guardian" && Array.isArray(p?.individuals) && p.individuals.length > 0) {
                    console.log("👨‍👧 Guardian mode");

                    // Normalize IDs
                    const receiverId = receiver?.individual_id || receiver?.id;
                    const senderId = sender?.individual_id || sender?.id;
                    const profileId = profile?.individual_id || profile?.id;

                    // Which parties are my wards?
                    const myWardIds = p.individuals.map(ind => String(ind.individual_id));

                    const isSenderMyWard = !!(senderId && myWardIds.includes(String(senderId)));
                    const isReceiverMyWard = !!(receiverId && myWardIds.includes(String(receiverId)));
                    const isProfileMyWard = !!(profileId && myWardIds.includes(String(profileId)));

                    console.log("🔍 Ward check:", { isSenderMyWard, isReceiverMyWard, isProfileMyWard });
                    console.log("🔍 IDs:", { senderId, receiverId, profileId });
                    console.log("🔍 My ward IDs:", myWardIds);

                    let myWardProfile = null;
                    let otherPersonProfile = null;

                    if (isSenderMyWard && isReceiverMyWard) {
                        // Both are my wards — the viewed profile is "my ward", the other is opponent
                        if (String(profileId) === String(senderId)) {
                            myWardProfile = sender;
                            otherPersonProfile = receiver;
                        } else {
                            myWardProfile = receiver;
                            otherPersonProfile = sender;
                        }
                        console.log("⚠️ Both wards:", myWardProfile?.name, "vs", otherPersonProfile?.name);

                    } else if (isSenderMyWard) {
                        myWardProfile = sender;
                        otherPersonProfile = receiver || profile;
                        console.log("✅ Sender is ward:", sender?.name, "vs", otherPersonProfile?.name);

                    } else if (isReceiverMyWard) {
                        myWardProfile = receiver;
                        otherPersonProfile = sender || profile;
                        console.log("✅ Receiver is ward:", receiver?.name, "vs", otherPersonProfile?.name);

                    } else if (isProfileMyWard) {
                        // The viewed profile itself is my ward
                        myWardProfile = profile;
                        if (senderId && String(senderId) !== String(profileId)) {
                            otherPersonProfile = sender;
                        } else if (receiverId && String(receiverId) !== String(profileId)) {
                            otherPersonProfile = receiver;
                        }
                        console.log("✅ Viewed profile is ward:", profile?.name, "vs", otherPersonProfile?.name);

                    } else {
                        // None matched — fetch first ward from API
                        console.log("⚠️ No ward matched, fetching first ward");
                        const firstWard = p.individuals[0];
                        try {
                            const wardRes = await AuthService.getUserById(firstWard.individual_id);
                            myWardProfile = wardRes?.profile || wardRes?.data?.profile || wardRes;
                        } catch {
                            myWardProfile = null;
                        }
                        // Other = viewed profile (if different from ward)
                        otherPersonProfile =
                            String(profile?.individual_id) !== String(myWardProfile?.individual_id)
                                ? profile
                                : (sender || receiver || null);
                        console.log("⚠️ Fallback ward:", myWardProfile?.name, "vs", otherPersonProfile?.name);
                    }

                    // ✅ Safety: ensure they are not the same person
                    if (
                        myWardProfile && otherPersonProfile &&
                        String(myWardProfile.individual_id) === String(otherPersonProfile.individual_id)
                    ) {
                        console.log("❌ Same person — finding correct opponent");
                        const candidates = [sender, receiver, profile].filter(Boolean);
                        otherPersonProfile = candidates.find(
                            c => String(c.individual_id) !== String(myWardProfile.individual_id)
                        ) || null;
                    }

                    console.log("✅ Final pairing:");
                    console.log("   My ward:     ", myWardProfile?.name, myWardProfile?.individual_id);
                    console.log("   Other person:", otherPersonProfile?.name, otherPersonProfile?.individual_id);

                    setMyProfile(myWardProfile);
                    setCompatibilityPair({ myWard: myWardProfile, otherPerson: otherPersonProfile });

                } else {
                    // ── INDIVIDUAL MODE ───────────────────────────────────────
                    console.log("👤 Individual mode");
                    setMyProfile(p || null);
                    setCompatibilityPair({ myWard: p, otherPerson: profile });
                }

            } catch (err) {
                console.error("fetchAllData error:", err);
                setMyProfile(null);
                setCurrentUserRole(null);
                setIsPro(false);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [
        profile?.individual_id,
        receiver?.individual_id,
        sender?.individual_id,
    ]);

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading || myProfile === undefined || currentUserRole === undefined || isPro === undefined) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#f5f5f3" }}>
                <div style={{ position: "relative", width: 64, height: 64, marginBottom: 24 }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid rgba(27,77,62,0.1)" }} />
                    <div style={{
                        position: "absolute", inset: 0, borderRadius: "50%",
                        border: "4px solid transparent",
                        borderTopColor: "var(--primary,#1B4D3E)",
                        borderRightColor: "var(--primary,#1B4D3E)",
                        animation: "spin 0.8s linear infinite",
                    }} />
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#9ca3af" }}>Loading profile...</p>
                <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            </div>
        );
    }


    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                Profile data not available
            </div>
        );
    }

    // ── Parse profile data ────────────────────────────────────────────────────
    const photos = parseArr(profile.images).filter(Boolean);
    const videos = parseArr(profile.videos).filter(Boolean);
    const media = [
        ...photos.map(url => ({ type: "image", url })),
        ...videos.map(url => ({ type: "video", url })),
    ];
    const interests = parseArr(profile.interests);

    // ✅ Match % uses the resolved pair
    const matchPct = compatibilityPair
        ? calcMatch(compatibilityPair.myWard, compatibilityPair.otherPerson)
        : null;

    console.log("🎯 Match %:", matchPct, {
        ward: compatibilityPair?.myWard?.name,
        other: compatibilityPair?.otherPerson?.name,
    });

    const p = {
        name: profile.name || "Anonymous",
        age: profile.age || null,
        location: [profile.city, profile.country].filter(Boolean).join(", "),
        religion: profile.religion || null,
        sect: profile.sect || null,
        nationality: profile.nationality || null,
        marital_status: profile.marital_status || null,
        religious_practice_level: profile.religious_practice_level || null,
        education: profile.education || null,
        profession: profile.profession || null,
        employment_type: profile.employment_type || null,
        monthly_salary: profile.monthly_salary || null,
        height: inchesToFt(profile.height_inches),
        body_type: profile.body_type || null,
        caste: profile.caste || null,
        mother_tongue: profile.mother_tongue || null,
        has_children: profile.has_children != null ? (profile.has_children ? "Yes" : "No") : null,
        willing_to_relocate: profile.willing_to_relocate != null ? (profile.willing_to_relocate ? "Yes" : "No") : null,
        is_guardian_required: profile.is_guardian_required ? "Yes" : null,
        father_occupation: profile.father_occupation || null,
        mother_occupation: profile.mother_occupation || null,
        brothers: profile.brothers != null ? String(profile.brothers) : null,
        sisters: profile.sisters != null ? String(profile.sisters) : null,
        family_background: profile.family_background || null,
        bio: profile.bio || null,
        last_seen: profile.last_seen || null,
        individual_id: profile.individual_id || null,
        user: profile.user || null,
    };

    const handleStartChat = () => {
        if (!p.individual_id) return;
        navigate(`/individual/chats?receiver_id=${p.individual_id}`, {
            state: { receiver: { id: p.individual_id, name: p.name, avatar: photos[0] } },
        });
    };



    const handleLike = () => {

        if (p.individual_id) {
            ExploreService.sendInterest(p.individual_id, true);
        }
    }
        ;

    return (
        <>
            <AnimatePresence>
                {viewer?.open && (
                    <MediaViewer
                        media={media}
                        initialIdx={viewer.idx}
                        onClose={() => setViewer(null)}
                    />
                )}
            </AnimatePresence>

            <div className="min-h-screen" style={{ background: "#f5f5f3", marginBottom: "32px" }}>


                {/* Header */}
                <div className="sticky top-0 z-20 border-b"
                    style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(12px)", borderColor: "#f0f0ed" }}>
                    <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </motion.button>
                        <span className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">
                            {p.name}{p.age ? `, ${p.age}` : ""}
                        </span>
                        <div className="w-10" />
                    </div>
                </div>

                <div className="max-w-2xl mx-auto">
                    {/* 1 — Media carousel */}
                    <ProfileMediaSection
                        media={media}
                        profile={profile}
                        matchPct={matchPct}
                        isPro={isPro}
                        onExpand={(i) => setViewer({ open: true, idx: i })}
                    />

                    {/* 2 — Profile info + action buttons */}
                    <ProfileInfoSection
                        p={p}
                        interests={interests}
                        onStartChat={handleStartChat}
                        onLike={handleLike}
                        userId={p?.individual_id}

                    />

                    {/* 3 — Compatibility match section */}
                    <ProfileMatchSection
                        profile={compatibilityPair?.otherPerson || profile}
                        myProfile={compatibilityPair?.myWard || myProfile}
                        matchPct={matchPct}
                        photos={photos}
                        role={currentUserRole}
                    />
                </div>
            </div>

            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </>
    );
}
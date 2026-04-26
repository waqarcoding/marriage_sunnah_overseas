// @ts-nocheck
// features/guardian/pages/guardian_profile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Shield, Users, Clock, CheckCircle, LogOut, ChevronRight } from "lucide-react";
import ProfileService from "../../profile/services/ProfileService";
import GuardianService from "../services/GuardianService";

function getTokenData() {
    try {
        const token = localStorage.getItem("jwtToken");
        if (!token) return null;
        return JSON.parse(atob(token.split(".")[1]));
    } catch { return null; }
}

export default function GuardianProfilePage({ onLogout }) {
    const navigate = useNavigate();
    const user = getTokenData();
    const [profile, setProfile] = useState(null);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [profileRes, wardsRes] = await Promise.all([
                    ProfileService.getMyProfile(),
                    GuardianService.getMyGuardian({ onSuccess: r => r, onFailed: () => { } }),
                ]);
                setProfile(profileRes);
                const data = wardsRes?.data;
                setWards(Array.isArray(data) ? data : data ? [data] : []);
            } catch { /* ignore */ }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const handleLogout = () => {
        ['isLoggedIn', 'isOtpVerified', 'jwtToken', 'userId'].forEach(k => localStorage.removeItem(k));
        onLogout?.();
        navigate('/');
    };

    const name = profile?.profile?.name || user?.name || "Guardian";
    const avatar = profile?.avatar_url || profile?.profile?.images?.[0] || null;
    const city = profile?.profile?.city;
    const country = profile?.profile?.country;

    const menuItems = [
        { icon: Users, label: "My Wards", desc: "Manage wards you oversee", to: "/guardian/add-ward" },
        { icon: CheckCircle, label: "Pending Approvals", desc: "Review pending interests", to: "/guardian" },
        { icon: Clock, label: "Interest History", desc: "All interests you reviewed", to: "/guardian/interests" },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--primary)" }} />
        </div>
    );

    return (
        <div className="min-h-full pb-24" style={{ background: "var(--secondary)" }}>

            {/* Profile card */}
            <div className="px-4 pt-6 pb-4">
                <div className="rounded-3xl p-6 text-center shadow-sm" style={{ background: "var(--primary-foreground)" }}>
                    {/* Avatar */}
                    <div className="relative inline-block mb-4">
                        {avatar ? (
                            <img src={avatar} alt={name} className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg mx-auto" />
                        ) : (
                            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg mx-auto"
                                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                                {name[0]?.toUpperCase()}
                            </div>
                        )}
                        {/* Guardian badge */}
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow"
                            style={{ background: "var(--primary)" }}>
                            <Shield className="w-4 h-4" style={{ color: "var(--primary-foreground)" }} />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mb-1" style={{ color: "var(--primary)" }}>{name}</h2>
                    {(city || country) && (
                        <p className="text-sm mb-3" style={{ color: "var(--primary)", opacity: 0.55 }}>
                            📍 {[city, country].filter(Boolean).join(", ")}
                        </p>
                    )}

                    {/* Guardian badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                        style={{ background: "var(--secondary)", color: "var(--primary)" }}>
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-semibold">Guardian (Wali)</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-3 mt-5">
                        <div className="flex items-center justify-between p-3 rounded-2xl"
                            style={{ background: "var(--secondary)" }}>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" style={{ color: "var(--primary)" }} />
                                <span className="text-sm font-medium" style={{ color: "var(--primary)" }}>Wards I manage</span>
                            </div>
                            <span className="text-lg font-bold" style={{ color: "var(--primary)" }}>{wards.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Islamic reminder */}
            <div className="mx-4 mb-4 rounded-2xl p-4 border" style={{ background: "var(--accent)", borderColor: "var(--primary)", borderOpacity: 0.2 }}>
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--primary)" }}>🌙 Your Responsibility</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--primary)", opacity: 0.7 }}>
                    As a guardian, you play a vital role in ensuring matrimonial decisions are made with wisdom, care and Islamic principles.
                </p>
            </div>

            {/* Menu */}
            <div className="mx-4 rounded-2xl overflow-hidden shadow-sm" style={{ background: "var(--primary-foreground)" }}>
                {menuItems.map((item, idx) => (
                    <button key={item.label} onClick={() => navigate(item.to)}
                        className="w-full flex items-center gap-4 px-4 py-4 transition-all text-left"
                        style={{ borderBottom: idx < menuItems.length - 1 ? `1px solid var(--secondary)` : "none" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "var(--secondary)" }}>
                            <item.icon className="w-5 h-5" style={{ color: "var(--primary)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>{item.label}</p>
                            <p className="text-xs" style={{ color: "var(--primary)", opacity: 0.5 }}>{item.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--primary)", opacity: 0.4 }} />
                    </button>
                ))}
            </div>

            {/* Logout */}
            <div className="mx-4 mt-4">
                <button onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-all">
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}
// @ts-nocheck
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    ChevronRight, ChevronLeft, Shield, Bell,
    Lock, Trash2, Crown, X, LogOut, Clock,
    User, ImageOff, Phone, Mail, Info, BadgeCheck
} from "lucide-react";
import AuthService from "../../auth/services/AuthService";
import ProfileService from "../../profile/services/ProfileService";
import SettingService from "../services/SettingService"; // ✅ import SettingService
import PageHeader from "../../../ui/page_header";



// ── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({ icon: Icon, iconBg, iconColor, label, sublabel, value, onChange, disabled, disabledLabel }) {
    return (
        <div className="flex items-center justify-between py-3.5 border-b last:border-0"
            style={{ borderColor: "rgba(27,77,62,0.07)" }}>
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: iconBg || "var(--secondary,#f0f5f3)" }}>
                    <Icon className="w-4 h-4" style={{ color: iconColor || "var(--primary,#1B4D3E)" }} />
                </div>
                <div>
                    <p className="text-sm font-medium" style={{ color: "#1a1a1a" }}>{label}</p>
                    {sublabel && <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>{sublabel}</p>}
                </div>
            </div>
            {disabled ? (
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg"
                    style={{ background: "#fef3c7", color: "#92400e" }}>
                    {disabledLabel || "PRO"}
                </span>
            ) : (
                <motion.button
                    onClick={() => onChange(!value)}
                    className="relative flex-shrink-0"
                    style={{ width: 44, height: 24, borderRadius: 12, background: value ? "var(--primary,#1B4D3E)" : "#e5e7eb", border: "none", cursor: "pointer", transition: "background 0.2s" }}>
                    <motion.div
                        animate={{ x: value ? 22 : 2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </motion.button>
            )}
        </div>
    );
}

// ── Nav row ───────────────────────────────────────────────────────────────────
function NavRow({ icon: Icon, iconBg, iconColor, label, sublabel, onClick, danger, badge }) {
    return (
        <motion.button whileTap={{ scale: 0.98 }} onClick={onClick}
            className="flex items-center justify-between w-full py-3.5 border-b last:border-0 text-left"
            style={{ borderColor: "rgba(27,77,62,0.07)", background: "none", border: "none", borderBottom: "0.5px solid rgba(27,77,62,0.07)", cursor: "pointer", padding: "14px 0" }}>
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: iconBg || "var(--secondary,#f0f5f3)" }}>
                    <Icon className="w-4 h-4" style={{ color: iconColor || "var(--primary,#1B4D3E)" }} />
                </div>
                <div>
                    <p className="text-sm font-medium" style={{ color: danger ? "#ef4444" : "#1a1a1a" }}>{label}</p>
                    {sublabel && <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>{sublabel}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--primary,#1B4D3E)", color: "#fff" }}>{badge}</span>}
                <ChevronRight className="w-4 h-4" style={{ color: "#d1d5db" }} />
            </div>
        </motion.button>
    );
}

// ── Section card ──────────────────────────────────────────────────────────────
function SectionCard({ title, children }) {
    return (
        <div className="mx-4 mb-3 bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 8px rgba(27,77,62,0.06)", border: "0.5px solid rgba(27,77,62,0.07)" }}>
            {title && (
                <div className="px-4 pt-3 pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#9ca3af" }}>{title}</span>
                </div>
            )}
            <div className="px-4 pb-1">{children}</div>
        </div>
    );
}

// ── Delete account modal ──────────────────────────────────────────────────────
function DeleteAccountModal({ onClose, onConfirm }) {
    const [confirm, setConfirm] = useState("");
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
            onClick={onClose}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", damping: 24 }}
                className="w-full max-w-sm bg-white rounded-3xl p-6"
                onClick={e => e.stopPropagation()}>
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="font-bold text-lg text-center mb-1" style={{ color: "#1a1a1a" }}>Delete Account</h3>
                <p className="text-sm text-center text-gray-400 mb-5 leading-relaxed">
                    This will permanently delete your profile, photos, matches, and all data. This cannot be undone.
                </p>
                <div className="mb-4">
                    <label className="text-xs font-semibold mb-1 block text-gray-500">Type <b>DELETE</b> to confirm</label>
                    <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="DELETE"
                        style={{ width: "100%", height: 44, padding: "0 12px", borderRadius: 12, fontSize: 14, border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#1a1a1a", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
                        className="flex-1 h-11 rounded-2xl text-sm font-semibold"
                        style={{ background: "var(--secondary,#f0f5f3)", color: "var(--primary,#1B4D3E)", border: "none", cursor: "pointer" }}>
                        Cancel
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.97 }}
                        onClick={() => confirm === "DELETE" && onConfirm()}
                        className="flex-1 h-11 rounded-2xl text-sm font-bold text-white"
                        style={{ background: confirm === "DELETE" ? "#ef4444" : "#fca5a5", border: "none", cursor: confirm === "DELETE" ? "pointer" : "default" }}>
                        Delete Forever
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
    const navigate = useNavigate();

    const tokenData = AuthService.getTokenData();




    // ✅ isPro is now state — not an async function called inline in JSX
    const [isPro, setIsPro] = useState(false);
    const [settings, setSettings] = useState({
        is_show_last_seen: true,
        is_blurred_images: false,
        notifications: true,
        email_updates: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    useEffect(() => {
        // ✅ Resolve isPro once on mount
        Promise.resolve(AuthService.isPro()).then(val => setIsPro(!!val));

        ProfileService.getCurrentUser().then(res => {
            const p = res?.profile || res?.data?.profile || res?.data || res;
            setSettings(s => ({
                ...s,
                is_show_last_seen: p?.is_show_last_seen !== undefined ? !!p.is_show_last_seen : true,
                is_blurred_images: p?.is_blurred_images !== undefined ? !!p.is_blurred_images : false,
                notifications: p?.notifications !== undefined ? !!p.notifications : true,
                email_updates: p?.email_updates !== undefined ? !!p.email_updates : false,
            }));
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    // ✅ Now uses SettingService.updateSettings — no validation errors
    const handleToggle = async (key, val) => {
        setSettings(s => ({ ...s, [key]: val }));
        setSaving(true);
        try {
            await SettingService.updateSettings({ [key]: val ? 1 : 0 });
            toast.success("Saved");
        } catch {
            setSettings(s => ({ ...s, [key]: !val })); // ✅ revert on failure
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        ["isLoggedIn", "isOtpVerified", "jwtToken", "userId"].forEach(k => localStorage.removeItem(k));
        navigate("/");
    };

    const handleDeleteAccount = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/delete-account`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed");
            handleLogout();
        } catch (err) {
            toast.error(err.message || "Failed to delete account");
        }
    };

    if (loading) return (
        <div className="flex-1 h-full flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{ borderColor: "var(--background)", borderTopColor: "var(--primary,#1B4D3E)" }} />
        </div>
    );

    return (
        <>
            <AnimatePresence>
                {showDelete && <DeleteAccountModal onClose={() => setShowDelete(false)} onConfirm={handleDeleteAccount} />}
            </AnimatePresence>

            <div className="min-h-screen pb-28"  >


                {/* ── Page title ── */}
                <PageHeader
                    title="Settings"
                    subtitle="Manage your journey with intention"
                />


                <div className="pt-4">

                    {/* ── Pro banner — non-pro only ── */}
                    {!isPro || tokenData?.role === "guardian" && (
                        <div
                            tabIndex={0}
                            role="button"
                            onClick={() => navigate("/individual/subscription-detail")}
                            onKeyPress={e => {
                                if (e.key === "Enter" || e.key === " ") {
                                    navigate("/individual/subscription-detail");
                                }
                            }}
                            className="mx-4 mb-4 rounded-2xl p-4 flex items-center gap-4 cursor-pointer outline-none"
                            style={{ background: "var(--primary,#1B4D3E)", boxShadow: "0 4px 20px rgba(27,77,62,0.25)" }}
                        >
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(255,255,255,0.15)" }}>
                                <Crown className="w-6 h-6 text-yellow-300" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm text-white">Upgrade to Premium</p>
                                <p className="text-xs text-white/70 mt-0.5">Unlock last seen, priority matching & more</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/60" />
                        </div>
                    )}


                    {/* ── Account info ── */}
                    <SectionCard title="Account">
                        <div
                            className="flex items-center gap-3 py-3.5 border-b cursor-pointer hover:bg-gray-50 transition"
                            style={{ borderColor: "rgba(27,77,62,0.07)" }}
                            onClick={() => {
                                // Role-based access navigation
                                if (tokenData?.role === "guardian") {
                                    navigate("/guardian/myprofile");
                                } else {
                                    navigate("/individual/myprofile");
                                }
                            }}

                            tabIndex={0}
                            role="button"

                        >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "var(--secondary,#f0f5f3)", border: "none" }}>
                                {tokenData?.avatar_url ? (
                                    <img
                                        src={tokenData.avatar_url}
                                        alt={tokenData?.name || "Profile photo"}
                                        className="w-9 h-9 rounded-lg object-cover"
                                        style={{ border: "none" }}
                                    />
                                ) : (
                                    <User className="w-4 h-4" style={{ color: "var(--primary,#1B4D3E)" }} />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: "#1a1a1a" }}>
                                    {tokenData?.name || "Your Profile"}
                                </p>
                                <p className="text-xs mt-0.5 truncate" style={{ color: "#9ca3af" }}>
                                    {tokenData?.email || tokenData?.phone || ""}
                                </p>
                            </div>
                            {isPro && (
                                <span className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
                                    style={{ background: "#fef3c7", color: "#92400e" }}>⭐ PRO</span>
                            )}
                        </div>
                        {/* Guardian settings link — visible to guardians only */}
                        {tokenData?.role === "guardian" && (
                            <NavRow
                                icon={User}
                                label="My Ward"
                                sublabel="Manage your ward's account"
                                onClick={() => navigate("/guardian/add-ward")}
                            />
                        )}

                        {tokenData?.role !== "guardian" && (
                            <NavRow
                                icon={Crown}
                                label="Subscription"
                                sublabel="Manage your subscription details"
                                onClick={() => navigate("/individual/subscription-detail")}
                            />
                        )}
                        {tokenData?.role !== "guardian" && (
                            <NavRow
                                icon={BadgeCheck}

                                label="Get Verified Badge"
                                sublabel="Apply for account verification"
                                onClick={() => navigate("/individual/verification")}
                            />
                        )}

                        {tokenData?.role !== "guardian" && (
                            <NavRow
                                icon={User}
                                label="Referral Program"
                                sublabel="Invite friends & earn rewards"
                                onClick={() => navigate("/individual/referral")}
                            />
                        )}
                        <NavRow icon={Lock} label="Change Password" sublabel="Update your account password"
                            onClick={() => navigate("/change-password")} />



                    </SectionCard>


                    {/* ── Privacy ── */}
                    {/* Hide Privacy section for guardians */}
                    {tokenData?.role !== "guardian" && (
                        <SectionCard title="Privacy">
                            {isPro ? (
                                <ToggleRow
                                    icon={Clock} iconBg="#f0fdf4" iconColor="#16a34a"
                                    label="Show last seen"
                                    sublabel="Let others see when you were last active"
                                    value={settings.is_show_last_seen}
                                    onChange={val => handleToggle("is_show_last_seen", val)}
                                />
                            ) : (
                                <ToggleRow
                                    icon={Clock} iconBg="#f5f5f5" iconColor="#9ca3af"
                                    label="Show last seen"
                                    sublabel="Upgrade to Pro to control your visibility"
                                    value={false}
                                    onChange={() => navigate("/subscription")}
                                    disabled
                                    disabledLabel="PRO"
                                />
                            )}

                            {isPro ? (
                                <ToggleRow
                                    icon={ImageOff} iconBg="#faf5ff" iconColor="#7c3aed"
                                    label="Blur profile photos"
                                    sublabel="Others will see your photos as blurred"


                                    value={settings.is_blurred_images}
                                    onChange={val => handleToggle("is_blurred_images", val)}
                                />
                            ) : (
                                <ToggleRow
                                    icon={ImageOff} iconBg="#f5f5f5" iconColor="#9ca3af"
                                    label="Blur profile photos"
                                    sublabel="Upgrade to Pro to restrict photo access"
                                    value={false}
                                    onChange={() => navigate("/subscription")}
                                    disabled
                                    disabledLabel="PRO"
                                />
                            )}
                        </SectionCard>
                    )}


                    {/* ── Notifications ── */}
                    <SectionCard title="Notifications">
                        <ToggleRow
                            icon={Bell} iconBg="#eff6ff" iconColor="#3b82f6"
                            label="Push notifications"
                            sublabel="Interests, matches and messages"
                            value={settings.notifications}
                            onChange={val => handleToggle("notifications", val)}
                        />
                        <ToggleRow
                            icon={Mail} iconBg="#f0fdf4" iconColor="#16a34a"
                            label="Email updates"
                            sublabel="Weekly digest and platform news"
                            value={settings.email_updates}
                            onChange={val => handleToggle("email_updates", val)}
                        />
                    </SectionCard>

                    {/* ── Support ── */}
                    <SectionCard title="Support">
                        <NavRow icon={Info} label="About Marriage Sunnah"
                            sublabel="Version 1.0.0"
                            onClick={() => { }} />
                        <NavRow icon={Shield} label="Privacy Policy"
                            onClick={() => { }} />
                        <NavRow icon={Phone} label="Contact Support"
                            sublabel="WhatsApp or email"
                            onClick={() => { }} />
                    </SectionCard>

                    {/* ── Danger zone ── */}
                    <SectionCard title="Account Actions">
                        <NavRow icon={LogOut} iconBg="#fff7ed" iconColor="#f97316"
                            label="Log out"
                            onClick={handleLogout}
                        />
                        <NavRow icon={Trash2} iconBg="#fff1f2" iconColor="#ef4444"
                            label="Delete Account"
                            sublabel="Permanently remove all your data"
                            onClick={() => setShowDelete(true)}
                            danger
                        />
                    </SectionCard>

                </div>
            </div>
        </>
    );
}
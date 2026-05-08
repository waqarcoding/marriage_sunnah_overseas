// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronLeft, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SettingService from "../services/SettingService";
export default function ChangePassword() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ current: "", next: "", confirm: "" });
    const [show, setShow] = useState({ current: false, next: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(""); };
    const toggleShow = (k) => setShow(s => ({ ...s, [k]: !s[k] }));

    const strength = (() => {
        const p = form.next;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    })();

    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
    const strengthColor = ["", "#ef4444", "#f59e0b", "#10b981", "#1B4D3E"][strength];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.current) return setError("Enter your current password");
        if (form.next.length < 8) return setError("New password must be at least 8 characters");
        if (form.next !== form.confirm) return setError("Passwords don't match");

        setLoading(true);
        try {

            await new Promise((resolve, reject) => {
                SettingService.passwordChange(
                    {
                        current_password: form.current,
                        new_password: form.next,
                    },
                    {
                        onSuccess: (res) => {
                            setSuccess(true);
                            toast.success("Password updated!");
                            setTimeout(() => navigate(-1), 1800);
                            resolve(res);
                        },
                        onFailed: (err) => {
                            setError(err?.message || "Failed to update password");
                            reject(err);
                        }
                    }
                );
            });

        } catch (err) {
            setError(err.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    const inputWrap = { position: "relative", width: "100%" };
    const inputStyle = (focused) => ({
        width: "100%", height: 48, padding: "0 44px 0 44px",
        borderRadius: 14, fontSize: 14, outline: "none",
        border: `1.5px solid ${focused ? "var(--primary,#1B4D3E)" : "rgba(27,77,62,0.12)"}`,
        background: "var(--secondary,#f0f5f3)",
        color: "#1a1a1a", boxSizing: "border-box",
        transition: "border-color 0.15s",
    });

    return (
        <div className="min-h-screen pb-24 flex flex-col" style={{ background: "var(--secondary,#f0f5f3)" }}>

            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b"
                style={{ background: "#fff", borderColor: "rgba(27,77,62,0.08)" }}>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--secondary,#f0f5f3)", border: "none", cursor: "pointer" }}>
                    <ChevronLeft className="w-5 h-5" style={{ color: "var(--primary,#1B4D3E)" }} />
                </motion.button>
                <h1 className="font-bold text-base" style={{ color: "var(--primary,#1B4D3E)" }}>Change Password</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-sm">

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: "var(--primary,#1B4D3E)", boxShadow: "0 8px 24px rgba(27,77,62,0.25)" }}>
                            <Lock className="w-7 h-7 text-white" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-center mb-1" style={{ color: "var(--primary,#1B4D3E)" }}>
                        Update Password
                    </h2>
                    <p className="text-sm text-center mb-6" style={{ color: "#9ca3af" }}>
                        Choose a strong password to keep your account secure
                    </p>

                    {/* Success state */}
                    <AnimatePresence>
                        {success && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 p-4 rounded-2xl mb-4"
                                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                                <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <p className="text-sm font-medium text-green-700">Password updated successfully!</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="p-3 rounded-xl mb-4 text-sm"
                                style={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c" }}>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Card */}
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white rounded-3xl p-5 flex flex-col gap-4"
                            style={{ boxShadow: "0 2px 16px rgba(27,77,62,0.07)", border: "0.5px solid rgba(27,77,62,0.07)" }}>

                            {/* Current password */}
                            <PasswordField
                                label="Current password"
                                value={form.current}
                                onChange={v => setField("current", v)}
                                show={show.current}
                                onToggle={() => toggleShow("current")}
                                inputStyle={inputStyle}
                                inputWrap={inputWrap}
                            />

                            <div style={{ height: 1, background: "rgba(27,77,62,0.06)" }} />

                            {/* New password */}
                            <PasswordField
                                label="New password"
                                value={form.next}
                                onChange={v => setField("next", v)}
                                show={show.next}
                                onToggle={() => toggleShow("next")}
                                inputStyle={inputStyle}
                                inputWrap={inputWrap}
                            />

                            {/* Strength bar */}
                            {form.next.length > 0 && (
                                <div>
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                                                style={{ background: i <= strength ? strengthColor : "#e5e7eb" }} />
                                        ))}
                                    </div>
                                    <p className="text-xs font-medium" style={{ color: strengthColor }}>
                                        {strengthLabel}
                                    </p>
                                </div>
                            )}

                            {/* Confirm password */}
                            <PasswordField
                                label="Confirm new password"
                                value={form.confirm}
                                onChange={v => setField("confirm", v)}
                                show={show.confirm}
                                onToggle={() => toggleShow("confirm")}
                                inputStyle={inputStyle}
                                inputWrap={inputWrap}
                                error={form.confirm && form.next !== form.confirm}
                            />
                        </div>

                        {/* Tips */}
                        <div className="mt-3 px-1">
                            {[
                                { ok: form.next.length >= 8, text: "At least 8 characters" },
                                { ok: /[A-Z]/.test(form.next), text: "One uppercase letter" },
                                { ok: /[0-9]/.test(form.next), text: "One number" },
                                { ok: /[^A-Za-z0-9]/.test(form.next), text: "One special character" },
                            ].map(({ ok, text }) => (
                                <div key={text} className="flex items-center gap-2 py-0.5">
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                                        style={{ background: ok ? "var(--primary,#1B4D3E)" : "#e5e7eb" }}>
                                        {ok && <span style={{ fontSize: 8, color: "#fff", fontWeight: 700 }}>✓</span>}
                                    </div>
                                    <span className="text-xs" style={{ color: ok ? "var(--primary,#1B4D3E)" : "#9ca3af" }}>{text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Submit */}
                        <motion.button whileTap={{ scale: 0.97 }}
                            type="submit" disabled={loading || success}
                            className="w-full h-12 rounded-2xl font-bold text-sm text-white mt-5 flex items-center justify-center"
                            style={{ background: "var(--primary,#1B4D3E)", border: "none", cursor: loading ? "default" : "pointer", opacity: loading ? 0.8 : 1 }}>
                            {loading
                                ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                : "Update Password"}
                        </motion.button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ── Reusable password field ───────────────────────────────────────────────────
function PasswordField({ label, value, onChange, show, onToggle, inputStyle, inputWrap, error }) {
    const [focused, setFocused] = useState(false);
    return (
        <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "#6b7280" }}>{label}</label>
            <div style={inputWrap}>
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: focused ? "var(--primary,#1B4D3E)" : "#9ca3af" }} />
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="••••••••"
                    style={{
                        ...inputStyle(focused || error),
                        borderColor: error ? "#fca5a5" : focused ? "var(--primary,#1B4D3E)" : "rgba(27,77,62,0.12)",
                        background: error ? "#fff5f5" : "var(--secondary,#f0f5f3)",
                    }}
                />
                <button type="button" onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {show
                        ? <EyeOff className="w-4 h-4" style={{ color: "#9ca3af" }} />
                        : <Eye className="w-4 h-4" style={{ color: "#9ca3af" }} />}
                </button>
            </div>
        </div>
    );
}
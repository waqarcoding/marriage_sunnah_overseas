// @ts-nocheck
import { useState, useRef } from "react";
import {
    UserPlus, Upload, Mail, Lock, User, Shield, Users,
    Sparkles, ArrowLeft, Eye, EyeOff, Check, AlertCircle, Phone,
} from "lucide-react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AuthService from "../../auth/services/AuthService";

/* ─── Field wrapper ─── */
function FieldLabel({ children, required }) {
    return (
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            {children}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );
}

/* ─── Input row ─── */
function InputRow({ icon: Icon, ...props }) {
    return (
        <div className="relative">
            <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
                {...props}
                className="w-full h-11 pl-10 pr-3 text-sm border border-gray-200 rounded-xl focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/10 outline-none transition-all bg-gray-50 focus:bg-white"
            />
        </div>
    );
}

/* ─── Password input with toggle ─── */
function PasswordRow({ value, onChange, name, placeholder, showHint }) {
    const [show, setShow] = useState(false);
    const strength = value
        ? value.length < 8 ? "weak" : value.length < 12 ? "medium" : "strong"
        : null;
    const strengthMap = {
        weak: { color: "#dc2626", w: "33%", label: "Weak" },
        medium: { color: "#d97706", w: "66%", label: "Medium" },
        strong: { color: "#16a34a", w: "100%", label: "Strong" },
    };
    const s = strength && strengthMap[strength];

    return (
        <div>
            <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    type={show ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full h-11 pl-10 pr-10 text-sm border border-gray-200 rounded-xl focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/10 outline-none transition-all bg-gray-50 focus:bg-white"
                />
                <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {showHint && value && (
                <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: s.w }}
                            className="h-full rounded-full"
                            style={{ background: s.color }}
                        />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: s.color }}>
                        {s.label}
                    </span>
                </div>
            )}
        </div>
    );
}

/* ─── Role selector tiles ─── */
function RoleTiles({ value, onChange }) {
    const tiles = [
        { id: "staff", label: "Staff", desc: "Moderate meetings", icon: Users, color: "#1B4D3E" },
        { id: "admin", label: "Admin", desc: "Full panel access", icon: Shield, color: "#d97706" },
    ];
    return (
        <div className="grid grid-cols-2 gap-2">
            {tiles.map(t => {
                const Icon = t.icon;
                const active = value === t.id;
                return (
                    <button key={t.id} type="button" onClick={() => onChange(t.id)}
                        className={`relative p-3 rounded-xl border-2 text-left transition-all ${active
                            ? "bg-white shadow-[0_4px_12px_rgba(27,77,62,0.12)]"
                            : "bg-gray-50 border-gray-200 hover:border-gray-300"
                            }`}
                        style={active ? { borderColor: t.color } : {}}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: active ? t.color : "#e5e7eb", color: active ? "#fff" : "#6b7280" }}>
                                <Icon size={14} />
                            </div>
                            <span className={`text-sm font-bold ${active ? "text-gray-900" : "text-gray-700"}`}>{t.label}</span>
                            {active && (
                                <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-white"
                                    style={{ background: t.color }}>
                                    <Check size={11} strokeWidth={3} />
                                </div>
                            )}
                        </div>
                        <div className="text-[11px] text-gray-500 ml-9">{t.desc}</div>
                    </button>
                );
            })}
        </div>
    );
}

/* ─── Gender selector ─── */
function GenderTiles({ value, onChange }) {
    const tiles = [
        { id: "male", label: "Male", color: "#1e40af" },
        { id: "female", label: "Female", color: "#be185d" },
    ];
    return (
        <div className="grid grid-cols-2 gap-2">
            {tiles.map(t => {
                const active = value === t.id;
                return (
                    <button key={t.id} type="button" onClick={() => onChange(t.id)}
                        className={`h-11 rounded-xl border-2 text-sm font-bold transition-all ${active
                            ? "text-white shadow-md"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                            }`}
                        style={active ? { background: t.color, borderColor: t.color } : {}}
                    >
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}

export default function AddStaffPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        gender: "male",
        role: "staff",
        image: null,
    });

    const setField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setField(name, value);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("Image size must be less than 5MB"); return; }
        if (!file.type.startsWith("image/")) { toast.error("Please upload a valid image file"); return; }
        setField("image", file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setField("image", null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const validateForm = () => {
        if (!formData.name.trim()) { toast.error("Name is required"); return false; }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Please enter a valid email"); return false;
        }
        if (formData.password.length < 8) { toast.error("Password must be at least 8 characters"); return false; }
        if (formData.password !== formData.confirmPassword) { toast.error("Passwords do not match"); return false; }
        if (!formData.image) { toast.error("Profile image is required"); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("mobile", formData.mobile || "");
        data.append("password_hash", formData.password);
        data.append("role", formData.role);
        data.append("gender", formData.gender);
        data.append("referrerId", "");
        data.append("image", formData.image);

        AuthService.registerStaff(data, {
            onSuccess: () => {
                toast.success(`${formData.role === "staff" ? "Staff" : "Admin"} member created!`);
                setLoading(false);
            },
            onFailed: (err) => {
                toast.error(err.message || "Failed to create staff member");
                setLoading(false);
            },
        });

    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f5f3] to-[#fafaf9] p-4 sm:p-6">
            <div className="max-w-5xl mx-auto space-y-5">

                {/* ── Header ── */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center shadow-sm shrink-0">
                            <ArrowLeft size={16} className="text-gray-600" />
                        </button>
                        <div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#1B4D3E]/10 text-[#1B4D3E] mb-1">
                                <Sparkles size={11} /> Admin · Staff
                            </div>
                            <h1 className="text-2xl sm:text-[26px] font-extrabold text-gray-900 leading-tight tracking-tight"
                                style={{ letterSpacing: "-0.03em" }}>
                                Add Staff Member
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Create a new staff or admin account
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Form Card ── */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.04)] border border-gray-100 overflow-hidden">

                    {/* Top stripe */}
                    <div className="h-1.5" style={{ background: "linear-gradient(90deg,#1B4D3E,#2d7a63)" }} />

                    <div className="p-5 sm:p-7">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">

                            {/* ── Avatar (spans full row at top) ── */}
                            <div className="lg:col-span-2">
                                <FieldLabel required>Profile Image</FieldLabel>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-md">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={36} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col gap-2">
                                        <label className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl font-bold cursor-pointer text-sm transition-all w-fit text-white shadow-[0_2px_8px_rgba(27,77,62,0.20)] hover:-translate-y-0.5"
                                            style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                                            <Upload size={14} />
                                            {imagePreview ? "Change Image" : "Upload Image"}
                                            <input ref={fileInputRef} type="file" accept="image/*"
                                                onChange={handleImageChange} className="hidden" />
                                        </label>
                                        <p className="text-[11px] text-gray-500">PNG, JPG up to 5MB · Required</p>
                                        {imagePreview && (
                                            <button type="button" onClick={handleRemoveImage}
                                                className="text-[11px] font-bold text-red-600 hover:text-red-700 self-start">
                                                Remove image
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Left Column ── */}
                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <FieldLabel required>Full Name</FieldLabel>
                                    <InputRow icon={User} type="text" name="name"
                                        value={formData.name} onChange={handleInputChange}
                                        placeholder="Enter full name" />
                                </div>

                                {/* Email */}
                                <div>
                                    <FieldLabel required>Email Address</FieldLabel>
                                    <InputRow icon={Mail} type="email" name="email"
                                        value={formData.email} onChange={handleInputChange}
                                        placeholder="name@example.com" />
                                </div>

                                {/* Mobile */}
                                <div>
                                    <FieldLabel>Mobile Number</FieldLabel>
                                    <InputRow icon={Phone} type="tel" name="mobile"
                                        value={formData.mobile} onChange={handleInputChange}
                                        placeholder="+1 555 000 0000" />
                                </div>

                                {/* Gender */}
                                <div>
                                    <FieldLabel required>Gender</FieldLabel>
                                    <GenderTiles value={formData.gender}
                                        onChange={(v) => setField("gender", v)} />
                                </div>
                            </div>

                            {/* ── Right Column ── */}
                            <div className="space-y-4">
                                {/* Password */}
                                <div>
                                    <FieldLabel required>Password</FieldLabel>
                                    <PasswordRow
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Minimum 8 characters"
                                        showHint
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <FieldLabel required>Confirm Password</FieldLabel>
                                    <PasswordRow
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Re-enter password"
                                    />
                                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-red-600 font-semibold">
                                            <AlertCircle size={11} /> Passwords don't match
                                        </div>
                                    )}
                                </div>

                                {/* Role tiles */}
                                <div>
                                    <FieldLabel required>Role</FieldLabel>
                                    <RoleTiles value={formData.role}
                                        onChange={(v) => setField("role", v)} />
                                </div>
                            </div>
                        </div>

                        {/* Permissions info */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-xl p-3 border border-gray-200 bg-gray-50">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users size={14} className="text-[#1B4D3E]" />
                                    <span className="text-xs font-bold text-gray-900">Staff</span>
                                </div>
                                <p className="text-[11px] text-gray-500 leading-relaxed">Moderate meetings, review reports.</p>
                            </div>
                            <div className="rounded-xl p-3 border border-amber-200 bg-amber-50">
                                <div className="flex items-center gap-2 mb-1">
                                    <Shield size={14} className="text-amber-700" />
                                    <span className="text-xs font-bold text-gray-900">Admin</span>
                                </div>
                                <p className="text-[11px] text-amber-800 leading-relaxed">Full admin panel access including user management.</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="bg-gray-50 border-t border-gray-100 px-5 sm:px-7 py-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                        <button type="button" onClick={() => navigate(-1)} disabled={loading}
                            className="h-11 px-6 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="h-11 px-7 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(27,77,62,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(27,77,62,0.30)] order-1 sm:order-2"
                            style={{
                                background: loading
                                    ? "linear-gradient(135deg,#6b7280,#9ca3af)"
                                    : "linear-gradient(135deg,#1B4D3E,#2d7a63)"
                            }}>
                            {loading ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Creating…
                                </>
                            ) : (
                                <>
                                    <UserPlus size={16} /> Create {formData.role === "admin" ? "Admin" : "Staff"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

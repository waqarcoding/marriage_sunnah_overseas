// @ts-nocheck
// features/guardian/pages/GuardianProfilePage.jsx
// Simplified profile for guardians: single avatar + name/address/phone only
// Uses the same ProfileService APIs (updateProfile, uploadImage, getCurrentUser)

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Edit3, Check, X, Camera, Loader2, User, Phone, MapPin,
    Shield, LogOut, ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProfileService from "../../profile/services/ProfileService";
import AuthService from "../../auth/services/AuthService";

import SuccessDialog from "../../../ui/success_dialogue";
import ImageCropModal from "../../profile/myprofile/components/image_crop_model";

export default function GuardianProfilePage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatar, setAvatar] = useState("");
    const [cropImage, setCropImage] = useState(null);
    const [form, setForm] = useState({
        name: "", phone: "", address: "", city: "", country: "",
    });

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await ProfileService.getCurrentUser();
            const p = res?.profile || res?.data?.profile || res?.data || res;
            setProfile(p);

            let imgs = [];
            try {
                imgs = typeof p?.images === "string"
                    ? JSON.parse(p.images || "[]")
                    : Array.isArray(p?.images) ? p.images : [];
            } catch { imgs = []; }
            setAvatar(imgs.filter(Boolean)[0] || p?.avatar || "");

            setForm({
                name: p?.name || "",
                phone: p?.phone || "",
                address: p?.address || "",
                city: p?.city || "",
                country: p?.country || "",
            });
        } catch (err) {
            console.error("fetchProfile error:", err);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error("Name is required"); return; }
        setSaving(true);
        try {
            await ProfileService.updateProfile({ ...form });
            setProfile((prev) => ({ ...prev, ...form }));
            setEditMode(false);
            setShowSuccess(true);
        } catch { toast.error("Failed to save changes"); }
        finally { setSaving(false); }
    };

    const handleCancel = () => {
        if (profile) {
            setForm({
                name: profile.name || "",
                phone: profile.phone || "",
                address: profile.address || "",
                city: profile.city || "",
                country: profile.country || "",
            });
        }
        setEditMode(false);
    };

    const handleAvatarClick = () => { fileInputRef.current?.click(); };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setCropImage({ url: reader.result, index: 0 });
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleCroppedImage = async (croppedBlob) => {
        setCropImage(null);
        const blobUrl = URL.createObjectURL(croppedBlob);
        setAvatar(blobUrl);
        setUploadingAvatar(true);
        try {
            const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
            const data = await ProfileService.uploadImage(file, 0);
            if (data.success) {
                const url = data.imageUrl?.startsWith("http")
                    ? data.imageUrl
                    : `${import.meta.env.VITE_BASE_URL}${data.imageUrl}`;
                setAvatar(url);
                toast.success("Profile photo updated!");
            } else {
                toast.error(data.message || "Upload failed");
            }
        } catch { toast.error("Upload failed"); }
        finally { setUploadingAvatar(false); }
    };

    const handleLogout = async () => {
        try { await AuthService.logout(); } catch { }
        navigate("/login");
    };

    if (loading) return (
        <div style={{
            height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "var(--secondary)",
        }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 opacity-20"
                        style={{ borderColor: 'var(--primary)' }} />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
                        style={{ borderTopColor: 'var(--primary)', borderRightColor: 'var(--primary)' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                    Loading profile...
                </p>
            </motion.div>
        </div>
    );

    const initial = (form.name || "G")[0].toUpperCase();
    const locationStr = [form.city, form.country].filter(Boolean).join(", ");

    return (
        <div className="min-h-screen pb-24" style={{ background: "var(--secondary)" }}>
            <input ref={fileInputRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleFileChange} />

            <AnimatePresence>
                {showSuccess && <SuccessDialog onClose={() => setShowSuccess(false)} />}
                {cropImage && (
                    <ImageCropModal
                        image={cropImage.url}
                        onSave={handleCroppedImage}
                        onCancel={() => setCropImage(null)}
                    />
                )}
            </AnimatePresence>

            {/* ── Header ── */}
            <div className="px-5 pt-5 pb-2 flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-[26px] font-extrabold tracking-tight text-gray-900 leading-tight mb-1"
                        style={{ letterSpacing: '-0.03em' }}>
                        My Profile
                    </h1>
                    <p className="text-sm text-gray-400 font-medium">
                        {editMode ? "Editing your details" : "Manage your information"}
                    </p>
                </div>
                {!editMode ? (
                    <button onClick={() => setEditMode(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition active:scale-95"
                        style={{
                            background: 'var(--primary)',
                            color: 'var(--primary-foreground, #fef3c7)',
                        }}>
                        <Edit3 size={14} />
                        Edit
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleCancel} disabled={saving}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-white"
                            style={{ border: '1.5px solid #e5e7eb', color: '#6b7280' }}>
                            <X size={16} />
                        </button>
                        <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition active:scale-95"
                            style={{
                                background: 'var(--primary)',
                                color: 'var(--primary-foreground, #fef3c7)',
                                opacity: saving ? 0.7 : 1,
                            }}>
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            {saving ? 'Saving' : 'Save'}
                        </button>
                    </div>
                )}
            </div>

            <div className="px-4 mx-auto" style={{ maxWidth: 600 }}>
                {/* ── Identity Card ── */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] mb-4">
                    {/* Gradient header strip */}
                    <div className="relative h-32"
                        style={{
                            background: 'linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary), black 20%))',
                        }}>
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 30%, white 1px, transparent 1px)',
                                backgroundSize: '24px 24px, 32px 32px',
                            }} />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1"
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                color: 'var(--primary-foreground, #fef3c7)',
                            }}>
                            <Shield size={10} />
                            Guardian
                        </div>
                    </div>

                    <div className="px-5 pb-5">
                        {/* Avatar w/ camera */}
                        <div className="flex items-end gap-4 -mt-16 mb-5">
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center"
                                    style={{
                                        background: '#e5e7eb',
                                        border: '4px solid white',
                                        boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                                    }}>
                                    {avatar ? (
                                        <img src={avatar} alt={form.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML =
                                                    `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:bold;color:var(--primary);background:#e5e7eb">${initial}</div>`;
                                            }} />
                                    ) : (
                                        <span style={{ fontSize: 42, fontWeight: 'bold', color: 'var(--primary)' }}>
                                            {initial}
                                        </span>
                                    )}
                                </div>
                                <button onClick={handleAvatarClick} disabled={uploadingAvatar}
                                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center transition active:scale-90"
                                    style={{
                                        background: 'var(--primary)',
                                        color: 'var(--primary-foreground, #fef3c7)',
                                        border: '3px solid white',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                    }}
                                    aria-label="Change photo">
                                    {uploadingAvatar
                                        ? <Loader2 size={15} className="animate-spin" />
                                        : <Camera size={15} />}
                                </button>
                            </div>

                            <div className="flex-1 min-w-0 pb-2">
                                <h2 className="text-xl font-bold leading-tight truncate"
                                    style={{ color: 'var(--primary)' }}>
                                    {form.name || "Your Name"}
                                </h2>
                                {locationStr && (
                                    <p className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
                                        <MapPin size={11} />
                                        {locationStr}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Editable fields */}
                        <div className="space-y-3">
                            <FieldRow
                                icon={User}
                                label="Full Name"
                                value={form.name}
                                editMode={editMode}
                                onChange={(v) => setField("name", v)}
                                placeholder="Enter your full name"
                            />
                            <FieldRow
                                icon={Phone}
                                label="Phone Number"
                                value={form.phone}
                                editMode={editMode}
                                onChange={(v) => setField("phone", v)}
                                placeholder="+1 234 567 8900"
                                type="tel"
                            />
                            <FieldRow
                                icon={MapPin}
                                label="Address"
                                value={form.address}
                                editMode={editMode}
                                onChange={(v) => setField("address", v)}
                                placeholder="Street address"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <FieldRow
                                    icon={null}
                                    label="City"
                                    value={form.city}
                                    editMode={editMode}
                                    onChange={(v) => setField("city", v)}
                                    placeholder="City"
                                    compact
                                />
                                <FieldRow
                                    icon={null}
                                    label="Country"
                                    value={form.country}
                                    editMode={editMode}
                                    onChange={(v) => setField("country", v)}
                                    placeholder="Country"
                                    compact
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                {!editMode && (
                    <div className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] mb-4">
                        <ActionRow
                            icon={Shield}
                            label="My Wards"
                            sub="View and manage linked wards"
                            onClick={() => navigate("/guardian/add-ward")}
                        />
                        <Divider />
                        <ActionRow
                            icon={LogOut}
                            label="Logout"
                            sub="Sign out of your account"
                            danger
                            onClick={handleLogout}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────
   Sub-components
   ──────────────────────────────────────────────────────────── */
function FieldRow({ icon: Icon, label, value, editMode, onChange, placeholder, type = "text", compact }) {
    return (
        <div className="rounded-2xl p-3.5"
            style={{ background: 'var(--secondary)', border: '0.5px solid rgba(27,77,62,0.06)' }}>
            <label className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--primary)', opacity: 0.7 }}>
                {Icon && <Icon size={11} />}
                {label}
            </label>
            {editMode ? (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent outline-none border-none p-0 text-[15px] font-semibold"
                    style={{ color: 'var(--primary)' }}
                />
            ) : (
                <p className="text-[15px] font-semibold truncate"
                    style={{ color: value ? 'var(--primary)' : '#9ca3af' }}>
                    {value || `No ${label.toLowerCase()} set`}
                </p>
            )}
        </div>
    );
}

function ActionRow({ icon: Icon, label, sub, onClick, danger }) {
    return (
        <button onClick={onClick}
            className="w-full flex items-center gap-3.5 px-5 py-4 transition active:bg-gray-50 text-left">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                    background: danger ? '#fee2e2' : 'var(--secondary)',
                    color: danger ? '#ef4444' : 'var(--primary)',
                }}>
                <Icon size={17} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight"
                    style={{ color: danger ? '#ef4444' : 'var(--primary)' }}>
                    {label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
        </button>
    );
}

function Divider() {
    return <div className="h-px ml-[68px]" style={{ background: 'rgba(0,0,0,0.05)' }} />;
}

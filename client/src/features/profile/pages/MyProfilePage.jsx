import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Settings, Camera, MapPin, Briefcase, GraduationCap,
    Heart, Users, Award, Edit3, ChevronRight, Check, X,
    Loader2, Star, Shield, Phone, Mail, UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProfileService from "../api/ProfileService";
import { Badge } from "../../../components/ui/badge";

// ─── Success Dialog ───────────────────────────────────────────────────────────
function SuccessDialog({ onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 2000); return () => clearTimeout(t); }, []);
    return (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-3xl px-10 py-8 flex flex-col items-center gap-3 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-gray-800 font-semibold text-lg">Profile Updated!</p>
                <p className="text-gray-400 text-sm">Your changes have been saved.</p>
            </div>
        </motion.div>
    );
}

// ─── Interests Editor ─────────────────────────────────────────────────────────
function InterestsEditor({ interests, onChange }) {
    const [input, setInput] = useState("");
    const add = () => { const v = input.trim(); if (v && !interests.includes(v)) onChange([...interests, v]); setInput(""); };
    const remove = (i) => onChange(interests.filter((_, idx) => idx !== i));
    return (
        <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>

                {interests.map((item, i) => (

                    <span key={i} style={{
                        display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 10,
                        backgroundColor: "var(--color-secondary)", // use primary from css var
                        fontSize: 15, color: "var(--color-primary )",
                    }}>
                        {item}
                        <button onClick={() => remove(i)} style={{ lineHeight: 1, color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer" }}>
                            <X style={{ width: 12, height: 12 }} />
                        </button>
                    </span>
                ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Type and press Enter..."
                    style={{ flex: 1, padding: "6px 12px", borderRadius: 12, border: "1px solid var(--color-primary)", fontSize: 12, outline: "none", background: "#fff" }} />
                <button onClick={add} style={{
                    padding: "6px 14px", borderRadius: 12, background: "var(--color-primary)", color: "var(--color-primary-foreground)", fontSize: 12, border: "none",
                }}>Add</button>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 12, // more rounded
    border: "1.5px solid var(--color-primary)",
    fontSize: 13,
    outline: "none",
    color: "#333",
    background: "#fff", // white background always
    boxSizing: "border-box",
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyProfilePage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingGuardian, setSavingGuardian] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editGuardian, setEditGuardian] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [uploadingIdx, setUploadingIdx] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [interests, setInterests] = useState([]);
    // @ts-ignore
    const hasGuardian = false;
    const [counts, setCounts] = useState({
        likes_sent: 0, likes_received: 0, matches: 0,
        dislikes_sent: 0, dislikes_received: 0,
    });

    const [form, setForm] = useState({
        name: "", age: "", profession: "", education: "", bio: "",
    });

    const [guardianForm, setGuardianForm] = useState({
        guardian_name: "", guardian_phone: "", guardian_email: "", guardian_relationship: "",
    });

    // ── Fetch ──────────────────────────────────────────────────────────────────
    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await ProfileService.getMyProfile();
            const p = res?.data || res?.profile || res;
            setCounts(res?.counts || {});
            setProfile(p);
            setPhotos(ProfileService.parseImages(p));
            setForm({
                name: p?.name || "", age: p?.age || "",
                profession: p?.profession || "", education: p?.education || "", bio: p?.bio || "",
            });
            setGuardianForm({
                guardian_name: p?.guardian_name || "",
                guardian_phone: p?.guardian_phone || "",
                guardian_email: p?.guardian_email || "",
                guardian_relationship: p?.guardian_relationship || "",
            });
            setInterests(parseInterests(p));
        } catch {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const parseInterests = (p) => {
        if (!p?.interests) return [];
        if (Array.isArray(p.interests)) return p.interests;
        try { const parsed = JSON.parse(p.interests); return Array.isArray(parsed) ? parsed : []; }
        catch { return []; }
    };

    const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));
    const setGField = (key, val) => setGuardianForm((f) => ({ ...f, [key]: val }));

    // ── Save Profile ───────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            await ProfileService.updateProfile({ ...form, interests: JSON.stringify(interests) });
            setProfile((prev) => ({ ...prev, ...form, interests: JSON.stringify(interests) }));
            setEditMode(false);
            setShowSuccess(true);
        } catch { toast.error("Failed to save changes"); }
        finally { setSaving(false); }
    };

    const handleCancel = () => {
        if (profile) {
            setForm({ name: profile.name || "", age: profile.age || "", profession: profile.profession || "", education: profile.education || "", bio: profile.bio || "" });
            setInterests(parseInterests(profile));
            setPhotos(ProfileService.parseImages(profile));
        }
        setEditMode(false);
    };

    // ── Save Guardian ──────────────────────────────────────────────────────────
    const handleSaveGuardian = async () => {
        setSavingGuardian(true);
        try {
            await ProfileService.updateGuardian(guardianForm);
            setProfile((prev) => ({ ...prev, ...guardianForm }));
            setEditGuardian(false);
            setShowSuccess(true);
        } catch { toast.error("Failed to save guardian details"); }
        finally { setSavingGuardian(false); }
    };

    const handleCancelGuardian = () => {
        setGuardianForm({
            guardian_name: profile?.guardian_name || "",
            guardian_phone: profile?.guardian_phone || "",
            guardian_email: profile?.guardian_email || "",
            guardian_relationship: profile?.guardian_relationship || "",
        });
        setEditGuardian(false);
    };

    // ── Image upload ───────────────────────────────────────────────────────────
    const handlePhotoClick = (idx) => { fileInputRef.current._idx = idx; fileInputRef.current.click(); };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const idx = fileInputRef.current._idx;
        const blobUrl = URL.createObjectURL(file);
        setPhotos((prev) => { const n = [...prev]; n[idx] = blobUrl; return n; });
        setUploadingIdx(idx);
        try {
            const data = await ProfileService.uploadImage(file, idx);
            if (data.success) {
                // @ts-ignore
                setPhotos((prev) => { const n = [...prev]; n[idx] = data.imageUrl?.startsWith("http") ? data.imageUrl : `${import.meta.env.VITE_BASE_URL}${data.imageUrl}`; return n; });
            } else { toast.error(data.message || "Upload failed"); }
        } catch { toast.error("Upload failed"); }
        finally { setUploadingIdx(null); e.target.value = ""; }
    };

    if (loading) return (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Loader2 style={{ width: 32, height: 32, color: "var(--color-primary)" }} className="animate-spin" />
        </div>
    );

    const location = [profile?.city, profile?.country].filter(Boolean).join(", ");
    // @ts-ignore
    const hasGuardian = guardianForm.guardian_name || guardianForm.guardian_phone || guardianForm.guardian_email;

    return (
        <div style={{ height: "100%", overflowY: "auto", backgroundColor: "#f0f0f0", padding: 10 }}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

            <AnimatePresence>
                {showSuccess && <SuccessDialog onClose={() => setShowSuccess(false)} />}
            </AnimatePresence>

            <div style={{ maxWidth: 640, margin: "0 auto", padding: "", paddingBottom: 60 }}>

                {/* ── Header ── */}
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff",
                    padding: "16px ", borderBottom: "1px solid #eee",
                    top: 0, zIndex: 10, borderRadius: "16px 16px 0 0"
                }}>
                    <h1 style={{ fontSize: 24, margin: 0 }}>Profile</h1>
                    <div style={{ display: "flex", gap: 8 }}>
                        {editMode ? (
                            <>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={handleCancel}
                                    style={{
                                        height: 36, padding: "0 16px", borderRadius: 20, border: "1px solid #e5e7eb", fontSize: 13,
                                        display: "flex", alignItems: "center", gap: 4, color: "#555", background: "#fff"
                                    }}>
                                    <X style={{ width: 14, height: 14 }} /> Cancel
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={saving}
                                    style={{
                                        height: 36, padding: "0 16px", borderRadius: 20, background: "var(--color-primary)",
                                        color: "var(--color-primary-foreground)", fontSize: 13, display: "flex", alignItems: "center", gap: 4, border: "none"
                                    }}>
                                    {saving ? <Loader2 style={{ width: 14, height: 14, color: "var(--color-primary-foreground)" }} className="animate-spin" /> : <Check style={{ width: 14, height: 14 }} />} Save
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditMode(true)}
                                    style={{
                                        width: 40, height: 40, borderRadius: "50%", backgroundColor: "var(--color-primary)",
                                        display: "flex", justifyContent: "center", alignItems: "center", border: "none"
                                    }}>
                                    <Edit3 style={{ width: 18, height: 18, color: "var(--color-primary-foreground)" }} />
                                </motion.button>

                            </>
                        )}
                    </div>
                </div>

                {/* ── Photos ── */}
                <div style={{ backgroundColor: "#fff", padding: 16, marginBottom: 12, borderRadius: "0 0 16px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                        {photos.map((photo, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05, duration: 0.4, ease: "easeOut" }}
                                whileHover={{ scale: 1.03 }}
                                onClick={() => handlePhotoClick(idx)}
                                style={{
                                    flex: "1 1 0",
                                    borderRadius: 20,
                                    overflow: "hidden",
                                    position: "relative",
                                    aspectRatio: "3/4",
                                    backgroundColor: "#eee",
                                    cursor: "pointer",
                                    direction: "rtl"
                                }}>
                                <img
                                    src={photo}
                                    alt={`Photo ${idx + 1}`}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block"
                                    }}
                                    loading="eager"
                                />
                                {uploadingIdx === idx && (
                                    <div style={{
                                        position: "absolute", inset: 0,
                                        background: "rgba(0,0,0,0.4)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <Loader2 style={{ width: 24, height: 24, color: "#fff" }} className="animate-spin" />
                                    </div>
                                )}
                                {idx === 0 && <div style={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    padding: "2px 6px",
                                    borderRadius: 8,
                                    background: "var(--color-primary)",
                                    color: "var(--color-primary-foreground)",
                                    fontSize: 10
                                }}>Main</div>}
                                <motion.button whileTap={{ scale: 0.9 }}
                                    style={{
                                        position: "absolute",
                                        bottom: 8,
                                        left: 8,
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        backgroundColor: "#fff",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        border: "none"
                                    }}>
                                    <Camera style={{ width: 14, height: 14, color: "#555" }} />
                                </motion.button>
                            </motion.div>
                        ))}
                        {photos.length < 4 && (
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => handlePhotoClick(photos.length)}
                                style={{
                                    flex: "1 1 0", borderRadius: 20, border: "2px dashed var(--color-primary)", display: "flex",
                                    flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, aspectRatio: "3/4", background: "#fafafa", cursor: "pointer"
                                }}>
                                {uploadingIdx === photos.length
                                    ? <Loader2 style={{ width: 28, height: 28, color: "var(--color-primary)" }} className="animate-spin" />
                                    : <>
                                        <Camera style={{ width: 32, height: 32, color: "#888" }} />
                                        <span style={{ fontSize: 10, color: "#888" }}>Add Photo</span>
                                    </>}
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* ── Basic Info ── */}
                <div style={{ backgroundColor: "#fff", padding: 24, marginBottom: 12, borderRadius: 16 }}>
                    <div style={{ marginBottom: 12 }}>
                        {editMode ? (
                            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                <input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Name"
                                    style={{
                                        flex: 1, padding: "6px 12px", borderRadius: 12, border: "1.5px solid var(--color-primary)",
                                        fontSize: 20, outline: "none", color: "#333", background: "#fff"
                                    }} />
                                <input value={form.age} onChange={(e) => setField("age", e.target.value)} placeholder="Age" type="number"
                                    style={{
                                        width: 70, padding: "6px 10px", borderRadius: 12, border: "1.5px solid var(--color-primary)",
                                        fontSize: 20, outline: "none", color: "#333", background: "#fff"
                                    }} />
                            </div>
                        ) : (
                            <h2 style={{ fontSize: 22, margin: "0 0 6px" }}>{form.name || "Your Name"}{form.age ? `, ${form.age}` : ""}</h2>
                        )}
                        {location && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#888", fontSize: 13 }}>
                                <MapPin style={{ width: 14, height: 14 }} /><span>{location}</span>
                            </div>
                        )}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Briefcase style={{ width: 15, height: 15, color: "var(--color-primary)" }} />
                            {editMode
                                ? <input value={form.profession} onChange={(e) => setField("profession", e.target.value)} placeholder="Profession"
                                    style={{
                                        padding: "4px 10px", borderRadius: 12, border: "1.5px solid var(--color-primary)", fontSize: 13,
                                        outline: "none", color: "#333", background: "#fff", width: 160
                                    }} />
                                : <span style={{ fontSize: 13, color: "#555" }}>{form.profession || "—"}</span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <GraduationCap style={{ width: 15, height: 15, color: "#a855f7" }} />
                            {editMode
                                ? <input value={form.education} onChange={(e) => setField("education", e.target.value)} placeholder="Education"
                                    style={{
                                        padding: "4px 10px", borderRadius: 12, border: "1.5px solid var(--color-primary)", fontSize: 13,
                                        outline: "none", color: "#333", background: "#fff", width: 160
                                    }} />
                                : <span style={{ fontSize: 13, color: "#555" }}>{form.education || "—"}</span>}
                        </div>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div style={{
                    backgroundColor: "#fff", padding: 24, marginBottom: 12, display: "flex",
                    justifyContent: "space-around", borderRadius: 16
                }}>
                    {[
                        { icon: Heart, bg: "#ffe4e6", color: "var(--color-primary)", val: counts.likes_received || 0, label: "Likes" },
                        { icon: Users, bg: "#ede9fe", color: "#7c3aed", val: counts.matches || 0, label: "Matches" },
                        { icon: Star, bg: "#dbeafe", color: "#3b82f6", val: counts.likes_sent || 0, label: "Likes Sent" },
                    ].map(({ icon: Icon, bg, color, val, label }) => (
                        <div key={label} style={{ textAlign: "center" }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: "50%", backgroundColor: bg,
                                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px"
                            }}>
                                <Icon style={{ width: 28, height: 28, color }} />
                            </div>
                            <div style={{ fontSize: 20, marginBottom: 2 }}>{val}</div>
                            <div style={{ fontSize: 12, color: "#555" }}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* ── About ── */}
                <div style={{ backgroundColor: "#fff", padding: 24, marginBottom: 12, borderRadius: 16 }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>About Me</h3>
                    {editMode ? (
                        <textarea value={form.bio} onChange={(e) => setField("bio", e.target.value)} rows={4} placeholder="Tell others about yourself..."
                            style={{
                                width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid var(--color-primary)",
                                fontSize: 13, lineHeight: 1.6, resize: "none", outline: "none", color: "#333", background: "#fff", boxSizing: "border-box"
                            }} />
                    ) : (
                        <p style={{ color: "#555", lineHeight: 1.6, fontSize: 13, margin: 0 }}>
                            {form.bio || <span style={{ color: "#ccc", fontStyle: "italic" }}>No bio yet</span>}
                        </p>
                    )}
                </div>

                {/* ── Interests ── */}
                <div style={{ backgroundColor: "#fff", padding: 24, marginBottom: 12, borderRadius: 10 }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>Interests</h3>
                    {editMode ? <InterestsEditor interests={interests} onChange={setInterests} /> : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {interests.length > 0
                                ? interests.map((item, idx) => (
                                    <Badge
                                        key={idx}
                                        variant="accent"
                                        active={item}
                                        style={{ fontSize: 14, padding: "6px 16px" }}
                                    >
                                        {item}
                                    </Badge>
                                ))
                                : <span style={{ fontSize: 12, color: "#ccc", fontStyle: "italic" }}>No interests added</span>}
                        </div>
                    )}
                </div>


                {/* ── Guardian ── */}
                <div style={{ backgroundColor: "#fff", padding: 24, marginBottom: 12, borderRadius: 16 }}>

                    {/* Section header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: "50%", backgroundColor: "#ede9fe",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                <Shield style={{ width: 16, height: 16, color: "#7c3aed" }} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: 15 }}>Guardian (Wali)</h3>
                        </div>

                        {hasGuardian && !editGuardian && (
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditGuardian(true)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", borderRadius: 16,
                                    backgroundColor: "var(--color-primary)", border: "none", cursor: "pointer"
                                }}>
                                <Edit3 style={{ width: 13, height: 13, color: "var(--color-primary-foreground)" }} />
                                <span style={{ fontSize: 12, color: "var(--color-primary-foreground)" }}>Edit</span>
                            </motion.button>
                        )}

                        {editGuardian && (
                            <div style={{ display: "flex", gap: 6 }}>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={handleCancelGuardian}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 16,
                                        border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 12, color: "#555", background: "#fff"
                                    }}>
                                    <X style={{ width: 13, height: 13 }} /> Cancel
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSaveGuardian} disabled={savingGuardian}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", borderRadius: 16,
                                        background: "var(--color-primary)", color: "var(--color-primary-foreground)",
                                        border: "none", cursor: "pointer", fontSize: 12
                                    }}>
                                    {savingGuardian
                                        ? <Loader2 style={{ width: 13, height: 13, color: "var(--color-primary-foreground)" }} className="animate-spin" />
                                        : <Check style={{ width: 13, height: 13 }} />
                                    } Save
                                </motion.button>
                            </div>
                        )}
                    </div>

                    {/* Privacy note */}
                    <div style={{
                        backgroundColor: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 12,
                        padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#6d28d9", lineHeight: 1.5
                    }}>
                        🔒 Guardian details are private and only shared after mutual interest is established.
                    </div>

                    {/* ── Three states ── */}
                    {editGuardian ? (
                        /* 1. Edit form */
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {[
                                { key: "guardian_name", label: "Name", placeholder: "Guardian full name" },
                                { key: "guardian_relationship", label: "Relationship", placeholder: "e.g. Father, Brother" },
                                { key: "guardian_phone", label: "Phone", placeholder: "+44 7700 000000" },
                                { key: "guardian_email", label: "Email", placeholder: "guardian@email.com" },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key}>
                                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
                                        {label}
                                    </div>
                                    <input
                                        value={guardianForm[key]}
                                        onChange={(e) => setGField(key, e.target.value)}
                                        placeholder={placeholder}
                                        style={{ ...inputStyle, boxSizing: "border-box" }}
                                    />
                                </div>
                            ))}
                        </div>

                    ) : hasGuardian ? (
                        /* 2. View mode — guardian details exist */
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {[
                                { icon: UserCheck, label: guardianForm.guardian_name, sub: guardianForm.guardian_relationship || "Guardian", color: "#7c3aed", bg: "#ede9fe" },
                                { icon: Phone, label: guardianForm.guardian_phone, sub: "Phone", color: "#0891b2", bg: "#e0f2fe" },
                                { icon: Mail, label: guardianForm.guardian_email, sub: "Email", color: "#059669", bg: "#d1fae5" },
                            ].filter(row => row.label).map(({ icon: Icon, label, sub, color, bg }) => (
                                <div key={sub} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "50%", backgroundColor: bg,
                                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                    }}>
                                        <Icon style={{ width: 16, height: 16, color }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, color: "#333" }}>{label}</div>
                                        <div style={{ fontSize: 11, color: "#aaa" }}>{sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    ) : (
                        /* 3. Empty state — no guardian added yet */
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: "50%", backgroundColor: "#f3f4f6",
                                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px"
                            }}>
                                <Shield style={{ width: 26, height: 26, color: "#d1d5db" }} />
                            </div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>
                                No guardian added yet
                            </p>
                            <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 16px", lineHeight: 1.5 }}>
                                Add your Wali's details so they can be notified<br />when someone expresses interest.
                            </p>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setEditGuardian(true)}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    padding: "9px 22px", borderRadius: 16, background: "var(--color-primary)",
                                    color: "var(--color-primary-foreground)", fontSize: 13, border: "none", cursor: "pointer"
                                }}
                            >
                                <Shield style={{ width: 14, height: 14 }} />
                                Add Guardian
                            </motion.button>
                        </div>
                    )}
                </div>
                {/* ── Settings Links ── */}
                {!editMode && !editGuardian && (
                    <div style={{ backgroundColor: "#fff", marginBottom: 12, borderRadius: 16 }}>
                        {[
                            { icon: Settings, label: "Settings & Privacy", color: "#6b7280", bg: "#f3f4f6", path: "/settings" },
                            { icon: Award, label: "Get Verified", color: "#3b82f6", bg: "#dbeafe", path: "/verification" },
                            { icon: Heart, label: "Upgrade to Premium", color: "var(--color-primary)", bg: "#fce7f3", path: "/subscription" },
                        ].map(({ icon: Icon, label, color, bg, path }) => (
                            <motion.button key={label} whileTap={{ scale: 0.99 }} onClick={() => navigate(path)}
                                style={{
                                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "14px 24px", borderBottom: "1px solid #f9fafb", background: "none", textAlign: "left", borderRadius: 0
                                }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "50%", backgroundColor: bg,
                                        display: "flex", alignItems: "center", justifyContent: "center"
                                    }}>
                                        <Icon style={{ width: 16, height: 16, color }} />
                                    </div>
                                    <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
                                </div>
                                <ChevronRight style={{ width: 16, height: 16, color: "#9ca3af" }} />
                            </motion.button>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
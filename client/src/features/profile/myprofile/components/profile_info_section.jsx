// @ts-nocheck
import { useState, useEffect } from "react";
import { MapPin, Briefcase, GraduationCap, X, Check, Edit3, Loader2 } from "lucide-react";
import { Badge } from "../../../../ui/badge";
import { toast } from "react-toastify";
import ExploreService from "../../../explore/services/ExploreService";
import ProfileService from "../../services/ProfileService";

// ── Interests editor ──────────────────────────────────────────────────────────
function InterestsEditor({ interests = [], onChange }) {
    const [options, setOptions] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ExploreService.getOptions()
            .then((res) => {
                const list = res?.interests ?? res?.data?.interests ?? res?.data ?? [];
                // show first 30 only
                setOptions((Array.isArray(list) ? list : []).slice(0, 30));
            })
            .catch(() => setOptions([]))
            .finally(() => setLoading(false));
    }, []);

    const toggle = (item) =>
        onChange(interests.includes(item)
            ? interests.filter((i) => i !== item)
            : [...interests, item]);

    const addCustom = () => {
        let v = input.trim();
        if (!v) return;
        // Capitalize first letter and any letter after a space
        v = v.replace(/\b\w/g, c => c.toUpperCase());
        if (interests.includes(v)) { toast.info("Already added"); return; }
        onChange([...interests, v]);
        setInput("");

    };

    return (
        <div>
            {/* Selected chips */}
            {interests.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {interests.map((item) => (
                        <span key={item} style={{
                            display: "flex", alignItems: "center", gap: 4, padding: "4px 10px",
                            borderRadius: 10, backgroundColor: "var(--primary)", fontSize: 13, color: "#fff",
                        }}>
                            {item}
                            <button
                                onClick={() => onChange(interests.filter((i) => i !== item))}
                                style={{ lineHeight: 1, color: "#fff", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                            >
                                <X style={{ width: 11, height: 11 }} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Suggestions (first 30) */}
            {loading ? (
                <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 10px" }}>Loading suggestions...</p>
            ) : options.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Suggestions
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {options.map((item) => {
                            const selected = interests.includes(item);
                            return (
                                <button key={item} onClick={() => toggle(item)} style={{
                                    display: "flex", alignItems: "center", gap: 4,
                                    padding: "4px 12px", borderRadius: 10, fontSize: 13, cursor: "pointer",
                                    border: `1.5px solid ${selected ? "var(--primary)" : "#e0e0e0"}`,
                                    background: selected ? "var(--secondary)" : "#fafafa",
                                    color: selected ? "var(--primary)" : "#555",
                                    transition: "all 0.15s",
                                }}>
                                    {selected && <Check style={{ width: 11, height: 11 }} />}
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Custom input */}
            <div style={{ display: "flex", gap: 8 }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustom()}
                    placeholder="Add custom interest..."
                    style={{ flex: 1, padding: "6px 12px", borderRadius: 12, border: "1px solid var(--primary)", fontSize: 12, outline: "none", background: "#fff" }}
                />
                <button onClick={addCustom} style={{
                    padding: "6px 14px", borderRadius: 12,
                    background: "var(--primary)", color: "var(--primary-foreground)",
                    fontSize: 12, border: "none", cursor: "pointer",
                }}>
                    Add
                </button>
            </div>
        </div>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Divider() {
    return <div style={{ height: 1, background: "#f0f0f0", margin: "16px 0" }} />;
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function ProfileCard({
    form,
    location,
    interests: initialInterests = [],
    onProfileUpdated,
}) {
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [bio, setBio] = useState(form?.bio || "");
    const [interests, setInterests] = useState(initialInterests);

    // sync when parent re-fetches
    useEffect(() => { setBio(form?.bio || ""); }, [form?.bio]);
    useEffect(() => { setInterests(initialInterests); }, [initialInterests]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await ProfileService.updateAboutInterest({
                bio,
                interests: JSON.stringify(interests),
            });
            toast.success("Profile updated!");
            setEditMode(false);
            onProfileUpdated?.({ ...form, bio, interests });
        } catch {
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setBio(form?.bio || "");
        setInterests(initialInterests);
        setEditMode(false);
    };

    return (
        <div style={{ backgroundColor: "#fff", padding: 24, marginBottom: 12, borderRadius: 16 }}>

            {/* ── Name / Age / Gender — always read-only ── */}
            <div style={{ marginBottom: 8 }}>
                <h2 style={{ fontSize: 22, margin: "0 0 6px", color: "#1a1a1a" }}>
                    {form?.name || "Your Name"}
                    {form?.age ? `, ${form.age}` : ""}
                    {form?.gender ? `, ${form.gender}` : ""}
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 13, color: "#999" }}>
                    {form?.maritalStatus && <span>Marital Status: <span style={{ color: "#1a1a1a" }}>{form.maritalStatus}</span></span>}
                    {form?.nationality && <span>Nationality: <span style={{ color: "#1a1a1a" }}>{form.nationality}</span></span>}
                    {form?.religion && <span>Religion: <span style={{ color: "#1a1a1a" }}>{form.religion}</span></span>}
                </div>
            </div>

            {/* Location — always read-only */}
            {location && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#888", fontSize: 13, marginBottom: 10 }}>
                    <MapPin style={{ width: 14, height: 14, color: "#ef4444" }} />
                    <span>{location}</span>
                </div>
            )}

            {/* Profession & Education — always read-only */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Briefcase style={{ width: 15, height: 15, color: "#3b82f6" }} />
                    <span style={{ fontSize: 13, color: "#555" }}>{form?.profession || "—"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <GraduationCap style={{ width: 15, height: 15, color: "#a855f7" }} />
                    <span style={{ fontSize: 13, color: "#555" }}>{form?.education || "—"}</span>
                </div>
            </div>

            <Divider />

            {/* ── About Me — editable ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 15, color: "#1a1a1a" }}>About Me</h3>
                {!editMode && (
                    <button onClick={() => setEditMode(true)} style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: 10, fontSize: 12,
                        border: "1.5px solid var(--primary)", background: "#fff",
                        color: "var(--primary)", cursor: "pointer",
                    }}>
                        <Edit3 style={{ width: 12, height: 12 }} /> Edit
                    </button>
                )}
                {editMode && (
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={handleCancel} disabled={saving} style={{
                            display: "flex", alignItems: "center", gap: 4,
                            padding: "5px 12px", borderRadius: 10, fontSize: 12,
                            border: "1.5px solid #e0e0e0", background: "#fff",
                            color: "#555", cursor: "pointer",
                        }}>
                            <X style={{ width: 12, height: 12 }} /> Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving} style={{
                            display: "flex", alignItems: "center", gap: 4,
                            padding: "5px 12px", borderRadius: 10, fontSize: 12,
                            border: "none", background: saving ? "#ccc" : "var(--primary)",
                            color: saving ? "#888" : "var(--primary-foreground)",
                            cursor: saving ? "not-allowed" : "pointer",
                        }}>
                            {saving
                                ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" />
                                : <Check style={{ width: 12, height: 12 }} />}
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                )}
            </div>

            {editMode ? (
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell others about yourself..."
                    style={{
                        width: "100%", padding: "10px 12px", borderRadius: 12,
                        border: "1.5px solid var(--primary)", fontSize: 13,
                        lineHeight: 1.6, resize: "none", outline: "none",
                        color: "#333", background: "#fff", boxSizing: "border-box",
                    }}
                />
            ) : (
                <p style={{ color: bio ? "#555" : "#ccc", lineHeight: 1.6, fontSize: 13, margin: 0, fontStyle: bio ? "normal" : "italic" }}>
                    {bio || "No bio yet"}
                </p>
            )}

            <Divider />

            {/* ── Interests — editable ── */}
            <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#1a1a1a" }}>Interests</h3>
            {editMode ? (
                <InterestsEditor interests={interests} onChange={setInterests} />
            ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {interests.length > 0
                        ? interests.map((item, idx) => (
                            <Badge key={idx} variant="accent" style={{ fontSize: 13, padding: "5px 14px" }}>{item}</Badge>
                        ))
                        : <span style={{ fontSize: 12, color: "#ccc", fontStyle: "italic" }}>No interests added</span>}
                </div>
            )}
        </div>
    );
}
// @ts-nocheck
import { motion } from "motion/react";
import { Edit3, Check, X, Loader2, Crown } from "lucide-react";

export default function ProfileHeader({ editMode, saving, onEditToggle, onSave, onCancel, isPremium = false }) {
    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#fff",
            padding: "20px 24px",
            borderBottom: "1px solid #f0f5f3",
            borderRadius: "16px 16px 0 0",
        }}>
            {/* Left — Title and Pro badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Arrow Back Button */}
                <button
                    onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign('/')}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "none",
                        border: "none",
                        padding: 0,
                        marginRight: 8,
                        cursor: "pointer",
                        height: 32,
                        width: 32,
                        borderRadius: "999px",
                        transition: "background 0.18s",
                    }}
                    aria-label="Back"
                    tabIndex={0}
                    onMouseOver={e => e.currentTarget.style.background = "#F6F6F6"}
                    onMouseOut={e => e.currentTarget.style.background = "none"}
                >
                    {/* Chevron Left SVG */}
                    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" style={{ display: "block" }}>
                        <path d="M13 16L8 10L13 4" stroke="#1B4D3E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <h1 style={{ fontSize: 26, margin: 0, color: "#1B4D3E", fontWeight: 700, letterSpacing: "-0.02em" }}>
                    Profile
                </h1>
                {isPremium && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            display: "flex", alignItems: "center", gap: 4,
                            padding: "4px 10px", borderRadius: 20,
                            background: "var(--primary-foreground)",
                            boxShadow: "0 2px 8px rgba(255, 215, 0, 0.18)"
                        }}
                    >
                        <Crown style={{ width: 14, height: 14, color: "#FFA800" }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#4d3e1b", letterSpacing: "0.5px" }}>PRO</span>
                    </motion.div>
                )}
            </div>



        </div>
    );
}
// @ts-nocheck
import { motion } from "motion/react";
import { Settings, Award, Heart, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SettingsSection() {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: "#fff", marginBottom: 12, borderRadius: 16 }}>
            {[
                { icon: Settings, label: "Settings & Privacy", color: "#6b7280", bg: "#f3f4f6", path: "/settings" },
                { icon: Award, label: "Get Verified", color: "#3b82f6", bg: "#dbeafe", path: "/verification" },
                { icon: Heart, label: "Upgrade to Premium", color: "#ef4444", bg: "#fce7f3", path: "/subscription" },
            ].map(({ icon: Icon, label, color, bg, path }) => (
                <motion.button key={label} whileTap={{ scale: 0.99 }} onClick={() => navigate(path)}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid #f9fafb", background: "none", textAlign: "left", borderRadius: 0, cursor: "pointer", border: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon style={{ width: 16, height: 16, color }} />
                        </div>
                        <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
                    </div>
                    <ChevronRight style={{ width: 16, height: 16, color: "#9ca3af" }} />
                </motion.button>
            ))}
        </div>
    );
}
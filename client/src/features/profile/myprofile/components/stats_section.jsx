// @ts-nocheck
import { Heart, Users, Star } from "lucide-react";

export default function StatsSection({ counts }) {
    return (
        <div style={{ backgroundColor: "#fff", padding: 24, marginBottom: 12, display: "flex", justifyContent: "space-around", borderRadius: 16 }}>
            {[
                { icon: Heart, bg: "#f0f5f3", color: "#1B4D3E", val: counts.likes_received || 0, label: "Likes" },
                { icon: Users, bg: "#f0f5f3", color: "#1B4D3E", val: counts.matches || 0, label: "Matches" },
                { icon: Star, bg: "#f0f5f3", color: "#1B4D3E", val: counts.likes_sent || 0, label: "Likes Sent" },
            ].map(({ icon: Icon, bg, color, val, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                        <Icon style={{ width: 28, height: 28, color }} />
                    </div>
                    <div style={{ fontSize: 20, marginBottom: 2, color: "#1B4D3E" }}>{val}</div>
                    <div style={{ fontSize: 12, color: "#1B4D3E", opacity: 0.7 }}>{label}</div>
                </div>
            ))}
        </div>
    );
}
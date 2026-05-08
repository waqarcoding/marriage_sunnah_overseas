// @ts-nocheck
import { motion } from "motion/react";
import { Shield, Phone, Mail, ChevronRight, Edit3, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import GuardianService from "../../../guardian/services/GuardianService";

export default function GuardianSection({ guardian, hasGuardian, onGuardianRemoved }) {
    const navigate = useNavigate();
    const guardianProfile = guardian?.guardianUser?.profile || {};
    const guardianUser = guardian?.guardianUser || {};

    const handleRemoveGuardian = async () => {
        if (!window.confirm("Are you sure you want to remove your guardian?")) return;

        try {
            await GuardianService.removeGuardian({
                onSuccess: () => {
                    toast.success("Guardian removed successfully");
                    onGuardianRemoved();
                },
                onFailed: () => {
                    toast.error("Failed to remove guardian");
                }
            });
        } catch (err) {
            toast.error("Failed to remove guardian");
        }
    };

    // Get guardian avatar
    let guardianAvatar = null;
    if (guardianProfile.images) {
        try {
            const imgs = typeof guardianProfile.images === "string"
                ? JSON.parse(guardianProfile.images)
                : guardianProfile.images;
            guardianAvatar = Array.isArray(imgs) && imgs[0] ? imgs[0] : null;
        } catch { }
    }

    return (
        <div style={{ backgroundColor: "#fff", padding: 24, marginBottom: 12, borderRadius: 16 }}>
            {/* Section Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Shield style={{ width: 16, height: 16, color: "var(--primary)" }} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--primary)", letterSpacing: "0.3px" }}>
                        GUARDIAN (WALI)
                    </h3>
                </div>
            </div>

            {/* Info Banner */}
            <div style={{
                backgroundColor: "var(--primary-foreground)",
                border: "1px solid var(--primary)",
                borderRadius: 12,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 12,
                color: "var(--primary)",
                lineHeight: 1.5,
                opacity: 0.8
            }}>
                🔒 Guardian details are private and only shared after mutual interest is established.
            </div>

            {hasGuardian ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Guardian Avatar & Name */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        paddingBottom: 12,
                        borderBottom: "1px solid var(--secondary)"
                    }}>
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            backgroundColor: "var(--secondary)",
                            backgroundImage: guardianAvatar ? `url(${guardianAvatar})` : "none",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            border: "2px solid var(--primary)"
                        }}>
                            {!guardianAvatar && <Shield style={{ width: 24, height: 24, color: "var(--primary)" }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--primary)", marginBottom: 2 }}>
                                {guardianProfile.name || guardianUser.email || "Guardian"}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500, opacity: 0.7 }}>
                                {guardian.relationship || "Guardian"}
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    {[
                        { icon: Phone, label: guardianUser.mobile, sub: "Phone" },
                        { icon: Mail, label: guardianUser.email, sub: "Email" },
                    ].filter(row => row.label).map(({ icon: Icon, label, sub }) => (
                        <div key={sub} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                backgroundColor: "var(--secondary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                            }}>
                                <Icon style={{ width: 16, height: 16, color: "var(--primary)" }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 13, color: "var(--primary)", fontWeight: 500 }}>{label}</div>
                                <div style={{ fontSize: 11, color: "var(--primary)", opacity: 0.5 }}>{sub}</div>
                            </div>
                        </div>
                    ))}

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/individual/show-pin')}
                            style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "10px 18px",
                                borderRadius: 10,
                                border: "1.5px solid var(--primary)",
                                background: "white",
                                cursor: "pointer",
                                gap: 8,
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "var(--secondary)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "white";
                            }}
                        >
                            <Edit3 style={{ width: 14, height: 14, color: "var(--primary)" }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>
                                Manage
                            </span>
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={handleRemoveGuardian}
                            style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "10px 18px",
                                borderRadius: 10,
                                border: "1.5px solid #ef4444",
                                background: "white",
                                cursor: "pointer",
                                gap: 8,
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#fef2f2";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "white";
                            }}
                        >
                            <Trash2 style={{ width: 14, height: 14, color: "#ef4444" }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#ef4444" }}>
                                Remove
                            </span>
                        </motion.button>
                    </div>
                </div>
            ) : (
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/individual/show-pin')}
                    style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: "2px solid var(--primary)",
                        background: "white",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--secondary)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Shield style={{ width: 18, height: 18, color: "var(--primary)" }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)" }}>
                            Manage Guardian
                        </span>
                    </div>
                    <ChevronRight style={{ width: 18, height: 18, color: "var(--primary)" }} />
                </motion.button>
            )}
        </div>
    );
}
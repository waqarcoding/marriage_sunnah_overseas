import { useState } from "react";
import { MessageCircle, X, Heart, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

// ── Islamic Chat Consent Dialog (Informational) ──────────────────────────────
function IslamicChatDialog({ isOpen, onClose, profileName }) {
    if (!isOpen) return null;

    const steps = [
        {
            icon: Heart,
            title: "Mutual Interest",
            description: "Both you and the other person need to accept the interest request to move forward.",
            iconBg: "rgba(236, 72, 153, 0.08)",
            iconColor: "#ec4899",
        },
        {
            icon: Shield,
            title: "Guardian Approval",
            description: "Guardian reviews and approves the match to ensure it meets family values and Islamic principles.",
            iconBg: "rgba(27, 77, 62, 0.08)",
            iconColor: "#1B4D3E",
        },
        {
            icon: MessageCircle,
            title: "Halal Communication",
            description: "Once approved, you can start respectful conversations following Islamic guidelines.",
            iconBg: "rgba(16, 185, 129, 0.08)",
            iconColor: "#10b981",
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                    />

                    {/* Dialog - Centered */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                        style={{ pointerEvents: "none" }}
                    >
                        <div
                            style={{
                                width: "100%",
                                maxWidth: "440px",
                                background: "#ffffff",
                                borderRadius: "24px",
                                padding: "28px 24px 24px",
                                boxShadow: "0 20px 60px rgba(27, 77, 62, 0.3)",
                                border: "1px solid rgba(27, 77, 62, 0.08)",
                                position: "relative",
                                pointerEvents: "auto",
                                maxHeight: "90vh",
                                overflowY: "auto"
                            }}
                        >
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                style={{
                                    position: "absolute",
                                    top: "16px",
                                    right: "16px",
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "rgba(27, 77, 62, 0.06)",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    zIndex: 10
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(27, 77, 62, 0.12)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(27, 77, 62, 0.06)"}
                            >
                                <X size={18} color="#1B4D3E" />
                            </button>

                            {/* Islamic Pattern Background */}
                            <div style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                width: "120px",
                                height: "120px",
                                opacity: 0.03,
                                pointerEvents: "none"
                            }}>
                                <svg width="100%" height="100%" viewBox="0 0 100 100">
                                    <defs>
                                        <pattern id="dialog-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                            <circle cx="10" cy="10" r="8" fill="none" stroke="#1B4D3E" strokeWidth="0.5" />
                                            <path d="M10 2 L18 10 L10 18 L2 10 Z" fill="none" stroke="#1B4D3E" strokeWidth="0.5" />
                                        </pattern>
                                    </defs>
                                    <rect width="100" height="100" fill="url(#dialog-pattern)" />
                                </svg>
                            </div>

                            {/* Icon with crescent */}
                            <div style={{
                                display: "flex",
                                justifyContent: "center",
                                marginBottom: "20px",
                                position: "relative"
                            }}>
                                <div style={{
                                    width: "64px",
                                    height: "64px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #1B4D3E 0%, #2d8c6e 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 8px 24px rgba(27, 77, 62, 0.25)",
                                    position: "relative"
                                }}>
                                    <MessageCircle size={28} color="#fef3c7" />
                                    {/* Crescent accent */}
                                    <div style={{
                                        position: "absolute",
                                        bottom: "-2px",
                                        right: "-2px",
                                        width: "20px",
                                        height: "20px",
                                        borderRadius: "50%",
                                        background: "#D4AF37",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
                                    }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#1B4D3E">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.51 5.07-1.39-1.39.09-2.82-.09-4.19-.64-3.49-1.39-5.95-4.66-5.95-8.47 0-2.18.77-4.18 2.05-5.75C7.32 4.2 5.78 3.5 4.07 3.5c-.55 0-1 .45-1 1 0 2.21 1.79 4 4 4 .93 0 1.79-.32 2.47-.85C8.97 9.06 8.5 10.49 8.5 12c0 3.03 1.95 5.61 4.66 6.56 1.37.48 2.82.66 4.26.54C19.58 17.49 21 14.91 21 12c0-4.97-4.03-9-9-9z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Title with gradient */}
                            <h3 style={{
                                margin: "0 0 8px 0",
                                fontSize: "20px",
                                fontWeight: "700",
                                textAlign: "center",
                                background: "linear-gradient(135deg, #1B4D3E 0%, #2d8c6e 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                letterSpacing: "-0.02em"
                            }}>
                                Halal Connection Process
                            </h3>

                            {/* Arabic greeting */}
                            <p style={{
                                margin: "0 0 20px 0",
                                fontSize: "13px",
                                textAlign: "center",
                                color: "rgba(107, 114, 128, 0.8)",
                                fontWeight: "500"
                            }}>
                                Following Islamic guidelines for respectful connections
                            </p>

                            {/* Steps */}
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "16px",
                                marginBottom: "24px"
                            }}>
                                {steps.map((step, index) => (
                                    <StepItem
                                        key={index}
                                        icon={step.icon}
                                        title={step.title}
                                        description={step.description}
                                        iconBg={step.iconBg}
                                        iconColor={step.iconColor}
                                        stepNumber={index + 1}
                                        isLast={index === steps.length - 1}
                                    />
                                ))}
                            </div>

                            {/* Info note */}
                            <div style={{
                                padding: "14px 16px",
                                borderRadius: "12px",
                                background: "rgba(27, 77, 62, 0.04)",
                                border: "1px solid rgba(27, 77, 62, 0.08)",
                                marginBottom: "20px"
                            }}>
                                <p style={{
                                    margin: 0,
                                    fontSize: "13px",
                                    lineHeight: "1.6",
                                    color: "#4b5563",
                                    textAlign: "center"
                                }}>
                                    <strong style={{ color: "#1B4D3E" }}>{profileName}</strong> follows these guidelines to ensure all connections are respectful and halal.
                                </p>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    borderRadius: "12px",
                                    border: "none",
                                    background: "linear-gradient(135deg, #1B4D3E 0%, #2d8c6e 100%)",
                                    color: "#fef3c7",
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    boxShadow: "0 4px 12px rgba(27, 77, 62, 0.25)"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(27, 77, 62, 0.35)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(27, 77, 62, 0.25)";
                                }}
                            >
                                Got it
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ── Step Item ──────────────────────────────────────────────────────────────
function StepItem({ icon: Icon, title, description, iconBg, iconColor, stepNumber, isLast }) {
    return (
        <div style={{
            display: "flex",
            gap: "14px",
            position: "relative"
        }}>
            {/* Step indicator with line */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative"
            }}>
                <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: iconBg,
                    border: `2px solid ${iconColor}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    position: "relative",
                    zIndex: 1
                }}>
                    <Icon size={22} color={iconColor} />
                    {/* Step number badge */}
                    <div style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-6px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: iconColor,
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)"
                    }}>
                        {stepNumber}
                    </div>
                </div>
                {/* Connecting line */}
                {!isLast && (
                    <div style={{
                        width: "2px",
                        flex: 1,
                        minHeight: "20px",
                        background: `linear-gradient(to bottom, ${iconColor}30, transparent)`,
                        marginTop: "4px"
                    }} />
                )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingTop: "4px" }}>
                <h4 style={{
                    margin: "0 0 4px 0",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#1f2937"
                }}>
                    {title}
                </h4>
                <p style={{
                    margin: 0,
                    fontSize: "13px",
                    lineHeight: "1.5",
                    color: "#6b7280"
                }}>
                    {description}
                </p>
            </div>
        </div>
    );
}

export default IslamicChatDialog;
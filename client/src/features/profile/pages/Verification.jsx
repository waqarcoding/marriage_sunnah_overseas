import { useState, useEffect } from "react";
import ProfileService from "../api/ProfileService";

const PRIMARY = "#1B4D3E";
const PRIMARY_FG = "#f5f0e8";
const SECONDARY = "#f0f5f3";
const ACCENT = "#f5f0e8";

const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@400;500&display=swap');
  @keyframes badgePop {
    0%   { transform: scale(0.4) rotate(-12deg); opacity: 0; }
    60%  { transform: scale(1.15) rotate(3deg);  opacity: 1; }
    80%  { transform: scale(0.95) rotate(-1deg); }
    100% { transform: scale(1)    rotate(0deg);  opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes ringPulse {
    0%   { transform: scale(1);   opacity: 0.5; }
    70%  { transform: scale(2);   opacity: 0;   }
    100% { transform: scale(2);   opacity: 0;   }
  }
  @keyframes checkDraw {
    from { stroke-dashoffset: 40; }
    to   { stroke-dashoffset: 0;  }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes floatBadge {
    0%, 100% { transform: translateY(0px);  }
    50%       { transform: translateY(-5px); }
  }
  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0) rotate(0deg);   }
    50%       { opacity: 1; transform: scale(1) rotate(180deg); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
`;

function Sparkle({ x, y, delay, size = 6 }) {
    return (
        <div style={{ position: "absolute", left: x, top: y, width: size, height: size, pointerEvents: "none", animation: `sparkle 1.6s ease-in-out ${delay}s infinite`, opacity: 0 }}>
            <svg viewBox="0 0 10 10" width={size} height={size}>
                <path d="M5 0 L5.6 4.4 L10 5 L5.6 5.6 L5 10 L4.4 5.6 L0 5 L4.4 4.4 Z" fill={PRIMARY} opacity="0.65" />
            </svg>
        </div>
    );
}

function BadgeIcon({ size = 28, animated = false }) {
    return (
        <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={animated ? { animation: "floatBadge 3s ease-in-out infinite" } : {}}>
            <path d="M14 2L16.5 4.8L20.2 4L21.2 7.6L24.6 9.2L23.2 12.6L25 15.8L22.4 18L22 21.8L18.2 22.2L16 25.2L12.8 23.8L9.6 25.2L7.4 22.2L3.6 21.8L3.2 18L0.6 15.8L2.4 12.6L1 9.2L4.4 7.6L5.4 4L9.1 4.8L12 2L14 2Z" fill={PRIMARY} />
            <path d="M14 4.5L16 6.8L19.2 6.2L20 9.3L22.8 10.6L21.6 13.6L23.2 16.2L21 18.1L20.6 21.3L17.4 21.6L15.6 24.1L13 22.9L10.4 24.1L8.6 21.6L5.4 21.3L5 18.1L2.8 16.2L4.4 13.6L3.2 10.6L6 9.3L6.8 6.2L10 6.8L14 4.5Z" fill="#2d7a5e" />
            <path d="M9 14.5 L12.5 18 L19 11" stroke={PRIMARY_FG} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" strokeDashoffset="0" style={animated ? { animation: "checkDraw 0.6s ease-out 0.3s both" } : {}} />
        </svg>
    );
}

function VerifiedPill() {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: SECONDARY, border: `1px solid ${PRIMARY}28`, borderRadius: 20, padding: "3px 10px 3px 6px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, color: PRIMARY }}>
            <BadgeIcon size={14} /> Verified
        </span>
    );
}

function UploadCard({ side, icon, sub, onFile, preview, uploaded }) {
    return (
        <div onClick={() => !uploaded && document.getElementById(`input-${side}`).click()} style={{ background: uploaded ? SECONDARY : "#fff", border: `1.5px dashed ${uploaded ? PRIMARY : "#b6cfc9"}`, borderRadius: 14, padding: "1.25rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", minHeight: 164, justifyContent: "center", position: "relative", transition: "all 0.2s" }}>
            <input id={`input-${side}`} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
            {uploaded && preview ? (
                <>
                    <img src={preview} alt={side} style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8 }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: PRIMARY }}>{side === "front" ? "Front side" : "Back side"}</span>
                    <div style={{ position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: "50%", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 13 9 17 19 7" /></svg>
                    </div>
                </>
            ) : (
                <>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: SECONDARY, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: PRIMARY, textAlign: "center" }}>{side === "front" ? "Front side" : "Back side"}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", lineHeight: 1.5 }}>{sub}</div>
                </>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE 1 — Submit for verification
// ════════════════════════════════════════════════════════════════════════════
function SubmitVerificationPage({ onSubmit, onSkip }) {
    const [front, setFront] = useState(null);
    const [back, setBack] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleFile = (side) => (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => side === "front" ? setFront(ev.target.result) : setBack(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        ProfileService.uploadIdCard(front, back);
        setSubmitting(true);
        setTimeout(() => onSubmit(), 1400);
    };

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem 3rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: SECONDARY, color: PRIMARY, fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 20, marginBottom: "1.25rem" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: PRIMARY }} /> Identity Verification
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: PRIMARY, marginBottom: 8, lineHeight: 1.25 }}>Verify your identity</h1>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.65, marginBottom: "2rem" }}>Upload a clear photo of your government-issued ID. Your information is encrypted and kept private.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: "1.5rem" }}>
                <UploadCard side="front" uploaded={!!front} preview={front} onFile={handleFile("front")} sub={"National ID, passport\nor driving licence"} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="2" /><line x1="7" y1="10" x2="17" y2="10" /><line x1="7" y1="14" x2="13" y2="14" /></svg>} />
                <UploadCard side="back" uploaded={!!back} preview={back} onFile={handleFile("back")} sub={"Clear photo,\nall corners visible"} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="2" /><line x1="7" y1="10" x2="12" y2="10" /><circle cx="16" cy="12" r="2.5" /></svg>} />
            </div>
            <div style={{ background: ACCENT, borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.75rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="0.5" fill={PRIMARY} /></svg>
                <p style={{ fontSize: 13, color: PRIMARY, lineHeight: 1.55 }}><strong style={{ fontWeight: 500 }}>Tips for a clear photo:</strong> Ensure all four corners are visible, no glare or blur, and the text is fully readable.</p>
            </div>
            <button disabled={!front || !back || submitting} onClick={handleSubmit} style={{ width: "100%", background: !front || !back || submitting ? "#9ca3af" : PRIMARY, color: PRIMARY_FG, border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: !front || !back || submitting ? "not-allowed" : "pointer", marginBottom: 10, transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {submitting ? (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>Submitting…</>) : "Submit for verification"}
            </button>
            <div style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>or</div>
            <button
                onClick={onSkip}
                style={{
                    width: "100%",
                    background: "transparent",
                    color: "#6b7280",
                    border: "1.5px solid #d1d5db",
                    borderRadius: 10,
                    padding: "13px",
                    fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: "pointer"
                }}
                onMouseEnter={e => {
                    const target = e.currentTarget;
                    target.style.borderColor = PRIMARY;
                    target.style.color = PRIMARY;
                }}
                onMouseLeave={e => {
                    const target = e.currentTarget;
                    target.style.borderColor = "#d1d5db";
                    target.style.color = "#6b7280";
                }}
            >

                Skip for now — verify later
            </button>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE 2 — Pending review
// ════════════════════════════════════════════════════════════════════════════
function PendingPage({ frontId, backId }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

    const steps = [
        { label: "Documents submitted", done: true },
        { label: "Under review", done: false, active: true },
        { label: "Verification complete", done: false },
    ];

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem 3rem" }}>

            {/* Header */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fef9ec", color: "#92650a", fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 20, marginBottom: "1.25rem", border: "1px solid #f5d97a40" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f0b429", animation: "pulse 1.5s ease-in-out infinite" }} /> Under Review
            </div>

            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: PRIMARY, marginBottom: 8 }}>Verification pending</h1>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.65, marginBottom: "2rem" }}>Your documents have been submitted. Our team typically reviews submissions within 24–48 hours.</p>

            {/* Progress steps */}
            <div style={{ background: "#fff", border: `1px solid ${PRIMARY}18`, borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem", boxShadow: `0 2px 12px ${PRIMARY}08` }}>
                {steps.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, marginBottom: i < steps.length - 1 ? 0 : undefined }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: step.done ? PRIMARY : step.active ? "#fef9ec" : SECONDARY, border: step.active ? "2px solid #f0b429" : "none" }}>
                                {step.done ? (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="5 13 9 17 19 7" /></svg>
                                ) : step.active ? (
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f0b429", animation: "pulse 1.5s ease-in-out infinite" }} />
                                ) : (
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#d1d5db" }} />
                                )}
                            </div>
                            {i < steps.length - 1 && <div style={{ width: 2, height: 32, background: step.done ? PRIMARY : "#e5e7eb", margin: "4px 0" }} />}
                        </div>
                        <div style={{ paddingTop: 4, paddingBottom: i < steps.length - 1 ? 32 : 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: step.done ? PRIMARY : step.active ? "#92650a" : "#9ca3af" }}>{step.label}</div>
                            {step.active && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Usually takes 24–48 hours</div>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Submitted ID previews */}
            <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, letterSpacing: "0.06em", marginBottom: 10 }}>SUBMITTED DOCUMENTS</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: "1.5rem" }}>
                {[{ label: "Front side", path: frontId }, { label: "Back side", path: backId }].map((doc, i) => (
                    <div key={i} style={{ background: SECONDARY, border: `1px solid ${PRIMARY}18`, borderRadius: 12, overflow: "hidden" }}>
                        <img
                            // @ts-ignore
                            src={`${import.meta.env.VITE_BASE_URL?.replace('/api', '')}${doc.path}`}

                            alt={doc.label}
                            style={{ width: "100%", height: 90, objectFit: "cover" }}
                            onError={e => {
                                // Fix: e.target could be an EventTarget, so cast to HTMLImageElement
                                if (e && e.target && e.target instanceof window.HTMLImageElement) {
                                    e.target.style.display = "none";
                                }
                            }}
                        />

                        <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12, color: PRIMARY, fontWeight: 500 }}>{doc.label}</span>
                            <span style={{ fontSize: 10, color: "#f0b429", fontWeight: 500, background: "#fef9ec", padding: "2px 7px", borderRadius: 10 }}>Pending</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info box */}
            <div style={{ background: "#fef9ec", border: "1px solid #f5d97a40", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92650a" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="0.5" fill="#92650a" /></svg>
                <p style={{ fontSize: 13, color: "#92650a", lineHeight: 1.55 }}>You will be notified once your identity has been reviewed. You can continue using the app in the meantime.</p>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE 3 — Already verified
// ════════════════════════════════════════════════════════════════════════════
function VerifiedPage({ name = "Fatima" }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

    const sparkles = [
        { x: "8%", y: "12%", delay: 0.1, size: 7 }, { x: "82%", y: "8%", delay: 0.4, size: 5 },
        { x: "90%", y: "52%", delay: 0.2, size: 8 }, { x: "4%", y: "58%", delay: 0.6, size: 5 },
        { x: "48%", y: "4%", delay: 0.3, size: 6 }, { x: "72%", y: "78%", delay: 0.5, size: 5 },
        { x: "18%", y: "82%", delay: 0.7, size: 7 },
    ];

    const perks = [
        { label: "Verified badge on profile" }, { label: "Higher match visibility" },
        { label: "Trusted by families" }, { label: "Priority in searches" },
    ];

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem 3rem" }}>
            <div style={{ position: "relative", background: ACCENT, border: `1.5px solid ${PRIMARY}22`, borderRadius: 20, padding: "2.5rem 1.75rem", textAlign: "center", overflow: "hidden", marginBottom: "1.5rem" }}>
                {sparkles.map((s, i) => <Sparkle key={i} {...s} />)}
                {visible && [0, 0.5].map((delay, i) => (
                    <div key={i} style={{ position: "absolute", top: "28%", left: "50%", transform: "translate(-50%, -50%)", width: 80, height: 80, borderRadius: "50%", border: `2px solid ${PRIMARY}`, animation: `ringPulse 2s ease-out ${delay}s infinite`, pointerEvents: "none" }} />
                ))}
                <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "1.25rem", animation: visible ? "badgePop 0.7s cubic-bezier(.36,.07,.19,.97) both" : "none" }}>
                    <BadgeIcon size={72} animated={visible} />
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 600, background: `linear-gradient(90deg, ${PRIMARY} 0%, #2d7a5e 40%, #78c4a0 60%, ${PRIMARY} 100%)`, backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 2.5s linear infinite", marginBottom: 8, display: "block" }}>
                    Identity Verified
                </div>
                <p style={{ fontSize: 15, color: PRIMARY, fontWeight: 500, marginBottom: 6, animation: visible ? "fadeUp 0.5s ease 0.5s both" : "none", opacity: visible ? undefined : 0 }}>Your account is verified, {name}</p>
                <p style={{ fontSize: 13, color: "#5a7a6e", lineHeight: 1.65, animation: visible ? "fadeUp 0.5s ease 0.7s both" : "none", opacity: visible ? undefined : 0 }}>Your identity has been confirmed. Your profile now displays the verified badge, building trust with potential matches.</p>
            </div>

            <div style={{ background: "#fff", border: `1px solid ${PRIMARY}18`, borderRadius: 14, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 14, marginBottom: "1.5rem", animation: visible ? "fadeUp 0.5s ease 0.8s both" : "none", opacity: visible ? undefined : 0, boxShadow: `0 2px 12px ${PRIMARY}0a` }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${SECONDARY}, ${ACCENT})`, border: `2px solid ${PRIMARY}22`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: PRIMARY, position: "relative" }}>
                    {name.charAt(0)}
                    <div style={{ position: "absolute", bottom: -2, right: -2, background: "#fff", borderRadius: "50%", padding: 1 }}><BadgeIcon size={16} /></div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{name}</span>
                        <VerifiedPill />
                    </div>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>This is how others see your profile</span>
                </div>
            </div>

            <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, letterSpacing: "0.06em", marginBottom: 10, animation: visible ? "fadeUp 0.5s ease 0.9s both" : "none", opacity: visible ? undefined : 0 }}>WHAT YOU UNLOCKED</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.75rem", animation: visible ? "fadeUp 0.5s ease 1s both" : "none", opacity: visible ? undefined : 0 }}>
                {perks.map((p, i) => (
                    <div key={i} style={{ background: "#fff", border: `1px solid ${PRIMARY}18`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: SECONDARY, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 13 9 17 19 7" /></svg>
                        </div>
                        <span style={{ fontSize: 12, color: PRIMARY, fontWeight: 500, lineHeight: 1.4 }}>{p.label}</span>
                    </div>
                ))}
            </div>

            <button
                type="button"
                style={{
                    width: "100%",
                    background: PRIMARY,
                    color: PRIMARY_FG,
                    border: "none",
                    borderRadius: 10,
                    padding: "14px",
                    fontSize: 15,
                    fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: "pointer",
                    animation: visible ? "fadeUp 0.5s ease 1.1s both" : "none",
                    opacity: visible ? undefined : 0,
                }}
                onClick={() => window.history.length > 1 ? window.history.back() : window.close()}
            >

                View my profile
            </button>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT — loads profile and switches between pages
// ════════════════════════════════════════════════════════════════════════════
export default function VerificationPage({ onSubmit, onSkip }) {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("submit"); // "submit" | "pending" | "verified"
    const [frontId, setFrontId] = useState(null);
    const [backId, setBackId] = useState(null);
    const [userName, setUserName] = useState("User");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await ProfileService.getMyProfile();
                const data = res;

                const isVerified = data.is_verified === true || data.is_verified === 1;
                const hasFront = !!data.profile?.front_id;
                const hasBack = !!data.profile?.back_id;
                const name = data.profile?.name || "User";

                setUserName(name);
                setFrontId(data.profile?.front_id);
                setBackId(data.profile?.back_id);

                if (isVerified) {
                    setStatus("verified");
                } else if (hasFront && hasBack) {
                    setStatus("pending");
                } else {
                    setStatus("submit");
                }
            } catch (err) {
                console.error("Failed to load profile:", err);
                setStatus("submit");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleSubmit = () => {
        setStatus("pending");
        onSubmit?.();
    };

    const handleSkip = () => {
        onSkip?.();
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span style={{ fontSize: 14, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>Loading your profile…</span>
            </div>
        );
    }

    return (
        <>
            <style>{KEYFRAMES}</style>
            {status === "verified" && <VerifiedPage name={userName} />}
            {status === "pending" && <PendingPage frontId={frontId} backId={backId} />}
            {status === "submit" && <SubmitVerificationPage onSubmit={handleSubmit} onSkip={handleSkip} />}
        </>
    );
}
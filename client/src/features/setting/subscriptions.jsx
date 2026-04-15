import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Check, Crown, Zap, Eye, MessageCircle, Star, Heart, Shield, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ── Animated canvas background ──────────────────────────────────────────────
function ForestBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animId;
        let W, H;

        const particles = Array.from({ length: 60 }, () => ({
            x: Math.random(),
            y: Math.random(),
            r: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.0003,
            vy: (Math.random() - 0.5) * 0.0003,
            alpha: Math.random() * 0.5 + 0.2,
        }));

        const blobs = [
            { x: 0.15, y: 0.2, r: 0.38, color: "#064e3b" },
            { x: 0.75, y: 0.15, r: 0.32, color: "#065f46" },
            { x: 0.5, y: 0.6, r: 0.42, color: "#047857" },
            { x: 0.1, y: 0.75, r: 0.28, color: "#059669" },
            { x: 0.85, y: 0.7, r: 0.35, color: "#064e3b" },
        ];

        let blobAngles = blobs.map(() => Math.random() * Math.PI * 2);

        const resize = () => {
            W = canvas.width = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const draw = (t) => {
            ctx.clearRect(0, 0, W, H);

            // base
            ctx.fillStyle = "#021a0e";
            ctx.fillRect(0, 0, W, H);

            // animated blobs
            blobs.forEach((b, i) => {
                blobAngles[i] += 0.003;
                const ox = Math.cos(blobAngles[i]) * 0.06;
                const oy = Math.sin(blobAngles[i] * 0.7) * 0.05;
                const gx = (b.x + ox) * W;
                const gy = (b.y + oy) * H;
                const gr = Math.min(W, H) * b.r;

                const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
                grad.addColorStop(0, b.color + "cc");
                grad.addColorStop(1, b.color + "00");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(gx, gy, gr, 0, Math.PI * 2);
                ctx.fill();
            });

            // noise grid overlay
            ctx.fillStyle = "rgba(0,20,10,0.18)";
            ctx.fillRect(0, 0, W, H);

            // particles (firefly-like)
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = 1;
                if (p.x > 1) p.x = 0;
                if (p.y < 0) p.y = 1;
                if (p.y > 1) p.y = 0;

                const px = p.x * W, py = p.y * H;
                const flicker = 0.6 + 0.4 * Math.sin(t * 0.002 + px);
                ctx.beginPath();
                ctx.arc(px, py, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(52,211,153,${p.alpha * flicker})`;
                ctx.fill();
            });

            animId = requestAnimationFrame(draw);
        };

        animId = requestAnimationFrame(draw);
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full"
            style={{ zIndex: 0 }}
        />
    );
}

// ── Data ─────────────────────────────────────────────────────────────────────
const plans = [
    {
        id: "weekly",
        label: "Weekly",
        price: "$4.99",
        per: "/ week",
        total: "Billed $4.99 weekly",
        popular: false,
    },
    {
        id: "monthly",
        label: "Monthly",
        price: "$12.99",
        per: "/ month",
        total: "Billed $12.99 monthly",
        popular: true,
    },
    {
        id: "yearly",
        label: "Yearly",
        price: "$5.99",
        per: "/ month",
        total: "Billed $71.88 yearly · Save 54%",
        popular: false,
        badge: "Best Value",
    },
];

const features = [
    { icon: Eye, label: "See who liked you", desc: "View all profiles that liked you" },
    { icon: Heart, label: "Unlimited likes", desc: "Like as many profiles as you want" },
    { icon: Star, label: "5 Super Likes per day", desc: "Stand out from the crowd" },
    { icon: MessageCircle, label: "Message before matching", desc: "Start conversations instantly" },
    { icon: Zap, label: "Priority in search", desc: "Be seen by more people" },
    { icon: Crown, label: "Premium badge", desc: "Show off your premium status" },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState("monthly");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => navigate(-1), 1200);
        }, 1600);
    };

    const selectedPlan = plans.find((p) => p.id === selected);

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>

            {/* Google Font */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');`}</style>

            <ForestBackground />

            {/* Vignette */}
            <div className="fixed inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(2,10,6,0.7) 100%)", zIndex: 1 }} />

            {/* ── Header ── */}
            <div className="relative z-10 flex items-center gap-3 px-5 py-4"
                style={{ background: "rgba(2,20,10,0.6)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(52,211,153,0.12)" }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}
                >
                    <ChevronLeft size={18} color="#34d399" />
                </motion.button>
                <span className="text-base font-semibold" style={{ color: "#d1fae5", fontFamily: "'Syne', sans-serif" }}>
                    Premium Access
                </span>
                <div className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
                    <Shield size={11} color="#34d399" />
                    <span className="text-xs" style={{ color: "#34d399" }}>Secured</span>
                </div>
            </div>

            {/* ── Scrollable body ── */}
            <div className="relative z-10 flex-1 overflow-y-auto pb-40">

                {/* Hero — couple image */}
                <div className="relative w-full overflow-hidden" style={{ height: 320 }}>

                    {/* Couple photo */}
                    <motion.img
                        src="/couple-hero.png"
                        alt="couple"
                        initial={{ scale: 1.08, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                        style={{ mixBlendMode: "luminosity", opacity: 0.55 }}
                    />

                    {/* Green tint wash */}
                    <div className="absolute inset-0"
                        style={{ background: "linear-gradient(160deg, rgba(6,95,70,0.55) 0%, rgba(2,26,14,0.3) 50%, transparent 100%)" }} />

                    {/* Bottom fade into page bg */}
                    <div className="absolute inset-x-0 bottom-0 h-28"
                        style={{ background: "linear-gradient(to top, #021a0e, transparent)" }} />

                    {/* Top fade */}
                    <div className="absolute inset-x-0 top-0 h-16"
                        style={{ background: "linear-gradient(to bottom, rgba(2,16,10,0.6), transparent)" }} />

                    {/* Text overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-6 text-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.2 }}
                            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
                            style={{
                                background: "linear-gradient(135deg, #065f46, #34d399)",
                                boxShadow: "0 0 28px rgba(52,211,153,0.5)",
                            }}
                        >
                            <Crown size={22} color="#021a0e" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{ fontFamily: "'Syne', sans-serif", color: "#ecfdf5", lineHeight: 1.1 }}
                            className="text-3xl font-extrabold mb-1.5"
                        >
                            Unlock All{" "}
                            <span style={{ color: "#34d399" }}>Likes</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-xs leading-relaxed"
                            style={{ color: "#a7f3d0" }}
                        >
                            See everyone who liked you and match instantly with Premium.
                        </motion.p>

                        {/* Pulsing CTA hero button */}
                        <motion.button
                            animate={{
                                scale: [1, 1.04, 1],
                                boxShadow: [
                                    "0 0 16px rgba(52,211,153,0.3)",
                                    "0 0 36px rgba(52,211,153,0.65)",
                                    "0 0 16px rgba(52,211,153,0.3)",
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubscribe}
                            className="mt-4 flex items-center gap-2 px-7 py-2.5 rounded-full font-bold text-sm"
                            style={{
                                background: "#ffffff",
                                color: "#065f46",
                                fontFamily: "'Syne', sans-serif",
                            }}
                        >
                            <Sparkles size={14} />
                            Upgrade to Premium
                        </motion.button>
                    </div>
                </div>

                {/* Features card */}
                <div className="px-4 mb-5">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-3xl p-5"
                        style={{
                            background: "rgba(6,40,24,0.7)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(52,211,153,0.15)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                        }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(#34d399, #059669)" }} />
                            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#6ee7b7" }}>
                                What's included
                            </span>
                        </div>

                        <div className="space-y-3.5">
                            {features.map(({ icon: Icon, label, desc }, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.35 + i * 0.07 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
                                        <Icon size={15} color="#34d399" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold" style={{ color: "#d1fae5" }}>{label}</div>
                                        <div className="text-xs truncate" style={{ color: "#6ee7b7", opacity: 0.7 }}>{desc}</div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: "rgba(52,211,153,0.15)" }}>
                                        <Check size={11} color="#34d399" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Plans */}
                <div className="px-4">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(#34d399, #059669)" }} />
                        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#6ee7b7" }}>
                            Choose a plan
                        </span>
                    </div>

                    <div className="space-y-3">
                        {plans.map((plan, i) => {
                            const isSelected = selected === plan.id;
                            return (
                                <motion.button
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.08 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelected(plan.id)}
                                    className="w-full rounded-2xl p-4 text-left relative"
                                    style={{
                                        background: isSelected
                                            ? "linear-gradient(135deg, #059669, #34d399)"
                                            : "#ffffff",
                                        border: isSelected
                                            ? "1.5px solid transparent"
                                            : "1.5px solid rgba(52,211,153,0.2)",
                                        backdropFilter: "blur(16px)",
                                        boxShadow: isSelected ? "0 0 24px rgba(52,211,153,0.25)" : "0 2px 8px rgba(0,0,0,0.15)",
                                        transition: "all 0.25s ease",
                                    }}
                                >
                                    {/* Badge */}
                                    {(plan.popular || plan.badge) && (
                                        <div className="absolute -top-2.5 left-4 px-3 py-0.5 rounded-full text-xs font-bold"
                                            style={{
                                                background: "linear-gradient(90deg, #059669, #34d399)",
                                                color: "#021a0e",
                                                fontFamily: "'Syne', sans-serif",
                                            }}>
                                            {plan.badge || "Most Popular"}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pr-8">
                                        <div>
                                            <div className="font-bold text-sm" style={{ color: isSelected ? "#ecfdf5" : "#065f46", fontFamily: "'Syne', sans-serif" }}>
                                                {plan.label}
                                            </div>
                                            <div className="text-xs mt-0.5" style={{ color: isSelected ? "rgba(236,253,245,0.7)" : "rgba(6,95,70,0.5)" }}>
                                                {plan.total}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-extrabold" style={{ color: isSelected ? "#ecfdf5" : "#021a0e", fontFamily: "'Syne', sans-serif" }}>
                                                {plan.price}
                                            </span>
                                            <span className="text-xs ml-1" style={{ color: isSelected ? "rgba(236,253,245,0.6)" : "rgba(6,95,70,0.5)" }}>
                                                {plan.per}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Radio dot */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                                        style={{
                                            background: isSelected ? "#ffffff" : "transparent",
                                            border: isSelected ? "none" : "1.5px solid rgba(6,95,70,0.3)",
                                            transition: "all 0.2s",
                                        }}>
                                        {isSelected && <Check size={11} color="#059669" strokeWidth={3} />}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    <p className="text-center text-xs mt-5 px-4" style={{ color: "rgba(110,231,183,0.4)", lineHeight: 1.7 }}>
                        Cancel anytime. Renews automatically unless cancelled 24 hours before renewal date.
                    </p>
                </div>
            </div>

            {/* ── Fixed CTA ── */}
            <div className="fixed bottom-0 left-0 right-0 z-20 px-5 py-4"
                style={{ background: "rgba(2,16,10,0.85)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(52,211,153,0.1)" }}>

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
                            style={{ background: "linear-gradient(135deg,#059669,#34d399)" }}
                        >
                            <Check size={18} color="#021a0e" strokeWidth={3} />
                            <span className="font-bold text-sm" style={{ color: "#021a0e", fontFamily: "'Syne', sans-serif" }}>
                                You're Premium!
                            </span>
                        </motion.div>
                    ) : (
                        <motion.button
                            key="cta"
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 relative overflow-hidden"
                            style={{
                                background: "#ffffff",
                                fontFamily: "'Syne', sans-serif",
                                boxShadow: "0 4px 24px rgba(52,211,153,0.2)",
                                opacity: loading ? 0.75 : 1,
                            }}
                        >
                            {loading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 rounded-full border-2"
                                        style={{ borderColor: "rgba(6,95,70,0.2)", borderTopColor: "#059669" }}
                                    />
                                    <span className="font-bold text-sm" style={{ color: "#065f46" }}>Processing…</span>
                                </>
                            ) : (
                                <>
                                    <Crown size={16} color="#059669" />
                                    <span className="font-bold text-sm" style={{ color: "#065f46" }}>
                                        Continue with {selectedPlan?.label} · {selectedPlan?.price}
                                    </span>
                                </>
                            )}
                        </motion.button>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-center gap-1.5 mt-2">
                    <Shield size={11} color="rgba(110,231,183,0.4)" />
                    <p className="text-xs" style={{ color: "rgba(110,231,183,0.4)" }}>
                        Secure payment · Powered by Stripe
                    </p>
                </div>
            </div>

            {/* gradient animation keyframe */}
            <style>{`
                @keyframes gradientShift {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
}
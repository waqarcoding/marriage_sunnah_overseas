import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Crown, Sparkles } from "lucide-react";

// ── Mini animated canvas for the banner bg ───────────────────────────────────
function BannerCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let animId;
        let W, H;

        const blobs = [
            { x: 0.1, y: 0.5, r: 0.7, color: "#064e3b", angle: 0, speed: 0.004 },
            { x: 0.75, y: 0.3, r: 0.6, color: "#047857", angle: 1.5, speed: 0.003 },
            { x: 0.5, y: 0.8, r: 0.5, color: "#059669", angle: 3.1, speed: 0.005 },
        ];

        const particles = Array.from({ length: 28 }, () => ({
            x: Math.random(),
            y: Math.random(),
            r: Math.random() * 1.2 + 0.4,
            vx: (Math.random() - 0.5) * 0.0004,
            vy: (Math.random() - 0.5) * 0.0004,
            alpha: Math.random() * 0.6 + 0.2,
        }));

        const resize = () => {
            W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            canvas.style.width = canvas.offsetWidth + 'px';
            canvas.style.height = canvas.offsetHeight + 'px';
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resize();
        window.addEventListener("resize", resize);

        const draw = (t) => {
            ctx.clearRect(0, 0, W, H);

            // Base dark green background
            ctx.fillStyle = "#021a0e";
            ctx.fillRect(0, 0, W, H);

            // Animated blobs
            blobs.forEach((b) => {
                b.angle += b.speed;
                const ox = Math.cos(b.angle) * 0.08;
                const oy = Math.sin(b.angle * 0.8) * 0.06;
                const gx = (b.x + ox) * W / window.devicePixelRatio;
                const gy = (b.y + oy) * H / window.devicePixelRatio;
                const gr = Math.min(W, H) * b.r / window.devicePixelRatio;
                const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
                grad.addColorStop(0, b.color + "dd");
                grad.addColorStop(1, b.color + "00");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(gx, gy, gr, 0, Math.PI * 2);
                ctx.fill();
            });

            // Dark overlay for depth
            ctx.fillStyle = "rgba(2,16,10,0.2)";
            ctx.fillRect(0, 0, W, H);

            // Fireflies/particles
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = 1;
                if (p.x > 1) p.x = 0;
                if (p.y < 0) p.y = 1;
                if (p.y > 1) p.y = 0;
                const flicker = 0.5 + 0.5 * Math.sin(t * 0.0025 + p.x * 10);
                ctx.beginPath();
                ctx.arc(
                    p.x * W / window.devicePixelRatio,
                    p.y * H / window.devicePixelRatio,
                    p.r,
                    0,
                    Math.PI * 2
                );
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

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

// ── Banner Component ──────────────────────────────────────────────────────────
export default function PremiumBanner({ onUpgrade }) {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
                @keyframes shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
                @keyframes floatUp {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-5px); }
                }
            `}</style>

            <div
                className="relative overflow-hidden rounded-3xl w-full mx-auto"
                style={{
                    maxWidth: `calc(100vw - 32px)`,
                    margin: "24px 16px",
                    fontFamily: "'DM Sans', sans-serif",
                    minHeight: 220,
                    background: "#021a0e",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(52,211,153,0.1)",
                }}
            >
                {/* Animated canvas bg */}
                <BannerCanvas />

                {/* Couple image with green blend */}
                <div
                    className="absolute inset-0"
                    style={{ zIndex: 1 }}
                >
                    <img
                        src="/couple-hero.png"
                        alt=""
                        className="absolute right-0 bottom-0 h-full object-cover object-top"
                        style={{
                            width: "55%",
                            maskImage: "linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 85%)",
                            WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 85%)",
                            opacity: 0.35,
                        }}
                    />
                    {/* Right edge fade */}
                    <div
                        className="absolute inset-y-0 right-0 w-1/3"
                        style={{
                            background: "linear-gradient(to left, rgba(2,26,14,0.9), transparent)",
                            pointerEvents: "none"
                        }}
                    />
                </div>

                {/* Glowing border ring */}
                <div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{
                        boxShadow: "inset 0 0 40px rgba(52,211,153,0.08), inset 0 0 1px rgba(52,211,153,0.2)",
                        zIndex: 2
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center h-full px-6 py-7">

                    {/* Crown icon */}
                    <motion.div
                        className="inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-4"
                        style={{
                            background: "linear-gradient(135deg, #065f46, #34d399)",
                            boxShadow: "0 0 24px rgba(52,211,153,0.45)",
                            animation: "floatUp 3s ease-in-out infinite",
                        }}
                    >
                        <Crown size={20} color="#021a0e" strokeWidth={2.5} />
                    </motion.div>

                    {/* Heading */}
                    <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl font-extrabold mb-1.5 leading-tight"
                        style={{ fontFamily: "'Syne', sans-serif", color: "#ecfdf5" }}
                    >
                        Unlock All{" "}
                        <span
                            style={{
                                background: "linear-gradient(90deg, #34d399, #a7f3d0, #34d399)",
                                backgroundSize: "200% auto",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                animation: "shimmer 3s linear infinite",
                            }}
                        >
                            Likes
                        </span>
                    </motion.h3>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs leading-relaxed mb-5 max-w-[200px]"
                        style={{ color: "#6ee7b7" }}
                    >
                        See everyone who likes you and match instantly with Premium.
                    </motion.p>

                    {/* CTA Button */}
                    <motion.button
                        animate={{
                            scale: [1, 1.03, 1],
                            boxShadow: [
                                "0 0 14px rgba(52,211,153,0.3)",
                                "0 0 30px rgba(52,211,153,0.65)",
                                "0 0 14px rgba(52,211,153,0.3)",
                            ],
                        }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onUpgrade}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm w-fit"
                        style={{
                            background: "#ffffff",
                            color: "#065f46",
                            fontFamily: "'Syne', sans-serif",
                        }}
                    >
                        <Sparkles size={13} strokeWidth={2.5} />
                        Upgrade to Premium
                    </motion.button>
                </div>
            </div>
        </>
    );
}
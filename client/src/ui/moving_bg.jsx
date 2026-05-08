// components/AnimatedBackground.jsx
import { useEffect, useRef } from "react";
const BLOBS = [
    { color: "#ef4444", size: 500, x: 10, y: 10 }, // red
    { color: "#dc2626", size: 400, x: 60, y: 20 }, // red-600
    { color: "#f97316", size: 450, x: 30, y: 60 }, // orange-red
    { color: "#b91c1c", size: 350, x: 70, y: 70 }, // red-700
    { color: "#fb923c", size: 300, x: 20, y: 80 }, // soft orange
    { color: "#ff2d55", size: 380, x: 80, y: 40 }, // hot red-pink
];
export default function AnimatedBackground({ children, className = "", height = "100%" }) {
    const blobRefs = useRef([]);

    useEffect(() => {
        const velocities = BLOBS.map(() => ({
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
        }));

        const positions = BLOBS.map((b) => ({ x: b.x, y: b.y }));

        let animId;

        const animate = () => {
            positions.forEach((pos, i) => {
                pos.x += velocities[i].vx;
                pos.y += velocities[i].vy;

                // Bounce off edges
                if (pos.x <= 0 || pos.x >= 100) velocities[i].vx *= -1;
                if (pos.y <= 0 || pos.y >= 100) velocities[i].vy *= -1;

                pos.x = Math.max(0, Math.min(100, pos.x));
                pos.y = Math.max(0, Math.min(100, pos.y));

                const el = blobRefs.current[i];
                if (el) {
                    el.style.left = `${pos.x}%`;
                    el.style.top = `${pos.y}%`;
                }
            });

            animId = requestAnimationFrame(animate);
        };

        animId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animId);
    }, []);

    return (
        <div style={{ height }} className={`relative w-full h-full overflow-hidden bg-gray-950 ${className}`}>
            {/* Blobs */}
            {BLOBS.map((blob, i) => (
                <div
                    key={i}
                    ref={(el) => (blobRefs.current[i] = el)}
                    className="absolute rounded-full mix-blend-screen pointer-events-none"
                    style={{
                        width: blob.size,
                        height: blob.size,
                        left: `${blob.x}%`,
                        top: `${blob.y}%`,
                        background: blob.color,
                        opacity: 0.35,
                        filter: "blur(80px)",
                        transform: "translate(-50%, -50%)",
                        transition: "none",
                    }}
                />
            ))}

            {/* Noise overlay for texture */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "128px",
                }}
            />

            {/* Glass overlay */}
            <div className="absolute inset-0 bg-gray-950/30 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
// 🎨 Aurora Color Palette
// --------------------------------------------------
// Primary Glow: #039E74 (opacity 0.1)     - Bright Teal ⭐
// Secondary Glow: #fef3c7 (opacity 0.1)  - Gold/Cream ⭐
// Tertiary Glow: #1B4D3E (opacity 0.1)    - Primary Green (subtle)
// Overlay Tint: #fef3c7 (opacity 0.1)     - Gold/Cream frost
// Base Gradient: #e8f5f1 → #f0f9f6 → #fafffe
// --------------------------------------------------

export default function AuroraBackground({ children }) {
    // Islamic theme background color definitions with opacity (inspired by rich greens, gold, and subtle creams)
    // Islamic background color palette (do not change variable names)
    const primaryGlow = { color: '#239672', opacity: 0.14 };     // Subtle rich green, aurora vibe
    const secondaryGlow = { color: '#f7e5b2', opacity: 0.09 };   // Warm cream gold
    const tertiaryGlow = { color: '#dde9da', opacity: 0.11 };    // Misty light green sand
    const overlayTint = { color: '#d6c893', opacity: 0.13 };     // Soft muted gold green frost

    return (
        <div className="relative w-full h-full" style={{ background: "linear-gradient(135deg, #e8f5f1 0%, #f0f9f6 50%, #fafffe 100%)" }}>
            {/* Primary Glow - STATIC */}
            <div
                style={{
                    position: 'fixed',
                    top: '-300px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '1000px',
                    height: '1000px',
                    borderRadius: '50%',
                    filter: 'blur(100px)',
                    background: `radial-gradient(circle at center, ${primaryGlow.color} 0%, transparent 70%)`,
                    opacity: primaryGlow.opacity,
                    pointerEvents: "none",
                    zIndex: 0
                }}
            />

            {/* Secondary Glow - STATIC */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '-250px',
                    right: '-150px',
                    width: '700px',
                    height: '700px',
                    borderRadius: '50%',
                    filter: 'blur(100px)',
                    background: `radial-gradient(circle, ${secondaryGlow.color} 0%, transparent 70%)`,
                    opacity: secondaryGlow.opacity,
                    pointerEvents: "none",
                    zIndex: 0
                }}
            />

            {/* Third Glow - STATIC */}
            <div
                style={{
                    position: 'fixed',
                    top: '20%',
                    left: '-200px',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    filter: 'blur(100px)',
                    background: `radial-gradient(circle, ${tertiaryGlow.color} 0%, transparent 70%)`,
                    opacity: tertiaryGlow.opacity,
                    pointerEvents: "none",
                    zIndex: 0
                }}
            />

            {/* ✨ Overlay Tint - STATIC */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: overlayTint.color,
                    opacity: overlayTint.opacity,
                    pointerEvents: "none",
                    zIndex: 1
                }}
            />

            {/* Content */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
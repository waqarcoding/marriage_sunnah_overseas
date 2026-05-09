// components/IslamicPageHeader.jsx or ui/islamic_page_header.jsx

export default function PageHeader({
    title,
    subtitle,
    icon,
    showPattern = true,
    className = ""
}) {
    return (
        <div className={`px-5 pt-5 pb-1 relative overflow-hidden ${className}`}>
            {/* Islamic Pattern Background */}
            {showPattern && (
                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.04] pointer-events-none">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="header-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="10" cy="10" r="8" fill="none" stroke="#1B4D3E" strokeWidth="0.5" />
                                <circle cx="10" cy="10" r="4" fill="none" stroke="#1B4D3E" strokeWidth="0.5" />
                                <path d="M10 2 L18 10 L10 18 L2 10 Z" fill="none" stroke="#1B4D3E" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#header-pattern)" />
                    </svg>
                </div>
            )}

            <div className="relative z-10 flex items-start gap-3">
                {/* Optional Icon with Islamic accent */}
                {icon && (
                    <div className="mt-1 relative">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, #1B4D3E 0%, #2d8c6e 100%)",
                                boxShadow: "0 4px 12px rgba(27,77,62,0.2)"
                            }}>
                            {icon}
                        </div>
                        {/* Small crescent accent */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: "#D4AF37", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="#1B4D3E">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.51 5.07-1.39-1.39.09-2.82-.09-4.19-.64-3.49-1.39-5.95-4.66-5.95-8.47 0-2.18.77-4.18 2.05-5.75C7.32 4.2 5.78 3.5 4.07 3.5c-.55 0-1 .45-1 1 0 2.21 1.79 4 4 4 .93 0 1.79-.32 2.47-.85C8.97 9.06 8.5 10.49 8.5 12c0 3.03 1.95 5.61 4.66 6.56 1.37.48 2.82.66 4.26.54C19.58 17.49 21 14.91 21 12c0-4.97-4.03-9-9-9z" />
                            </svg>
                        </div>
                    </div>
                )}

                <div className="flex-1">
                    {/* Title with gradient underline */}
                    <div className="relative inline-block">
                        <h1 className="text-[26px] font-extrabold tracking-tight leading-tight mb-1"
                            style={{
                                letterSpacing: "-0.03em",
                                background: "linear-gradient(135deg, #1B4D3E 0%, #2d8c6e 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text"
                            }}>
                            {title}
                        </h1>
                        {/* Decorative gold line */}
                        <div className="absolute -bottom-0.5 left-0 h-0.5 w-16 rounded-full"
                            style={{ background: "linear-gradient(90deg, #D4AF37 0%, transparent 100%)" }}
                        />
                    </div>

                    {/* Subtitle */}
                    {subtitle && (
                        <p className="text-sm font-medium mt-2"
                            style={{ color: "rgba(107,114,128,0.85)" }}>
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Decorative corner element */}
                <div className="absolute top-0 right-5 w-8 h-8 opacity-10">
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 4 L20 12 L28 12 L22 18 L24 26 L16 20 L8 26 L10 18 L4 12 L12 12 Z"
                            fill="#1B4D3E" stroke="#D4AF37" strokeWidth="0.5" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
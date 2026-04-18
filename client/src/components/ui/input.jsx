
export default function Input({
    label,
    error = "",
    hint = "",
    wrapperClassName = "",
    className = "",
    type = "text",
    children = null,
    ...props
}) {
    const isSelect = type === "select"

    const sharedClass = `
        w-full border rounded-xl px-3 py-2.5 text-sm sm:text-base
        focus:outline-none focus:ring-1
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error
            ? "border-red-400 focus:ring-red-400/80"
            : isSelect
                ? "border-white hover:border-white"
                : "border-slate-200 hover:border-slate-300"
        }
        ${className}
   
    `

    const inputStyle = {
        background: "var(--input-bg, #fff)",
        color: "var(--primary, #1B4D3E)",
        "--tw-ring-color": "rgba(27, 77, 62, 0.25)",
        outlineColor: "var(--primary, #1B4D3E)",
    }

    const selectStyle = {
        background: "var(--input-bg, #fff)",  // was --secondary, #fafafa
        color: "var(--primary, #1B4D3E)",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231B4D3E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
        paddingRight: "36px",
        appearance: "none",
        WebkitAppearance: "none",
    }

    const focusStyle = {
        "--tw-ring-color": "color-mix(in srgb, var(--primary, #1B4D3E) 25%, transparent)",
    }

    return (
        <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
            {label && (
                <label
                    className="text-sm font-medium tracking-wide"
                    style={{ color: "var(--primary, #1B4D3E)" }}
                >
                    {label}
                </label>
            )}

            {isSelect ? (
                <select
                    className={sharedClass}
                    style={{
                        ...selectStyle,
                        appearance: undefined,
                        WebkitAppearance: undefined,
                    }}
                    onFocus={e => { e.target.style.boxShadow = "0 0 0 1px rgba(27,77,62,0.18)" }}
                    onBlur={e => { e.target.style.boxShadow = "" }}
                    {...props}
                >
                    {children}

                </select>
            ) : (
                <input
                    type={type}
                    className={sharedClass}
                    style={inputStyle}
                    onFocus={e => e.target.style.boxShadow = "0 0 0 3px rgba(27,77,62,0.18)"}
                    onBlur={e => e.target.style.boxShadow = ""}
                    {...props}
                />
            )}

            {error && (
                <p className="text-xs flex items-center gap-1" style={{ color: "#b91c1c" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </p>
            )}
            {hint && !error && (
                <p className="text-xs" style={{ color: "var(--secondary-foreground, #1B4D3E)", opacity: 0.6 }}>
                    {hint}
                </p>
            )}
        </div>
    )
}
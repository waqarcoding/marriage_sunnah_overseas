// components/ui/Select.jsx
import { useState, useRef, useEffect } from "react"

export default function SelectOption({
    label,
    error = "",
    hint = "",
    wrapperClassName = "",
    value,
    onChange,
    options = [],
    placeholder = "Select...",
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    const selected = options.find(o => o.value === value)

    useEffect(() => {
        const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    return (
        <div className={`flex flex-col gap-1.5 ${wrapperClassName}`} ref={ref}>
            {label && (
                <label className="text-sm font-medium tracking-wide"
                    style={{ color: "var(--primary, #1B4D3E)" }}>
                    {label}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpen(v => !v)}
                    className="w-full border rounded-xl px-3 py-2.5 text-sm sm:text-base text-left
                        transition-all duration-150 flex items-center justify-between"
                    style={{
                        background: "#fff",
                        color: selected ? "var(--primary, #1B4D3E)" : "#94a3b8",
                        borderColor: error ? "#f87171" : open ? "var(--primary, #1B4D3E)" : "#e2e8f0",
                        boxShadow: open ? "0 0 0 2px rgba(27,77,62,0.18)" : "",
                    }}
                >
                    <span>{selected ? selected.label : placeholder}</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {open && (
                    <ul
                        className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
                        style={{
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        }}
                    >
                        {options.map(opt => (
                            <li
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setOpen(false) }}
                                className="px-3 py-2.5 text-sm cursor-pointer transition-colors duration-100"
                                style={{
                                    background: value === opt.value ? "var(--secondary, #f0f5f3)" : "#fff",
                                    color: "var(--primary, #1B4D3E)",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--secondary, #f0f5f3)"}
                                onMouseLeave={e => e.currentTarget.style.background = value === opt.value ? "var(--secondary, #f0f5f3)" : "#fff"}
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {error && (
                <p className="text-xs flex items-center gap-1" style={{ color: "#b91c1c" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </p>
            )}
            {hint && !error && (
                <p className="text-xs" style={{ color: "var(--primary, #1B4D3E)", opacity: 0.6 }}>{hint}</p>
            )}
        </div>
    )
}
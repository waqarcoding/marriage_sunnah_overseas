// components/ui/Select.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, X, Check, ChevronDown } from "lucide-react";

export default function SelectOption({
    label,
    error = "",
    hint = "",
    wrapperClassName = "",
    value,
    onChange,
    options = [],
    placeholder = "Select...",
    optional = false,
    note = "",
    searchable = true,
    customOption = false,
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customValue, setCustomValue] = useState("");
    const [dropdownStyle, setDropdownStyle] = useState({});

    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const customInputRef = useRef(null);
    // Flag set to true when a mousedown happens inside the dropdown,
    // so the document mousedown handler knows NOT to close it.
    const insideClickRef = useRef(false);

    // Normalize string[] or {value,label}[] → {value,label}[]
    const normalizedOptions = options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt
    );

    const selected = normalizedOptions.find((o) => o.value === value);
    const isCustomValue = customOption && value && !selected;

    const filteredOptions = search
        ? normalizedOptions.filter((opt) =>
            opt.label.toLowerCase().includes(search.toLowerCase())
        )
        : normalizedOptions;

    const positionDropdown = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropHeight = 320;
        const openUpward = spaceBelow < dropHeight && spaceAbove > spaceBelow;

        setDropdownStyle({
            position: "fixed",
            left: rect.left,
            width: rect.width,
            zIndex: 999999,
            ...(openUpward
                ? { bottom: window.innerHeight - rect.top + 4, top: "auto" }
                : { top: rect.bottom + 4, bottom: "auto" }),
        });
    }, []);

    const openDropdown = () => {
        positionDropdown();
        setOpen(true);
        setSearch("");
        setShowCustomInput(false);
        setCustomValue("");
    };

    const closeDropdown = () => {
        setOpen(false);
        setSearch("");
        setShowCustomInput(false);
        setCustomValue("");
    };

    // Close on outside click — uses insideClickRef flag to avoid
    // closing when the user clicks anything inside the portal dropdown
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (insideClickRef.current) {
                insideClickRef.current = false;
                return;
            }
            if (triggerRef.current?.contains(e.target)) return;
            closeDropdown();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Reposition on scroll/resize while open
    useEffect(() => {
        if (!open) return;
        const handler = () => positionDropdown();
        window.addEventListener("scroll", handler, true);
        window.addEventListener("resize", handler);
        return () => {
            window.removeEventListener("scroll", handler, true);
            window.removeEventListener("resize", handler);
        };
    }, [open, positionDropdown]);

    // Focus search when opens
    useEffect(() => {
        if (open && searchable && !showCustomInput) {
            setTimeout(() => searchInputRef.current?.focus(), 80);
        }
    }, [open, searchable, showCustomInput]);

    // Focus custom input when shown
    useEffect(() => {
        if (showCustomInput) {
            setTimeout(() => customInputRef.current?.focus(), 80);
        }
    }, [showCustomInput]);

    const handleSelect = (val) => {
        onChange(val);
        closeDropdown();
    };

    const handleCustomSubmit = () => {
        if (!customValue.trim()) return;
        onChange(customValue.trim());
        closeDropdown();
    };

    // Every mousedown inside the dropdown sets the flag so the
    // document handler above knows not to close
    const handleDropdownMouseDown = () => {
        insideClickRef.current = true;
    };

    const dropdown = open ? (
        <div
            ref={dropdownRef}
            onMouseDown={handleDropdownMouseDown}
            style={{
                ...dropdownStyle,
                background: "var(--popover, #fff)",
                border: "1px solid var(--border, #e2e8f0)",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                display: "flex",
                flexDirection: "column",
                maxHeight: "320px",
                overflow: "hidden",
            }}
        >
            {/* Search */}
            {searchable && !showCustomInput && (
                <div style={{ padding: "8px 8px 6px", borderBottom: "1px solid var(--border, #e2e8f0)", flexShrink: 0 }}>
                    <div style={{ position: "relative" }}>
                        <Search
                            style={{
                                position: "absolute", left: 10, top: "50%",
                                transform: "translateY(-50%)",
                                width: 13, height: 13, color: "var(--muted-foreground, #94a3b8)",
                                pointerEvents: "none",
                            }}
                        />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            placeholder="Search..."
                            style={{
                                width: "100%",
                                paddingLeft: 30, paddingRight: search ? 28 : 10,
                                paddingTop: 8, paddingBottom: 8,
                                fontSize: 14, borderRadius: 12,
                                border: "1px solid var(--border, #e2e8f0)",
                                background: "var(--background, #fff)",
                                color: "var(--secondary-foreground, #1e293b)",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                style={{
                                    position: "absolute", right: 6, top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none", border: "none",
                                    cursor: "pointer", padding: 2,
                                }}
                            >
                                <X style={{ width: 13, height: 13, color: "var(--muted-foreground, #94a3b8)" }} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Custom input view */}
            {showCustomInput && (
                <div style={{ padding: "8px", borderBottom: "1px solid var(--border, #e2e8f0)", flexShrink: 0 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                        <input
                            ref={customInputRef}
                            type="text"
                            value={customValue}
                            onChange={(e) => setCustomValue(e.target.value)}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === "Enter") { e.preventDefault(); handleCustomSubmit(); }
                                else if (e.key === "Escape") { setShowCustomInput(false); setCustomValue(""); }
                            }}
                            placeholder="Enter custom value..."
                            style={{
                                flex: 1, padding: "8px 12px", fontSize: 14,
                                borderRadius: 12, border: "1px solid var(--border, #e2e8f0)",
                                background: "var(--background, #fff)",
                                color: "var(--secondary-foreground, #1e293b)",
                                outline: "none",
                            }}
                        />
                        <button
                            onClick={handleCustomSubmit}
                            disabled={!customValue.trim()}
                            style={{
                                padding: "8px 16px", fontSize: 14, fontWeight: 500,
                                borderRadius: 12, border: "none",
                                cursor: customValue.trim() ? "pointer" : "not-allowed",
                                background: "var(--primary, #1B4D3E)",
                                color: "#fff", opacity: customValue.trim() ? 1 : 0.4,
                                flexShrink: 0,
                            }}
                        >
                            Add
                        </button>
                    </div>
                    <button
                        onClick={() => { setShowCustomInput(false); setCustomValue(""); }}
                        style={{
                            marginTop: 6, fontSize: 12, background: "none", border: "none",
                            cursor: "pointer", color: "var(--muted-foreground, #94a3b8)",
                            padding: 0,
                        }}
                    >
                        ← Back to options
                    </button>
                </div>
            )}

            {/* Options list */}
            {!showCustomInput && (
                <div style={{ overflowY: "auto", flex: 1, padding: 4 }}>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "10px 14px", borderRadius: 12, cursor: "pointer", fontSize: 14,
                                    color: "var(--popover-foreground, #1e293b)",
                                    background: value === opt.value ? "var(--secondary, #f0f5f3)" : "transparent",
                                    fontWeight: value === opt.value ? 500 : "normal",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "var(--secondary, #f0f5f3)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = value === opt.value ? "var(--secondary, #f0f5f3)" : "transparent"}
                            >
                                <span>{opt.label}</span>
                                {value === opt.value && (
                                    <Check style={{ width: 15, height: 15, color: "var(--accent, #1B4D3E)", flexShrink: 0 }} />
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: "28px 16px", textAlign: "center", fontSize: 13, color: "var(--muted-foreground, #94a3b8)" }}>
                            No results for "{search}"
                        </div>
                    )}

                    {/* ✏️ Custom row */}
                    {customOption && !search && (
                        <div
                            onClick={() => {
                                setShowCustomInput(true);
                                setCustomValue("");
                            }}
                            style={{
                                display: "flex", alignItems: "center",
                                padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                                fontSize: 14, fontWeight: 500,
                                color: "var(--primary, #1B4D3E)",
                                borderTop: "1px solid var(--border, #e2e8f0)",
                                marginTop: 4,
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "var(--secondary, #f0f5f3)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                            ✏️ Custom
                        </div>
                    )}
                </div>
            )}
        </div>
    ) : null;

    return (
        <div className={`space-y-1.5 ${wrapperClassName}`}>
            {/* Label */}
            {label && (
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                    {optional && (
                        <span className="ml-1 normal-case font-normal text-muted-foreground/60">
                            (optional)
                        </span>
                    )}
                </label>
            )}

            {/* Note */}
            {note && <p className="text-xs text-muted-foreground">{note}</p>}

            {/* Trigger */}
            <button
                ref={triggerRef}
                type="button"
                onClick={() => open ? closeDropdown() : openDropdown()}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 text-sm transition-all outline-none text-left
                    ${value
                        ? "border-primary/5 bg-background text-secondary-foreground"
                        : "border-border bg-background text-muted-foreground"
                    }
                    ${error ? "!border-red-400" : ""}
                `}
            >
                <span>
                    {selected
                        ? selected.label
                        : isCustomValue
                            ? value
                            : placeholder}
                </span>
                <ChevronDown
                    className="w-4 h-4 text-muted-foreground transition-transform"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
                />
            </button>

            {typeof document !== "undefined" && createPortal(dropdown, document.body)}

            {/* Error */}
            {error && (
                <p className="text-xs flex items-center gap-1 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </p>
            )}

            {/* Hint */}
            {hint && !error && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
        </div>
    );
}
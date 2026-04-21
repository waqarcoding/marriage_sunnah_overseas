export default function MultiChips({ label, value = [], onChange, options, optional, note }) {
    const toggle = (v) => {
        if (v === "No Preference") { onChange(["No Preference"]); return }
        const filtered = value.filter(x => x !== "No Preference")
        onChange(filtered.includes(v) ? filtered.filter(x => x !== v) : [...filtered, v])
    }
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}{optional && <span className="ml-1 normal-case font-normal text-muted-foreground/60">(optional)</span>}
            </label>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
            <div className="flex flex-wrap gap-2">
                {options.map(opt => {
                    const active = value.includes(opt)
                    return (
                        <button
                            key={opt} type="button" onClick={() => toggle(opt)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all ${active ? "border-primary/5 bg-secondary text-primary" : "border-border bg-background text-muted-foreground"}`}
                        >
                            {active && <span className="mr-1">✓</span>}{opt}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

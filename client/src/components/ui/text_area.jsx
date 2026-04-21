export default function TextArea({ label, value, onChange, placeholder, optional, note, rows = 3 }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}{optional && <span className="ml-1 normal-case font-normal text-muted-foreground/60">(optional)</span>}
            </label>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
            <textarea
                rows={rows} value={value}
                onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-border text-sm text-card-foreground focus:outline-none focus:border-primary/5 focus:bg-secondary transition-all placeholder:text-muted-foreground bg-background resize-none"
            />
        </div>
    )
}

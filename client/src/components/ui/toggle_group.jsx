import { motion } from "framer-motion";

export function ToggleGroup({ label, value, onChange, options, optional }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}{optional && <span className="ml-1 normal-case font-normal text-muted-foreground/60">(optional)</span>}
            </label>
            <div className="flex gap-2 flex-wrap">
                {options.map(opt => (
                    <motion.button
                        key={opt.value} type="button" whileTap={{ scale: 0.97 }}
                        onClick={() => onChange(opt.value)}
                        className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-medium transition-all ${value === opt.value ? (opt.activeClass || "border-primary/5 bg-secondary text-primary") : "border-border bg-background text-muted-foreground"}`}
                    >
                        {opt.icon && <opt.icon className="w-4 h-4" />}{opt.label}
                    </motion.button>
                ))}
            </div>
        </div>
    )
}

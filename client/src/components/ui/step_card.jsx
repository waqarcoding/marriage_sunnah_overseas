import { motion } from "framer-motion"

export function StepCard({ icon: Icon, title, subtitle, variant = "primary", children }) {
    const variants = {
        primary: { bg: "bg-secondary", border: "border-primary/5", icon: "text-primary", iconBg: "bg-background" },
        accent: { bg: "bg-secondary", border: "border-accent/40", icon: "text-accent-foreground", iconBg: "bg-accent" },
        muted: { bg: "bg-muted", border: "border-border", icon: "text-muted-foreground", iconBg: "bg-background" },
    }
    const c = variants[variant] || variants.primary
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="bg-card rounded-3xl shadow-sm p-5 space-y-4"

        >
            <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${c.border} ${c.bg}`}>
                <div className={`w-10 h-10 rounded-full ${c.iconBg} flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <div>
                    <div className="font-semibold text-card-foreground text-sm " >{title}</div>
                    {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
                </div>
            </div>
            {children}
        </motion.div>
    )
}
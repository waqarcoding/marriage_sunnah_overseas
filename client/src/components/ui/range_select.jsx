import * as Select from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"

// ─── Shared UI Components ──────────────────────────────────────────────────────
const RangeSelect = ({ label, value, onChange, options, placeholder, optional, note }) => {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}{optional && <span className="ml-1 normal-case font-normal text-muted-foreground/60">(optional)</span>}
            </label>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
            <Select.Root value={value} onValueChange={onChange}>
                <Select.Trigger className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 text-sm transition-all outline-none ${value ? "border-primary/5 bg-background text-secondary-foreground" : "border-border bg-background text-muted-foreground"}`}>
                    <Select.Value placeholder={placeholder} />
                    <Select.Icon><ChevronDown className="w-4 h-4 text-muted-foreground" /></Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                    <Select.Content position="popper" sideOffset={6} className="z-50 w-[var(--radix-select-trigger-width)] bg-popover rounded-2xl shadow-xl border border-border overflow-hidden max-h-64">
                        <Select.Viewport className="p-1">
                            {options.map((opt) => {
                                const v = typeof opt === "string" ? opt : opt.value
                                const l = typeof opt === "string" ? opt : opt.label
                                return (
                                    <Select.Item key={v} value={v} className="flex items-center justify-between px-4 py-3 text-sm text-popover-foreground rounded-xl cursor-pointer outline-none hover:bg-secondary hover:text-primary data-[highlighted]:bg-secondary data-[highlighted]:text-primary data-[state=checked]:text-primary data-[state=checked]:font-medium">
                                        <Select.ItemText>{l}</Select.ItemText>
                                        <Select.ItemIndicator><Check className="w-4 h-4 text-accent" /></Select.ItemIndicator>
                                    </Select.Item>
                                )
                            })}
                        </Select.Viewport>
                    </Select.Content>
                </Select.Portal>
            </Select.Root>
        </div>
    )
}

export default RangeSelect;
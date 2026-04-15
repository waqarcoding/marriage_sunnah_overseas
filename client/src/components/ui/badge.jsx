import * as React from "react";
import { cn } from "..//../components/utils";

/**
 * Badge component: Universal badge UI with variant support.
 * - Props:
 *   - variant?: "primary" | "secondary" | "accent"; // visual style
 *   - active?: boolean (legacy; still supported for accent)
 *   - className?: string
 *   - children: ReactNode
 */
function Badge({
    children,
    variant = "accent", // default to accent
    active,
    className = "px-4 py-0 text-sm",
    ...props
}) {
    // Allow both active and inactive styling, not just legacy accent.
    let variantClass = "";

    switch (variant) {
        case "accent":
            if (active) {
                // active accent
                variantClass = "bg-accent text-white shadow-sm";
            } else {
                // inactive accent
                variantClass = "bg-primary/5 text-gray-400";
            }
            break;
        case "secondary":
            if (active) {
                // active secondary
                variantClass = "bg-secondary text-primary font-semibold";
            } else {
                // inactive secondary
                variantClass = "bg-primary/5 text-gray-400";
            }
            break;
        case "primary":
        default:
            if (active) {
                // active primary
                variantClass = "bg-primary text-white";
            } else {
                // inactive primary
                variantClass = "bg-primary/5 text-gray-400";
            }
            break;
    }

    return (
        <span
            className={cn(
                `inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium
                transition-colors select-none whitespace-nowrap h-8`,
                variantClass,
                className
            )}
            style={{ minHeight: 32, lineHeight: "normal", textAlign: "center" }}
            {...props}
        >
            {children}
        </span>
    );
}

export { Badge };
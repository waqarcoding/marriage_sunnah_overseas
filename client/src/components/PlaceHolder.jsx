import React from "react";

export default function Placeholder({
    title = "No items found",
    subtitle = "",
    icon = null,
    titleColor = "text-white",
    subtitleColor = "text-white/60"
}) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center mt-10 px-4">
            {icon && <div className="mb-4 text-6xl">{icon}</div>}
            <h2 className={`font-bold text-xl mb-1 ${titleColor}`}>{title}</h2>
            {subtitle && <p className={`${subtitleColor}`}>{subtitle}</p>}
        </div>
    );
}
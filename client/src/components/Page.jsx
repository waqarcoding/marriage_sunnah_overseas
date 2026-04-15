// components/Page.jsx
import React from "react";

export default function Page({
    children,
    className = "",
    padding = "p-6",
    rounded = "rounded-3xl",
    shadow = "shadow-md",
    bg = "bg-white",
    ...props
}) {
    return (
        <div
            className={`${bg} ${rounded} ${shadow} ${padding} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
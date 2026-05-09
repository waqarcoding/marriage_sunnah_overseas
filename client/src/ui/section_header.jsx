// components/SectionHeader.jsx or ui/section_header.jsx

export default function SectionHeader({
    title,
    description,
    align = "center",
    titleSize = "base",
    descriptionMaxWidth = "220px",
    className = ""
}) {
    const alignmentClasses = {
        center: "text-center items-center mx-auto",
        left: "text-left items-start",
        right: "text-right items-end ml-auto"
    };

    const titleSizes = {
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
        "2xl": "text-2xl"
    };

    return (
        <div className={`flex flex-col gap-2 ${alignmentClasses[align]} ${className}`}>
            <h3
                className={`${titleSizes[titleSize]} font-semibold`}
                style={{ color: "var(--primary, #1B4D3E)", letterSpacing: "-0.01em" }}
            >
                {title}
            </h3>
            {description && (
                <p
                    className="text-sm leading-relaxed"
                    style={{
                        color: "#9ca3af",
                        maxWidth: descriptionMaxWidth
                    }}
                >
                    {description}
                </p>
            )}
        </div>
    );
}
export default function TypingIndicator({ avatarLetter }) {
    return (
        <div className="flex items-end gap-2 mb-1">
            <div className="w-6 h-6 rounded-full text-[10px] font-bold
                flex items-center justify-center flex-shrink-0 mb-0.5 select-none"
                style={{ backgroundColor: "var(--secondary)", color: "var(--foreground)" }}>
                {avatarLetter}
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center"
                style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)",
                         boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                {[0, 180, 360].map((delay) => (
                    <span key={delay}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ backgroundColor: "var(--muted-foreground)",
                                 animationDelay: `${delay}ms`, animationDuration: "0.9s" }} />
                ))}
            </div>
        </div>
    );
}

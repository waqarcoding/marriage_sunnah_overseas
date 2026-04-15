export default function MessageBubble({ msg, isMine, showTimestamp, avatarLetter, formatTime }) {
    const isTemp = String(msg.id).startsWith("tmp_");

    return (
        <div>
            {/* Time divider */}
            {showTimestamp && (
                <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
                    <span className="text-[11px] select-none flex-shrink-0 px-3 py-1 rounded-full"
                        style={{ backgroundColor: "var(--accent)", color: "var(--muted-foreground)" }}>
                        {formatTime(msg.created_at)}
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
                </div>
            )}

            <div className={`flex items-end gap-2 mb-1 ${isMine ? "justify-end" : "justify-start"}`}>

                {/* Receiver mini avatar */}
                {!isMine && (
                    <div className="w-6 h-6 rounded-full text-[10px] font-bold
                        flex items-center justify-center flex-shrink-0 mb-0.5 select-none"
                        style={{ backgroundColor: "var(--secondary)", color: "var(--foreground)" }}>
                        {avatarLetter}
                    </div>
                )}

                {/* Bubble */}
                <div
                    className={`max-w-[72%] sm:max-w-sm lg:max-w-md px-4 py-2.5 rounded-2xl
                        text-sm leading-relaxed transition-opacity duration-300
                        ${isMine ? "rounded-br-sm" : "rounded-bl-sm"}
                        ${isTemp ? "opacity-40" : "opacity-100"}`}
                    style={isMine
                        ? { backgroundColor: "var(--foreground)", color: "var(--background)",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }
                        : { backgroundColor: "var(--background)", color: "var(--foreground)",
                            border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }
                    }
                >
                    <p className="break-words whitespace-pre-wrap">{msg.message}</p>

                    {/* Meta row */}
                    <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                        <span className="text-[10px]"
                            style={{ color: isMine ? "rgba(255,255,255,0.5)" : "var(--muted-foreground)" }}>
                            {formatTime(msg.created_at)}
                        </span>
                        {isMine && (
                            <span className="text-[11px] font-bold leading-none"
                                style={{ color: msg.is_seen ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)" }}>
                                {isTemp ? "·" : msg.is_seen ? "✓✓" : "✓"}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

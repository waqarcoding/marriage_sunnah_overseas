export default function ConversationSkeleton({ count = 5 }) {
    return (
        <div className="flex flex-col">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="flex items-center gap-3.5 px-5 py-3.5 animate-pulse">
                    <div className="w-12 h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: "var(--muted)" }} />
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="h-3 rounded-full w-1/3"
                                style={{ backgroundColor: "var(--muted)" }} />
                            <div className="h-2.5 rounded-full w-10"
                                style={{ backgroundColor: "var(--muted)" }} />
                        </div>
                        <div className="h-2.5 rounded-full w-2/3"
                            style={{ backgroundColor: "var(--muted)" }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

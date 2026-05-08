import { motion } from "motion/react";
import { Send } from "lucide-react";

export default function MessageInput({ input, onChange, onSend, onKeyDown, sending, inputRef }) {
    const canSend = input.trim() && !sending;

    return (
        <div className="flex items-end gap-2.5 px-4 py-3 border-t flex-shrink-0"
            style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>

            <div className="flex-1 rounded-2xl border transition-all duration-200"
                style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border)" }}>
                <input
                    ref={inputRef}
                    className="w-full bg-transparent px-4 py-2.5 text-sm outline-none"
                    style={{ color: "var(--foreground)" }}
                    placeholder="Type a message…"
                    value={input}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                />
            </div>

            <motion.button
                onClick={onSend}
                disabled={!canSend}
                whileTap={canSend ? { scale: 0.88 } : {}}
                className="w-11 h-11 rounded-full flex items-center justify-center
                    flex-shrink-0 transition-all duration-200"
                style={{
                    backgroundColor: canSend ? "var(--foreground)" : "var(--muted)",
                    color:           canSend ? "var(--background)" : "var(--muted-foreground)",
                    cursor:          canSend ? "pointer" : "not-allowed",
                }}
            >
                <Send className="w-4 h-4" strokeWidth={2.5} />
            </motion.button>
        </div>
    );
}

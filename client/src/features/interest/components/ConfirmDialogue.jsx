{/* ── Confirmation Dialog ── */ }
<AnimatePresence>
    {dialog && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
            onClick={() => setDialog(null)}
        >
            <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="rounded-3xl p-6 w-full max-w-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.25)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${dialog.type === "accept" ? "bg-green-500/20" : "bg-red-500/20"
                    }`}>
                    {dialog.type === "accept"
                        ? <Heart className="w-8 h-8 text-green-400" />
                        : <X className="w-8 h-8 text-red-400" />
                    }
                </div>

                {/* Title */}
                <h3 className="text-xl text-center text-white mb-2">
                    {dialog.type === "accept" ? "Accept Interest?" : "Decline Interest?"}
                </h3>

                {/* Message */}
                <p className="text-center text-white/70 text-sm mb-6">
                    {dialog.type === "accept"
                        ? `You are about to accept ${dialog.name}'s interest. This will allow you to chat.`
                        : `You are about to decline ${dialog.name}'s interest. This cannot be undone.`
                    }
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setDialog(null)}
                        className="flex-1 py-3 rounded-2xl text-white/80 text-sm font-medium"
                        style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleConfirm}
                        className={`flex-1 py-3 rounded-2xl text-white text-sm font-medium ${dialog.type === "accept"
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                    >
                        {dialog.type === "accept" ? "Yes, Accept" : "Yes, Decline"}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>
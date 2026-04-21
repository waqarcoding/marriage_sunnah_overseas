import { motion, AnimatePresence } from "motion/react";
import { MoreVertical, Trash2, X } from "lucide-react";
import ImageAvatar from "../../../components/ImageAvatar";
import { useState, useRef, useEffect } from "react";

export default function ConversationItem({ conversation, index = 0, onClick, onDelete }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const menuRef = useRef(null);

    // Close menu on outside click
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setMenuOpen(false);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = (e) => {
        e.stopPropagation();
        setShowDeleteConfirm(false);
        onDelete?.(conversation);
    };

    const handleCancelDelete = (e) => {
        e.stopPropagation();
        setShowDeleteConfirm(false);
    };

    return (
        <>
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onClick?.(conversation)}
                className="w-full px-6 py-4 flex items-center gap-4
                    border-b border-gray-100 last:border-0
                    hover:bg-gray-50 transition-colors text-left relative"
            >
                {/* ── Avatar ── */}
                <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">
                        {conversation.avatar ? (
                            <ImageAvatar
                                images={conversation.avatar}
                                gender={conversation.gender}
                                alt={conversation.name}
                                interestStatus={"accepted"}
                                isShowPending={false}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center
                                font-bold text-xl text-gray-400 select-none">
                                {conversation.name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                        )}
                    </div>
                    {conversation.online && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500
                            rounded-full border-2 border-white" />
                    )}
                </div>

                {/* ── Content ── */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">
                            {conversation.name}
                            {conversation.age && (
                                <span className="text-gray-500 font-normal">, {conversation.age}</span>
                            )}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {conversation.time}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${conversation.unread > 0 ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                            {conversation.lastMessage || conversation.last_message || "Start a conversation…"}
                        </p>
                        {conversation.unread > 0 && (
                            <div className="ml-2 min-w-[20px] h-5 px-1 rounded-full bg-pink-500
                                flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">
                                    {conversation.unread > 9 ? "9+" : conversation.unread}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── More button + dropdown ── */}
                <div
                    ref={menuRef}
                    className="relative flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setMenuOpen(o => !o)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                    </motion.div>

                    {/* Dropdown menu */}
                    <AnimatePresence>
                        {menuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-8 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                                style={{ minWidth: 160 }}
                            >
                                <button
                                    onClick={handleDeleteClick}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm
                                        text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Chat
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.button>

            {/* ── Delete Confirm Modal ── */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] flex items-center justify-center px-6"
                        style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
                        onClick={handleCancelDelete}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.88, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.88, y: 16 }}
                            transition={{ type: "spring", stiffness: 320, damping: 24 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
                        >
                            {/* Red top banner */}
                            <div className="bg-red-50 px-6 pt-6 pb-4 flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-red-500" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-base font-bold text-gray-900">Delete Conversation?</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Your chat with <span className="font-semibold text-gray-700">{conversation.name}</span> will be permanently deleted.
                                    </p>
                                </div>
                            </div>

                            {/* Avatar preview */}
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                    {conversation.avatar ? (
                                        <ImageAvatar
                                            images={conversation.avatar}
                                            gender={conversation.gender}
                                            alt={conversation.name}
                                            interestStatus={"accepted"}
                                            isShowPending={false}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                                            {conversation.name?.[0]?.toUpperCase() ?? "?"}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {conversation.name}{conversation.age ? `, ${conversation.age}` : ""}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {conversation.lastMessage || conversation.last_message || "No messages"}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 px-6 py-4">
                                <button
                                    onClick={handleCancelDelete}
                                    className="flex-1 py-3 rounded-2xl text-sm font-medium
                                        text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleConfirmDelete}
                                    className="flex-1 py-3 rounded-2xl text-sm font-semibold
                                        text-white bg-red-500 hover:bg-red-600 transition-colors
                                        flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
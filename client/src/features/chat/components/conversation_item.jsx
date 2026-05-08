import { motion, AnimatePresence } from "motion/react";
import { MoreVertical, Trash2, X } from "lucide-react";
import ImageAvatar from "../../../ui/image";
import { useState, useRef, useEffect } from "react";
import AuthService from "../../auth/services/AuthService";

export default function ConversationItem({ conversation, index = 0, isActive, onClick, onDelete }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const menuRef = useRef(null);
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        // conversation_item.jsx - Add this near the top of the component
        const unreadCount = conversation.unread_count || conversation.unread || 0;

        console.log('🔢 Unread for', conversation.name, ':', unreadCount, conversation);
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    useEffect(() => {
        const fetchData = async () => {
            try {


                const ispro = await AuthService.isPro();
                setIsPro(ispro);



            } catch (err) {


            } finally {

            }
        }
        fetchData()
    }, [])
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, ease: [0.34, 0.7, 0.18, 1] }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onClick?.(conversation)}
                style={{
                    width: "100%",
                    padding: "14px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    borderBottom: "0.5px solid rgba(27,77,62,0.06)",




                    cursor: "pointer",
                    textAlign: "left",
                    position: "relative",
                    transition: "all 0.15s ease",
                    border: "none"
                }}

            >
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "16px",
                        overflow: "hidden",
                        background: "#f5f5f5"
                    }}>
                        {conversation.avatar ? (
                            <ImageAvatar
                                images={conversation.avatar}
                                gender={conversation.gender}
                                alt={conversation.name}
                                isBlurred={conversation.is_blurred_images}
                                viewerIsPro={isPro}
                                shouldShowOverlay={false}
                                className="w-full h-full object-cover"
                            />



                        ) : (
                            <div style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "20px",
                                fontWeight: "500",
                                color: "#9ca3af",
                                userSelect: "none"
                            }}>
                                {conversation.name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                        )}
                    </div>
                    {conversation.online && (
                        <div style={{
                            position: "absolute",
                            bottom: "-1px",
                            right: "-1px",
                            width: "14px",
                            height: "14px",
                            background: "#10b981",
                            borderRadius: "50%",
                            border: "2px solid #ffffff"
                        }} />
                    )}
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px"
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                        <span style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#1B4D3E",
                            letterSpacing: "-0.005em"
                        }}>
                            {conversation.name}
                            {conversation.age && (
                                <span style={{
                                    fontWeight: "400",
                                    color: "#6b7280"
                                }}>
                                    , {conversation.age}
                                </span>
                            )}
                        </span>
                        <span style={{
                            fontSize: "11px",
                            fontWeight: "400",
                            color: "#9ca3af",
                            flexShrink: 0,
                            marginLeft: "8px"
                        }}>
                            {conversation.time}
                        </span>
                    </div>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0px"
                    }}>
                        <p style={{
                            margin: 0,
                            fontSize: "13px",
                            fontWeight: conversation.unread > 0 ? "500" : "400",
                            color: conversation.unread > 0 ? "#374151" : "#9ca3af",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            lineHeight: "1.4"
                        }}>
                            {conversation.lastMessage || conversation.last_message || "Start a conversation…"}
                        </p>
                        {conversation.unread > 0 && (
                            <div style={{
                                minWidth: "18px",
                                height: "18px",
                                padding: "0 5px",
                                borderRadius: "10px",
                                background: "var(--primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                            }}>
                                <span style={{
                                    fontSize: "10px",
                                    fontWeight: "600",
                                    color: "#ffffff",
                                    lineHeight: "1"
                                }}>
                                    {conversation.unread > 9 ? "9+" : conversation.unread}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* More button + dropdown */}
                <div
                    ref={menuRef}
                    style={{ position: "relative", flexShrink: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <motion.div
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setMenuOpen(o => !o)}
                        style={{
                            padding: "6px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "background 0.15s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(27,77,62,0.06)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                        }}
                    >
                        <MoreVertical style={{ width: "18px", height: "18px", color: "#9ca3af" }} />
                    </motion.div>

                    {/* Dropdown menu */}
                    <AnimatePresence>
                        {menuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: -4 }}
                                transition={{ duration: 0.15, ease: [0.34, 0.7, 0.18, 1] }}
                                style={{
                                    position: "absolute",
                                    right: 0,
                                    top: "36px",
                                    zIndex: 50,
                                    background: "#ffffff",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
                                    border: "0.5px solid rgba(27,77,62,0.08)",
                                    overflow: "hidden",
                                    minWidth: "160px"
                                }}
                            >
                                <button
                                    onClick={handleDeleteClick}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "12px 14px",
                                        fontSize: "13px",
                                        fontWeight: "500",
                                        color: "#ef4444",
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        transition: "background 0.15s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "rgba(239,68,68,0.06)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "transparent";
                                    }}
                                >
                                    <Trash2 style={{ width: "16px", height: "16px" }} />
                                    Delete chat
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.button>

            {/* Delete Confirm Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 99999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "20px",
                            background: "rgba(0,0,0,0.4)",
                            backdropFilter: "blur(4px)"
                        }}
                        onClick={handleCancelDelete}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 12 }}
                            transition={{ type: "spring", stiffness: 340, damping: 26 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: "#ffffff",
                                width: "100%",
                                maxWidth: "420px",
                                borderRadius: "20px",
                                overflow: "hidden",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)"
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                background: "#fef2f2",
                                padding: "24px 24px 20px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "12px"
                            }}>
                                <div style={{
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "16px",
                                    background: "#fee2e2",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Trash2 style={{ width: "24px", height: "24px", color: "#ef4444" }} />
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <h3 style={{
                                        margin: "0 0 6px",
                                        fontSize: "16px",
                                        fontWeight: "500",
                                        color: "#1B4D3E",
                                        letterSpacing: "-0.01em"
                                    }}>
                                        Delete conversation?
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        fontSize: "13px",
                                        fontWeight: "400",
                                        color: "#6b7280",
                                        lineHeight: "1.5"
                                    }}>
                                        Your chat with{" "}
                                        <span style={{ fontWeight: "500", color: "#374151" }}>
                                            {conversation.name}
                                        </span>
                                        {" "}will be permanently deleted.
                                    </p>
                                </div>
                            </div>

                            {/* Preview */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "16px 24px",
                                borderBottom: "0.5px solid rgba(27,77,62,0.08)"
                            }}>
                                <div style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    background: "#f5f5f5",
                                    flexShrink: 0
                                }}>
                                    {conversation.avatar ? (
                                        <ImageAvatar
                                            images={conversation.avatar}
                                            gender={conversation.gender}
                                            alt={conversation.name}
                                            viewerIsPro={isPro}
                                            className="w-full h-full object-cover"
                                        />

                                    ) : (
                                        <div style={{
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "16px",
                                            fontWeight: "500",
                                            color: "#9ca3af"
                                        }}>
                                            {conversation.name?.[0]?.toUpperCase() ?? "?"}
                                        </div>
                                    )}
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <p style={{
                                        margin: "0 0 2px",
                                        fontSize: "13px",
                                        fontWeight: "500",
                                        color: "#1B4D3E",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}>
                                        {conversation.name}{conversation.age ? `, ${conversation.age}` : ""}
                                    </p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: "12px",
                                        fontWeight: "400",
                                        color: "#9ca3af",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}>
                                        {conversation.lastMessage || conversation.last_message || "No messages"}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{
                                display: "flex",
                                gap: "10px",
                                padding: "16px 24px"
                            }}>
                                <button
                                    onClick={handleCancelDelete}
                                    style={{
                                        flex: 1,
                                        padding: "11px 20px",
                                        borderRadius: "12px",
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        color: "#374151",
                                        background: "#f5f5f5",
                                        border: "none",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#e5e5e5";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#f5f5f5";
                                    }}
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleConfirmDelete}
                                    style={{
                                        flex: 1,
                                        padding: "11px 20px",
                                        borderRadius: "12px",
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        color: "#ffffff",
                                        background: "#ef4444",
                                        border: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        transition: "all 0.15s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#dc2626";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#ef4444";
                                    }}
                                >
                                    <Trash2 style={{ width: "16px", height: "16px" }} />
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
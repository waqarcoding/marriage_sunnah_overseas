import { useState } from "react";
import { Search, X } from "lucide-react";
import ConversationItem from "./conversation_item";

export default function ConversationsList({ conversations, activeId, onClick, onDelete }) {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter conversations based on search
    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            conv.name?.toLowerCase().includes(query) ||
            conv.lastMessage?.toLowerCase().includes(query) ||
            conv.last_message?.toLowerCase().includes(query)
        );
    });

    // conversations_list.jsx - Update line 18
    const unreadCount = conversations.filter(c => (c.unread_count || c.unread || 0) > 0).length;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",

        }}>
            {/* Header */}
            <div style={{
                padding: "18px 20px 16px",

                borderBottom: "0.5px solid rgba(27,77,62,0.08)"
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",

                }}>

                    {unreadCount > 0 && (
                        <div style={{
                            padding: "3px 10px",
                            borderRadius: "16px",
                            background: "var(--secondary)",
                            border: "0.5px solid rgba(239,68,68,0.15)"
                        }}>
                            <span style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "var(--primary)",
                                marginBottom: "10px",

                                letterSpacing: "0.01em"
                            }}>
                                {unreadCount} new
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ height: 10 }}></div>



                {/* Search bar */}
                <div style={{ position: "relative" }}>
                    <Search style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "16px",
                        height: "16px",
                        color: "#9ca3af",
                        pointerEvents: "none"
                    }} />
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        style={{
                            width: "100%",
                            height: "38px",
                            paddingLeft: "38px",
                            paddingRight: searchQuery ? "36px" : "12px",
                            fontSize: "13px",
                            fontWeight: "400",
                            border: "0.5px solid rgba(27,77,62,0.12)",
                            borderRadius: "10px",
                            background: "#fafaf9",
                            color: "#1B4D3E",
                            outline: "none",
                            transition: "all 0.15s ease"
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = "rgba(27,77,62,0.24)";
                            e.target.style.background = "#ffffff";
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = "rgba(27,77,62,0.12)";
                            e.target.style.background = "#fafaf9";
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            style={{
                                position: "absolute",
                                right: "8px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: "24px",
                                height: "24px",
                                borderRadius: "6px",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.15s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(27,77,62,0.08)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                            }}
                        >
                            <X style={{ width: "14px", height: "14px", color: "#9ca3af" }} />
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div style={{
                flex: 1,
                overflowY: "auto",

            }}>
                {filteredConversations.length === 0 ? (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "56px 24px",
                        textAlign: "center"
                    }}>
                        <div style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "24px",
                            background: "#f0f5f3",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "18px"
                        }}>
                            {searchQuery ? (
                                <Search style={{ width: "36px", height: "36px", color: "#1B4D3E", opacity: 0.5 }} />
                            ) : (
                                <span style={{ fontSize: "36px" }}>💬</span>
                            )}
                        </div>
                        <h3 style={{
                            margin: "0 0 8px",
                            fontSize: "15px",
                            fontWeight: "500",
                            color: "#1B4D3E",
                            letterSpacing: "-0.005em"
                        }}>
                            {searchQuery ? "No results found" : "No conversations yet"}
                        </h3>
                        <p style={{
                            margin: 0,
                            fontSize: "13px",
                            fontWeight: "400",
                            color: "#9ca3af",
                            lineHeight: "1.5",
                            maxWidth: "240px"
                        }}>
                            {searchQuery
                                ? `No conversations match "${searchQuery}"`
                                : "Start exploring to connect with matches"}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Results count when searching */}
                        {searchQuery && (
                            <div style={{
                                padding: "10px 20px",
                                background: "#fafaf9",
                                borderBottom: "0.5px solid rgba(27,77,62,0.06)"
                            }}>
                                <span style={{
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    color: "#6b7280",
                                    letterSpacing: "0.01em"
                                }}>
                                    {filteredConversations.length} {filteredConversations.length === 1 ? "result" : "results"}
                                </span>
                            </div>
                        )}

                        {/* Conversation items */}
                        {filteredConversations.map((conversation, index) => (
                            <ConversationItem
                                key={conversation.id}
                                conversation={conversation}
                                index={index}
                                isActive={String(activeId) === String(conversation.other_user_id)}
                                onClick={onClick}
                                onDelete={onDelete}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Footer hint */}
            {!searchQuery && conversations.length > 0 && (
                <div style={{
                    padding: "12px 20px",
                    background: "#fafaf9",
                    opacity: 0.5,

                    borderTop: "0.5px solid rgba(27,77,62,0.06)",
                    textAlign: "center"
                }}>
                    <span style={{
                        fontSize: "11px",
                        fontWeight: "400",
                        color: "#9ca3af",
                        letterSpacing: "0.01em"
                    }}>
                        {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
                    </span>
                </div>
            )}
        </div>
    );
}
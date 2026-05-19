import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

import ChatService from "../services/ChatService";
import NewMatches from "../components/new_matches";
import ConversationsList from "../components/conversations_list";
import ConversationSkeleton from "../components/converstaion_skeleton";
import ChatHeader from "../components/chat_header";
import MessageBubble from "../components/message_bubble";
import TypingIndicator from "../components/typing_indicator";
import MessageInput from "../components/message_input";
import { useSocket } from "../../../sockets/SocketContext";
import AuthService from "../../auth/services/AuthService";
import PageHeader from "../../../ui/page_header";

// ============================================
// HELPER FUNCTIONS
// ============================================

function getSenderId() {
    try {
        const token = localStorage.getItem("jwtToken");
        if (!token) return null;
        return JSON.parse(atob(token.split(".")[1])).id;
    } catch (error) {
        console.error('Error getting sender ID:', error);
        return null;
    }
}

function getUserRole() {
    try {
        const token = localStorage.getItem("jwtToken");
        if (!token) return null;
        return JSON.parse(atob(token.split(".")[1])).role;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(
        typeof window !== "undefined" ? window.innerWidth < 768 : false
    );
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);
    return isMobile;
}

// ============================================
// MAIN CHAT PAGE COMPONENT
// ============================================

export default function ChatPage() {
    const [searchParams] = useSearchParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const socketCtx = useSocket();

    const [currentUserRole, setCurrentUserRole] = useState(getUserRole());
    const [conversations, setConversations] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [receiverInfo, setReceiverInfo] = useState(state?.receiver || null);
    const [currentUser, setUser] = useState(null);
    const [matchId, setMatchId] = useState(null);
    const receiverId = searchParams.get("receiver_id");

    // ✅ Add cleanup ref
    const isMountedRef = useRef(true);

    // ✅ Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // ✅ Fetch current user role
    useEffect(() => {
        async function fetchUser() {
            try {
                const user = await AuthService.getCurrentUser();
                if (isMountedRef.current) {
                    setCurrentUserRole(user?.role || null);
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                if (isMountedRef.current) {
                    setCurrentUserRole(null);
                }
            }
        }
        fetchUser();
    }, []);

    // ✅ Helper function to get role-based path
    const getRolePath = useCallback((path) => {
        try {
            const role = currentUserRole || getUserRole();
            let prefix;
            if (role === 'guardian') {
                prefix = '/guardian';
            } else if (role === 'staff') {
                prefix = '/admin';
            } else if (role === 'admin' || role === 'super_admin') {
                prefix = '/admin';
            } else {
                prefix = '/individual';
            }

            return `${prefix}${path}`;
        } catch (error) {
            console.error('Error getting role path:', error);
            return `/individual${path}`; // Fallback
        }
    }, [currentUserRole]);

    // ✅ Clear unread count when landing on a chat
    useEffect(() => {
        const clearUnreadCount = async () => {
            if (!receiverId) return;
            try {
                await ChatService.clearUnreadCount();
                if (socketCtx && isMountedRef.current) {
                    socketCtx.setChatCount(0);
                }
            } catch (err) {
                console.error('Failed to clear unread count:', err);
            }
        };

        clearUnreadCount();
    }, [receiverId, socketCtx]);

    // ✅ Extracted fetch function so it can be reused
    const fetchConversations = useCallback(async () => {
        try {
            const res = await ChatService.getConversationUsers();
            console.log('📊 Full API response:', res);
            console.log('📊 Conversations received:', res.data);

            if (!isMountedRef.current) return;

            if (res.success) {

                setConversations(res.data);
                setMatchId(res.data?.match_id);
            }
        } catch (err) {
            console.error('Error loading conversations:', err);
        } finally {
            if (isMountedRef.current) {
                setLoadingConvs(false);
            }
        }
    }, []);

    // ✅ Initial load
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // ✅ Update unread count when entering a chat
    useEffect(() => {
        if (!receiverId) return;

        if (socketCtx) {
            socketCtx.setChatCount(0);
        }

        const fetchUnreadCount = async () => {
            try {
                const response = await ChatService.getUnreadCount();
                if (response.success && socketCtx && isMountedRef.current) {
                    socketCtx.setChatCount(response.data?.count || 0);
                }
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        const timeoutId = setTimeout(fetchUnreadCount, 1000);
        return () => clearTimeout(timeoutId);
    }, [socketCtx, receiverId]);

    // ✅ Listen to socket events and reload conversations
    useEffect(() => {
        if (!socketCtx?.socket || !socketCtx.connected) {
            console.log('⏳ Socket not ready yet:', {
                hasSocket: !!socketCtx?.socket,
                connected: socketCtx?.connected
            });
            return;
        }

        console.log('🎧 Setting up conversation list listeners');
        console.log('🎧 Socket ID:', socketCtx.socket.id);

        const handleMessage = (data) => {
            console.log('📨 Message event received:', data);
            console.log('📨 Current receiverId:', receiverId);

            setTimeout(() => {
                ChatService.getConversationUsers()
                    .then(res => {
                        if (res.success && res.data && isMountedRef.current) {
                            console.log('✅ Conversations updated:', res.data.length);
                            setConversations([...res.data]);
                        }
                    })
                    .catch(err => console.error('❌ Error:', err));
            }, 300);
        };

        const handleNotification = (notification) => {
            console.log('🔔 Notification received:', notification.type);

            if (notification.type === 'new_message') {
                setTimeout(() => {
                    ChatService.getConversationUsers()
                        .then(res => {
                            if (res.success && res.data && isMountedRef.current) {
                                console.log('✅ Conversations updated from notification');
                                setConversations([...res.data]);
                            }
                        })
                        .catch(err => console.error('❌ Error:', err));
                }, 300);
            }
        };

        socketCtx.socket.on('notification', handleNotification);
        socketCtx.socket.on('new_message', handleMessage);
        socketCtx.socket.on('receive_message', handleMessage);

        console.log('✅ Conversation list listeners attached');

        return () => {
            console.log('🔇 Removing conversation list listeners');
            if (socketCtx?.socket) {
                socketCtx.socket.off('notification', handleNotification);
                socketCtx.socket.off('new_message', handleMessage);
                socketCtx.socket.off('receive_message', handleMessage);
            }
        };
    }, [socketCtx?.socket, socketCtx?.connected, receiverId]);

    const handleDeleteConversation = async (conversation) => {
        console.log("🗑️ Deleting conversation:", conversation.id);

        // ✅ Optimistic update
        setConversations((prev) =>
            prev.filter((c) => String(c.id) !== String(conversation.id))
        );

        if (String(receiverId) === String(conversation.other_user_id)) {
            navigate(getRolePath("/chats"));
        }

        try {
            await ChatService.deleteConversation(conversation.id);
            console.log("✅ Delete successful");
        } catch (err) {
            console.error("Delete failed, rolling back:", err);
            if (isMountedRef.current) {
                setConversations((prev) => [conversation, ...prev]);
            }
        }
    };

    const openChat = async (conv) => {
        try {
            const info = {
                id: conv.other_user_id,
                name: conv.name,
                avatar: conv.avatar,
                online: conv.is_online,
                location: conv.location,
                is_blurred_images: conv.is_blurred_images,
                is_show_last_seen: conv.is_show_last_seen,
            };
            setReceiverInfo(info);
            navigate(`${getRolePath("/chats")}?receiver_id=${conv.other_user_id}`, {
                state: { receiver: info }
            });
        } catch (error) {
            console.error('Error opening chat:', error);
        }
    };

    const openMatchChat = (match) => {
        try {
            const info = {
                id: match.id,
                name: match.name,
                avatar: match.photo
            };
            setReceiverInfo(info);
            navigate(getRolePath("/profile"), {
                state: { profile: match }
            });
        } catch (error) {
            console.error('Error opening match chat:', error);
        }
    };

    return (
        <div style={{
            display: "flex",
            height: "100%",
            fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
            {(!isMobile || !receiverId) && (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    width: isMobile ? "100%" : "360px",
                    borderRight: "0.5px solid rgba(27,77,62,0.08)",
                }}>
                    <PageHeader
                        title="Chats"
                        subtitle="Your halal conversations and connections"
                        icon={undefined}
                    />

                    {loadingConvs ? (
                        <ConversationSkeleton count={6} />
                    ) : (
                        <ConversationsList
                            conversations={conversations}
                            activeId={receiverId}
                            onClick={openChat}
                            onDelete={handleDeleteConversation}
                        />
                    )}
                </div>
            )}

            {(receiverId || !isMobile) && (
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                }}>
                    <AnimatePresence mode="wait">
                        {receiverId ? (
                            <motion.div
                                key={receiverId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ display: "flex", flexDirection: "column", height: "100%" }}
                            >
                                <MessageView
                                    receiverId={receiverId}
                                    receiverInfo={receiverInfo}
                                    onBack={() => navigate(getRolePath("/chats"))}
                                    onViewProfile={() => { }}
                                    isMobile={isMobile}
                                    currentUserRole={currentUserRole} matchid={matchId} />
                            </motion.div>
                        ) : (
                            <div style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                gap: "12px",
                                padding: "24px"
                            }}>
                                <div style={{
                                    width: "64px",
                                    height: "64px",
                                    borderRadius: "20px",
                                    background: "#f0f5f3",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "28px"
                                }}>
                                    💬
                                </div>
                                <p style={{
                                    margin: 0,
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#6b7280"
                                }}>
                                    Select a conversation to start chatting
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

// ============================================
// MESSAGE VIEW COMPONENT
// ============================================

function MessageView({ matchid,
    receiverId,
    receiverInfo: initialReceiverInfo,
    onBack,
    onViewProfile,
    isMobile,
    currentUserRole
}) {
    const senderId = getSenderId();
    const { socket } = useSocket();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [connected, setConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [receiverInfo, setReceiverInfo] = useState(initialReceiverInfo);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimerRef = useRef(null);
    const isMountedRef = useRef(true);

    // ✅ Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }
        };
    }, []);

    const formatTime = (ts) => {
        try {
            return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    };

    const showTimestamp = (idx) => {
        try {
            return idx === 0 ||
                // @ts-ignore
                new Date(messages[idx].created_at) - new Date(messages[idx - 1].created_at) > 5 * 60 * 1000;
        } catch (error) {
            console.error('Error checking timestamp:', error);
            return false;
        }
    };

    const fetchMessages = useCallback(async () => {
        try {
            const data = await ChatService.getMessages({ receiverId });
            if (data.success && isMountedRef.current) {
                setMessages(data.data);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    }, [receiverId]);

    // ✅ Socket connection status
    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => {
            if (isMountedRef.current) {
                setConnected(true);
            }
        };

        const handleDisconnect = () => {
            if (isMountedRef.current) {
                setConnected(false);
            }
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        if (socket.connected && isMountedRef.current) {
            setConnected(true);
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
        };
    }, [socket]);

    // ✅ Fetch messages and setup socket listeners
    useEffect(() => {
        if (!socket || !receiverId || !senderId) return;

        fetchMessages();

        const handleNewMessage = (msg) => {
            console.log('📨 New message in MessageView:', msg);

            const isRelevant =
                (String(msg.sender_id) === String(receiverId) && String(msg.receiver_id) === String(senderId)) ||
                (String(msg.sender_id) === String(senderId) && String(msg.receiver_id) === String(receiverId));

            if (isRelevant && isMountedRef.current) {
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                setIsTyping(false);
            }
        };

        const handleSeen = () => {
            if (!isMountedRef.current) return;

            setMessages(prev =>
                prev.map(m =>
                    String(m.sender_id) === String(senderId) ? { ...m, is_seen: true } : m
                )
            );
        };

        const handleTypingStart = ({ from }) => {
            if (String(from) === String(receiverId) && isMountedRef.current) {
                setIsTyping(true);
            }
        };

        const handleTypingStop = ({ from }) => {
            if (String(from) === String(receiverId) && isMountedRef.current) {
                setIsTyping(false);
            }
        };

        socket.on("new_message", handleNewMessage);
        socket.on("messages_seen", handleSeen);
        socket.on("typing", handleTypingStart);
        socket.on("stop_typing", handleTypingStop);

        return () => {
            socket.off("new_message", handleNewMessage);
            socket.off("messages_seen", handleSeen);
            socket.off("typing", handleTypingStart);
            socket.off("stop_typing", handleTypingStop);
        };
    }, [socket, receiverId, senderId, fetchMessages]);

    // ✅ Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleTypingChange = (e) => {
        if (!isMountedRef.current) return;

        setInput(e.target.value);

        if (socket) {
            socket.emit("typing", { to: receiverId, from: senderId });

            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }

            typingTimerRef.current = setTimeout(() => {
                if (socket && isMountedRef.current) {
                    socket.emit("stop_typing", { to: receiverId, from: senderId });
                }
            }, 1500);
        }
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || sending || !isMountedRef.current) return;

        const tempId = `tmp_${Date.now()}`;
        const optimistic = {
            id: tempId,
            sender_id: senderId,
            receiver_id: receiverId,
            message: text,
            is_seen: false,
            created_at: new Date().toISOString(),
        };

        setMessages(p => [...p, optimistic]);
        setInput("");
        setSending(true);

        if (socket) {
            socket.emit("stop_typing", { to: receiverId, from: senderId });
        }

        try {
            const data = await ChatService.sendMessage({ receiverId, message: text });

            if (!isMountedRef.current) return;

            if (data.success) {
                setMessages(p => p.map(m => m.id === tempId ? data.data : m));
            } else {
                setMessages(p => p.filter(m => m.id !== tempId));
            }
        } catch (err) {
            console.error('Error sending message:', err);
            if (isMountedRef.current) {
                setMessages(p => p.filter(m => m.id !== tempId));
            }
        } finally {
            if (isMountedRef.current) {
                setSending(false);
            }
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <ChatHeader
                receiverInfo={receiverInfo}
                receiverId={receiverId}
                connected={connected}
                isTyping={isTyping}
                onBack={onBack}
                onViewProfile={onViewProfile}

                // @ts-ignore
                onPhone={undefined}
                onVideo={undefined}
                onInfo={undefined}
            />

            <div style={{
                flex: 1,
                overflowY: "auto",
                minHeight: 0,
                padding: "20px 16px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
            }}>
                {messages.map((msg, idx) => (
                    <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isMine={String(msg.sender_id) === String(senderId)}
                        formatTime={formatTime}
                        showTimestamp={showTimestamp(idx)}
                        avatarLetter={undefined}
                    />
                ))}
                {isTyping && <TypingIndicator avatarLetter={undefined} />}
                <div ref={bottomRef} />
            </div>

            <MessageInput
                input={input}
                onChange={handleTypingChange}
                onSend={sendMessage}
                sending={sending}
                inputRef={inputRef}
                onKeyDown={undefined}
            />

        </div>
    );
}
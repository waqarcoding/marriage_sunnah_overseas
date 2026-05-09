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
import ExploreService from "../../explore/services/ExploreService";
import AuthService from "../../auth/services/AuthService";
import PageHeader from "../../../ui/page_header";

function getSenderId() {
    try {
        return JSON.parse(atob(localStorage.getItem("jwtToken").split(".")[1])).id;
    } catch {
        return null;
    }
}

function getUserRole() {
    try {
        return JSON.parse(atob(localStorage.getItem("jwtToken").split(".")[1])).role;
    } catch {
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

export default function ChatPage() {
    const [searchParams] = useSearchParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const socketCtx = useSocket();

    // Get the current user's role
    const [currentUserRole, setCurrentUserRole] = useState(getUserRole());

    useEffect(() => {
        async function fetchUser() {
            try {
                const user = await AuthService.getCurrentUser();
                setCurrentUserRole(user?.role || null);
            } catch (err) {
                setCurrentUserRole(null);
            }
        }
        fetchUser();
    }, []);

    // ✅ Helper function to get role-based path
    const getRolePath = useCallback((path) => {
        const role = currentUserRole || getUserRole();
        const prefix = role === 'guardian' ? '/guardian' : '/individual';
        return `${prefix}${path}`;
    }, [currentUserRole]);

    const receiverId = searchParams.get("receiver_id");

    const [conversations, setConversations] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [receiverInfo, setReceiverInfo] = useState(state?.receiver || null);
    const [currentUser, setUser] = useState(null);

    // When user lands on a chat, clear their unread count by calling the backend endpoint.
    useEffect(() => {
        const clearUnreadCount = async () => {
            if (!receiverId) return;
            try {
                await ChatService.clearUnreadCount();
                if (socketCtx) {
                    socketCtx.setChatCount(0);
                }
            } catch (err) {
                console.error('Failed to clear unread count:', err);
            }
        };

        clearUnreadCount();
    }, [receiverId, socketCtx]);

    // ✅ Extracted fetch function so it can be reused
    const fetchConversations = async () => {
        try {
            const res = await ChatService.getConversationUsers();
            console.log('📊 Full API response:', res);
            console.log('📊 Conversations received:', res.data);
            console.log('📊 Unread counts:', res.data?.map(c => ({
                name: c.name,
                unread_count: c.unread_count,
                unread: c.unread
            })));

            if (res.success) setConversations(res.data);
        } catch (err) {
            console.error('Error loading conversations:', err);
        } finally {
            setLoadingConvs(false);
        }
    };

    // ✅ Initial load
    useEffect(() => {
        fetchConversations();
    }, []);

    // ✅ Update unread count when entering a chat
    useEffect(() => {
        if (!receiverId) return;
        if (socketCtx) socketCtx.setChatCount(0);

        const fetchUnreadCount = async () => {
            try {
                const response = await ChatService.getUnreadCount();
                if (response.success && socketCtx) {
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
                        if (res.success && res.data) {
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
                            if (res.success && res.data) {
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
            socketCtx.socket.off('notification', handleNotification);
            socketCtx.socket.off('new_message', handleMessage);
            socketCtx.socket.off('receive_message', handleMessage);
        };
    }, [socketCtx?.socket, socketCtx?.connected, receiverId]);

    const handleDeleteConversation = async (conversation) => {
        console.log("🗑️ Deleting conversation:", conversation.id);

        setConversations((prev) =>
            prev.filter((c) => String(c.id) !== String(conversation.id))
        );

        if (String(receiverId) === String(conversation.other_user_id)) {
            navigate(getRolePath("/chats")); // ✅ Role-based path
        }

        try {
            await ChatService.deleteConversation(conversation.id);
            console.log("✅ Delete successful");
        } catch (err) {
            console.error("Delete failed, rolling back:", err);
            setConversations((prev) => [conversation, ...prev]);
        }
    };

    const openChat = async (conv) => {
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
        navigate(`${getRolePath("/chats")}?receiver_id=${conv.other_user_id}`, { state: { receiver: info } }); // ✅ Role-based path
    };

    const openMatchChat = (match) => {
        const info = { id: match.id, name: match.name, avatar: match.photo };
        setReceiverInfo(info);
        navigate(getRolePath("/profile"), { state: { profile: match } }); // ✅ Role-based path
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
                        subtitle="Your halal conversations and connections" icon={undefined}
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
                                    onBack={() => navigate(getRolePath("/chats"))} // ✅ Role-based path
                                    //  onViewProfile={() => navigate(getRolePath("/profile"), { state: { profile: currentUser } })} // ✅ Role-based path
                                    onViewProfile={() => { }}

                                    isMobile={isMobile}
                                    currentUserRole={currentUserRole}
                                />
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

// ════════════════════════════════════════════════
function MessageView({ receiverId, receiverInfo: initialReceiverInfo, onBack, onViewProfile, isMobile, currentUserRole }) {
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

    const formatTime = (ts) =>
        new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const showTimestamp = (idx) =>
        idx === 0 ||
        // @ts-ignore
        new Date(messages[idx].created_at) - new Date(messages[idx - 1].created_at) > 5 * 60 * 1000;

    const fetchMessages = useCallback(async () => {
        try {
            const data = await ChatService.getMessages({ receiverId });
            if (data.success) setMessages(data.data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    }, [receiverId]);

    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => setConnected(true);
        const handleDisconnect = () => setConnected(false);

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        if (socket.connected) setConnected(true);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket || !receiverId || !senderId) return;

        fetchMessages();

        const handleNewMessage = (msg) => {
            console.log('📨 New message in MessageView:', msg);

            const isRelevant =
                (String(msg.sender_id) === String(receiverId) && String(msg.receiver_id) === String(senderId)) ||
                (String(msg.sender_id) === String(senderId) && String(msg.receiver_id) === String(receiverId));

            if (isRelevant) {
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                setIsTyping(false);
            }
        };

        const handleSeen = () => {
            setMessages(prev =>
                prev.map(m =>
                    String(m.sender_id) === String(senderId) ? { ...m, is_seen: true } : m
                )
            );
        };

        const handleTypingStart = ({ from }) => {
            if (String(from) === String(receiverId)) {
                setIsTyping(true);
            }
        };

        const handleTypingStop = ({ from }) => {
            if (String(from) === String(receiverId)) {
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

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleTypingChange = (e) => {
        setInput(e.target.value);

        if (socket) {
            socket.emit("typing", { to: receiverId, from: senderId });

            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = setTimeout(() => {
                socket.emit("stop_typing", { to: receiverId, from: senderId });
            }, 1500);
        }
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || sending) return;

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
            if (data.success) {
                setMessages(p => p.map(m => m.id === tempId ? data.data : m));
            } else {
                setMessages(p => p.filter(m => m.id !== tempId));
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setMessages(p => p.filter(m => m.id !== tempId));
        } finally {
            setSending(false);
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
                onPhone={undefined}
                onVideo={undefined}
                onInfo={undefined}
            />

            <div style={{
                flex: 1,
                overflowY: "auto",
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
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

import ChatService from "../api/ChatService";

import NewMatches from "../components/NewMatches";
import ConversationsList from "../components/ConversationsList";
import ConversationSkeleton from "../components/ConversationSkeleton";
import ChatHeader from "../components/ChatHeader";
import MessageBubble from "../components/MessageBubble";
import TypingIndicator from "../components/TypingIndicator";
import MessageInput from "../components/MessageInput";
import { useSocket } from "../../../sockets/SocketContext";
import ExploreService from "../../explore/api/ExploreService";

function getSenderId() {
    try {
        return JSON.parse(atob(localStorage.getItem("jwtToken").split(".")[1])).id;
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

    const receiverId = searchParams.get("receiver_id");

    const [conversations, setConversations] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [receiverInfo, setReceiverInfo] = useState(state?.receiver || null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await ChatService.getConversationUsers();
                if (res.success) setConversations(res.data);

                const matches = await ExploreService.getExplore();
                const list = matches?.profiles || matches?.data?.profiles || [];
                if (matches.success) setMatches(list.length <= 5 ? list : list.slice(-5));
            } catch { }
            finally { setLoadingConvs(false); }
        };
        load();
    }, []);

    const openChat = async (conv) => {
        const info = {
            id: conv.id,
            name: conv.name,
            avatar: conv.avatar,
            online: conv.is_online,
            location: conv.location,
        };
        setReceiverInfo(info);
        navigate(`/chats?receiver_id=${conv.other_user_id}`, { state: { receiver: info } });
    };

    const openMatchChat = (match) => {
        const info = { id: match.id, name: match.name, avatar: match.photo };
        setReceiverInfo(info);
        navigate("/profile", { state: { profile: match } });
    };

    // ── Delete conversation ───────────────────────────────────────────────────
    const handleDeleteConversation = async (conversation) => {
        // 1. Optimistically remove from list immediately
        setConversations((prev) => prev.filter((c) => c.id !== conversation.id));

        // 2. If we're currently viewing this conversation, go back to list
        if (String(receiverId) === String(conversation.other_user_id)) {
            navigate("/chats");
        }

        // 3. Call API
        try {
            await ChatService.deleteConversation(conversation.id);
        } catch (err) {
            console.error("Delete failed, rolling back:", err);
            // Roll back — put the conversation back in the right spot
            setConversations((prev) => {
                const exists = prev.find((c) => c.id === conversation.id);
                if (exists) return prev;
                return [conversation, ...prev];
            });
        }
    };

    return (
        <div className="flex h-full font-sans">
            {(!isMobile || !receiverId) && (
                <div className="flex flex-col border-r w-full md:w-80 lg:w-96 bg-white">
                    <NewMatches matches={matches} onClick={openMatchChat} />

                    {loadingConvs ? (
                        <ConversationSkeleton count={6} />
                    ) : (
                        <ConversationsList
                            conversations={conversations}
                            // @ts-ignore
                            activeId={receiverId}
                            onClick={openChat}
                            onDelete={handleDeleteConversation}
                        />
                    )}
                </div>
            )}

            {(receiverId || !isMobile) && (
                <div className="flex-1 flex flex-col bg-white">
                    <AnimatePresence mode="wait">
                        {receiverId ? (
                            <motion.div
                                key={receiverId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col h-full"
                            >
                                <MessageView
                                    receiverId={receiverId}
                                    receiverInfo={receiverInfo}
                                    onBack={() => navigate("/chats")}
                                    onViewProfile={() => navigate("/profile", { state: { profile: receiverInfo } })}
                                    isMobile={isMobile}
                                />
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <p>Select a conversation</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════

function MessageView({ receiverId, receiverInfo: initialReceiverInfo, onBack, onViewProfile, isMobile }) {
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
    const typingTimer = useRef(null);

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
        } catch { }
    }, [receiverId]);

    useEffect(() => {
        if (!socket) return;
        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));
        return () => {
            socket.off("connect");
            socket.off("disconnect");
        };
    }, [socket]);

    useEffect(() => {
        if (!socket || !receiverId || !senderId) return;

        fetchMessages();

        const handleNewMessage = (msg) => {
            fetchMessages();
            if (
                String(msg.sender_id) === String(receiverId) ||
                String(msg.receiver_id) === String(receiverId)
            ) {
                setMessages(prev =>
                    prev.some(m => m.id === msg.id) ? prev : [...prev, msg]
                );
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

        const handleTyping = ({ from }) => {
            if (String(from) === String(receiverId)) setIsTyping(true);
        };

        const handleStopTyping = ({ from }) => {
            if (String(from) === String(receiverId)) setIsTyping(false);
        };

        socket.on("new_message", handleNewMessage);
        socket.on("messages_seen", handleSeen);
        socket.on("typing", handleTyping);
        socket.on("stop_typing", handleStopTyping);

        return () => {
            socket.off("new_message", handleNewMessage);
            socket.off("messages_seen", handleSeen);
            socket.off("typing", handleTyping);
            socket.off("stop_typing", handleStopTyping);
        };
    }, [socket, receiverId, senderId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleTyping = (e) => {
        setInput(e.target.value);
        socket?.emit("typing", { to: receiverId, from: senderId });
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => {
            socket?.emit("stop_typing", { to: receiverId, from: senderId });
        }, 1500);
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
        socket?.emit("stop_typing", { to: receiverId, from: senderId });

        try {
            const data = await ChatService.sendMessage({ receiverId, message: text });
            if (data.success) {
                setMessages(p => p.map(m => m.id === tempId ? data.data : m));
            } else {
                setMessages(p => p.filter(m => m.id !== tempId));
            }
        } catch {
            setMessages(p => p.filter(m => m.id !== tempId));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
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

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
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
                onChange={handleTyping}
                onSend={sendMessage}
                sending={sending}
                inputRef={inputRef}
                onKeyDown={undefined}
            />
        </div>
    );
}
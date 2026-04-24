// src/socket/SocketContext.jsx
// Single shared socket instance for the entire app
// Provides: socket, badge counts, and setters

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

// @ts-ignore
const SERVER_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL?.replace('/api', '');

const SocketContext = createContext(null);

export function SocketProvider({ userId, children }) {
  const connectedRef = useRef(false);

  // ✅ socket as STATE — so consumers re-render when socket is ready
  const [socket, setSocket] = useState(null);
  const [interestCount, setInterestCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [guardianCount, setGuardianCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!userId) return;
    if (connectedRef.current) return; // prevent StrictMode double-connect
    connectedRef.current = true;

    const s = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      auth: { token: localStorage.getItem('jwtToken') },
    });

    s.on('connect', () => {
      console.log('🔌 Socket connected:', s.id);
      s.emit('join', userId);
    });

    s.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    s.on('connect_error', (err) => {
      console.warn('🔌 Socket connection error:', err.message);
    });

    // ── Badge count events ────────────────────────────────
    // Server pushes exact count after any interest action
    s.on('interest_count', ({ count }) => {
      setInterestCount(Number(count));
    });

    // Increment interest badge immediately on new interest
    s.on('interest_received', () => {
      setInterestCount(prev => prev + 1);
    });


    // Guardian badge count
    s.on('guardian_pending_count', ({ count }) => {
      setGuardianCount(Number(count));
    });

    // ── Toast notification events ─────────────────────────

    // 💌 New interest received
    s.on('interest_received', (data) => {
      if (window.location.pathname === '/interest') return;
      toast(`💌 ${data.sender_name || 'Someone'} sent you an interest`, { duration: 5000 });
    });

    // ✅ Interest accepted
    s.on('interest_accepted', (data) => {
      toast.success(`${data.accepted_by_name || 'Someone'} accepted your interest ✅`, { duration: 5000 });
    });

    // ❌ Interest declined
    s.on('interest_declined', (data) => {
      toast.error(`${data.declined_by_name || 'Someone'} declined your interest`, { duration: 4000 });
    });

    // 🚫 Interest cancelled
    s.on('interest_cancelled', () => {
      toast(`🚫 An interest was cancelled`, { duration: 3000 });
    });

    // 💞 New match
    s.on('new_match', (data) => {
      toast.success(`💞 You matched with ${data.matched_with_name || 'someone'}! 🎉`, { duration: 6000 });
    });

    // 📩 New message toast
    s.on('new_message', (data) => {
      setChatCount(prev => prev + 1);
      if (window.location.pathname === '/chats') return;
      const preview = (data.body || '').slice(0, 40);
      toast(`📩 ${data.sender_name || 'Message'}: ${preview}`, { duration: 4000 });
    });

    // 🕌 Guardian approved
    s.on('guardian_approved', (data) => {
      toast.success(`🕌 ${data.guardian_name || 'Your guardian'} approved your interest`, { duration: 5000 });
    });

    // 🕌 Guardian rejected
    s.on('guardian_rejected', (data) => {
      toast.error(`🕌 ${data.guardian_name || 'Your guardian'} rejected your interest`, { duration: 5000 });
    });

    // 🤝 Guardian assigned (received by guardian role)
    s.on('guardian_assigned', (data) => {
      toast(`🤝 ${data.ward_name || 'Someone'} assigned you as their guardian`, { duration: 5000 });
    });

    // 🗑️ Guardian removed (received by guardian role)
    s.on('guardian_removed', (data) => {
      toast(`🗑️ ${data.ward_name || 'Someone'} removed you as guardian`, { duration: 4000 });
    });

    // --- Message/Chat events for ChatPage.jsx (200-215) ---
    // These events are handled in ChatPage (private instance), not globally here

    s.on("messages_seen", () => { });
    s.on("typing", () => { });
    s.on("stop_typing", () => { });
    // --- End new message/typing event wiring for chat pages ---

    // ✅ Set socket into STATE so consumers get the real socket instance
    setSocket(s);

    return () => {
      connectedRef.current = false;
      s.disconnect();
      setSocket(null);
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{
      socket,
      interestCount, setInterestCount,
      chatCount, setChatCount,
      guardianCount, setGuardianCount,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

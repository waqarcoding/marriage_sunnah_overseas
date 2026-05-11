// @ts-nocheck
// src/sockets/SocketContext.jsx

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const SocketContext = createContext(null);

let _socket = null;
let _userId = null;
let _badgeSetters = null;

// ─────────────────────────────────────────
// DESTROY
// ─────────────────────────────────────────
function destroySocket() {
  if (_socket) {
    _socket.removeAllListeners();
    _socket.disconnect();
    _socket = null;
    _userId = null;
    _badgeSetters = null;
  }
}

// ─────────────────────────────────────────
// CREATE SOCKET
// ─────────────────────────────────────────
function createSocket(userId, setters) {
  if (_socket && String(_userId) === String(userId)) return _socket;

  destroySocket();

  _userId = userId;
  _badgeSetters = setters;

  const s = io(SERVER_URL, {
    path: '/api/socket.io/',
    transports: ['polling'],  // ✅ FIXED: polling first for DigitalOcean
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    auth: { token: localStorage.getItem('jwtToken') },
  });

  // ─────────────────────────────────────────
  // CONNECT
  // ─────────────────────────────────────────
  s.on('connect', () => {
    console.log('🔌 Connected:', s.id);
    s.emit('join', userId);
  });

  s.on('disconnect', (reason) => {
    console.log('🔌 Disconnected:', reason);
  });

  s.on('connect_error', (err) => {
    console.warn('🔌 Error:', err.message);
  });

  // ─────────────────────────────────────────
  // 🔔 MAIN NOTIFICATION HANDLER (NEW)
  // ─────────────────────────────────────────
  s.on('notification', (n) => {
    console.log('🔔 Notification:', n);

    const { type, message, data } = n;

    // 🎯 Smart UI behavior per type
    switch (type) {
      case 'interest_received':
        _badgeSetters?.setInterestCount((prev) => prev + 1);
        toast(`💌 ${message}`);
        break;

      case 'interest_accepted':
        toast.success(message);
        break;

      case 'interest_declined':
        toast.error(message);
        break;

      case 'interest_cancelled':
        toast(message);
        break;

      case 'guardian_new_interest':
        _badgeSetters?.setGuardianCount((prev) => prev + 1);
        toast(`🕌 ${message}`);
        break;

      case 'new_match':
        toast.success(`💞 ${message}`);
        break;

      case 'new_message':
        _badgeSetters?.setChatCount((prev) => prev + 1);
        toast(`📨 ${message}`);
        break;

      case 'guardian_approved':
        toast.success(message);
        _badgeSetters?.setGuardianCount((prev) => Math.max(0, prev - 1));
        break;

      case 'guardian_rejected':
        toast.error(message);
        break;

      case 'guardian_assigned':
      case 'guardian_removed':
      case 'ward_added':
      case 'ward_removed':
        toast(message);
        break;

      default:
        console.log('Unhandled notification type:', type);
    }
  });

  // ─────────────────────────────────────────
  // 🔢 COUNTERS (REAL-TIME)
  // ─────────────────────────────────────────
  s.on('interest_count', ({ count }) => {
    _badgeSetters?.setInterestCount(Number(count));
  });

  s.on('guardian_pending_count', ({ count }) => {
    _badgeSetters?.setGuardianCount(Number(count));
  });

  s.on('chat_count_update', ({ count }) => {
    _badgeSetters?.setChatCount(Number(count));
  });

  s.on('credit_update', ({ credits }) => {
    _badgeSetters?.setCredits(Number(credits));
  });

  // ─────────────────────────────────────────
  // 💬 CHAT REAL-TIME (no DB)
  // ─────────────────────────────────────────
  s.on('typing', ({ from }) => {
    console.log('✍️ typing from:', from);
  });

  s.on('stop_typing', ({ from }) => {
    console.log('✋ stop typing from:', from);
  });

  // ─────────────────────────────────────────
  // 🟢 ONLINE STATUS
  // ─────────────────────────────────────────
  s.on('user_online', (userId) => {
    console.log('🟢 User online:', userId);
  });

  s.on('user_offline', (userId) => {
    console.log('⚫ User offline:', userId);
  });

  _socket = s;
  return s;
}

// ─────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────
export function SocketProvider({ userId, children }) {
  const [interestCount, setInterestCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [guardianCount, setGuardianCount] = useState(0);
  const [credits, setCredits] = useState(0);

  const [connected, setConnected] = useState(false);
  const [socketInst, setSocketInst] = useState(null);
  const isMountedRef = useRef(true); // ✅ Track mount status

  const settersRef = useRef(null);
  settersRef.current = {
    setInterestCount,
    setChatCount,
    setGuardianCount,
    setCredits,
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (!userId) return;

    const proxy = {
      setInterestCount: (...a) => {
        if (isMountedRef.current) settersRef.current?.setInterestCount(...a);
      },
      setChatCount: (...a) => {
        if (isMountedRef.current) settersRef.current?.setChatCount(...a);
      },
      setGuardianCount: (...a) => {
        if (isMountedRef.current) settersRef.current?.setGuardianCount(...a);
      },
      setCredits: (...a) => {
        if (isMountedRef.current) settersRef.current?.setCredits(...a);
      },
    };

    const s = createSocket(userId, proxy);

    if (isMountedRef.current) {
      setSocketInst(s);
    }

    const onConnect = () => {
      if (isMountedRef.current) setConnected(true);
    };

    const onDisconnect = () => {
      if (isMountedRef.current) setConnected(false);
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    if (s.connected && isMountedRef.current) {
      setConnected(true);
    }

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, [userId]);

  useEffect(() => {
    if (!userId && _socket) {
      // ✅ Defer cleanup to avoid DOM issues
      const timer = setTimeout(() => {
        destroySocket();
        if (isMountedRef.current) {
          setSocketInst(null);
          setConnected(false);
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [userId]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Don't destroy socket on unmount - keep it alive for app
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketInst,
        connected,

        interestCount,
        setInterestCount,

        chatCount,
        setChatCount,

        guardianCount,
        setGuardianCount,

        credits,
        setCredits,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// ─────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────
export function useSocket() {
  return useContext(SocketContext);
}
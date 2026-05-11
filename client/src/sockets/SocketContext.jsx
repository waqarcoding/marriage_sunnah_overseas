// @ts-nocheck
// src/sockets/SocketContext.jsx

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

// ✅ FIXED: Determine socket URL based on environment
const getSocketURL = () => {
  // If VITE_SOCKET_URL is explicitly set, use it
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  // Otherwise, use VITE_BASE_URL without /api suffix
  if (import.meta.env.VITE_BASE_URL) {
    return import.meta.env.VITE_BASE_URL.replace('/api', '');
  }

  // Fallback to production URL
  return 'https://marriage-sunna-overseas-wceze.ondigitalocean.app';
};

const SOCKET_URL = getSocketURL();

console.log('🔌 Socket URL:', SOCKET_URL);

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
    console.log('🔌 Socket destroyed');
  }
}

// ─────────────────────────────────────────
// CREATE SOCKET
// ─────────────────────────────────────────
function createSocket(userId, setters) {
  if (_socket && String(_userId) === String(userId)) {
    console.log('✅ Reusing existing socket connection');
    return _socket;
  }

  destroySocket();

  _userId = userId;
  _badgeSetters = setters;

  console.log('🔌 Creating new socket connection...');
  console.log('   URL:', SOCKET_URL);
  console.log('   Path: /api/socket.io/');
  console.log('   User ID:', userId);

  const s = io(SOCKET_URL, {
    path: '/api/socket.io/',
    transports: ['polling', 'websocket'],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    auth: {
      token: localStorage.getItem('jwtToken')
    },
  });

  // ─────────────────────────────────────────
  // CONNECT
  // ─────────────────────────────────────────
  s.on('connect', () => {
    console.log('✅ Socket connected:', s.id);
    console.log('   Transport:', s.io.engine.transport.name);
    s.emit('join', userId);
  });

  s.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  s.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
    console.error('   URL attempted:', SOCKET_URL);
    console.error('   Path attempted: /socket.io/');
  });

  s.on('reconnect', (attemptNumber) => {
    console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
  });

  s.on('reconnect_error', (err) => {
    console.error('❌ Socket reconnection error:', err.message);
  });

  s.on('reconnect_failed', () => {
    console.error('❌ Socket reconnection failed after max attempts');
  });

  // ─────────────────────────────────────────
  // 🔔 MAIN NOTIFICATION HANDLER (NEW)
  // ─────────────────────────────────────────
  s.on('notification', (n) => {
    console.log('🔔 Notification received:', n);

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
        console.log('⚠️ Unhandled notification type:', type);
    }
  });

  // ─────────────────────────────────────────
  // 🔢 COUNTERS (REAL-TIME)
  // ─────────────────────────────────────────
  s.on('interest_count', ({ count }) => {
    console.log('📊 Interest count update:', count);
    _badgeSetters?.setInterestCount(Number(count));
  });

  s.on('guardian_pending_count', ({ count }) => {
    console.log('📊 Guardian count update:', count);
    _badgeSetters?.setGuardianCount(Number(count));
  });

  s.on('chat_count_update', ({ count }) => {
    console.log('📊 Chat count update:', count);
    _badgeSetters?.setChatCount(Number(count));
  });

  s.on('credit_update', ({ credits }) => {
    console.log('📊 Credit update:', credits);
    _badgeSetters?.setCredits(Number(credits));
  });

  // ─────────────────────────────────────────
  // 💬 CHAT REAL-TIME (no DB)
  // ─────────────────────────────────────────
  s.on('typing', ({ from }) => {
    console.log('✍️ User typing:', from);
  });

  s.on('stop_typing', ({ from }) => {
    console.log('✋ User stopped typing:', from);
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
  const isMountedRef = useRef(true);

  const settersRef = useRef(null);
  settersRef.current = {
    setInterestCount,
    setChatCount,
    setGuardianCount,
    setCredits,
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (!userId) {
      console.log('⚠️ No userId provided, skipping socket connection');
      return;
    }

    console.log('🔌 Initializing socket for user:', userId);

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
      console.log('✅ Socket provider: connected');
      if (isMountedRef.current) setConnected(true);
    };

    const onDisconnect = () => {
      console.log('🔌 Socket provider: disconnected');
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

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
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
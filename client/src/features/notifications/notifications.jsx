import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../api/Api";
import { io } from "socket.io-client";
import AuthApi from "../../features/auth/services/AuthService";

let socket;

const ICON_CONFIG = {
    new_message: {
        bg: "bg-[#E1F5EE]",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
    interest_received: {
        bg: "bg-[#FBEAF0]",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#993556" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        ),
    },
    new_match: {
        bg: "bg-[#E6F1FB]",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    guardian_approved: {
        bg: "bg-[#EAF3DE]",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        ),
    },
    guardian_rejected: {
        bg: "bg-[#FCEBEB]",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A32D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        ),
    },
    default: {
        bg: "bg-[#F1EFE8]",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F5E5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
        ),
    },
};

function formatTime(ts) {
    if (!ts) return "";
    const date = new Date(ts);
    const now = new Date();
    // @ts-ignore
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        init();
        const userId = AuthApi.getUserId();

        if (!socket) {
            // @ts-ignore
            socket = io(import.meta.env.VITE_BASE_URL, {
                transports: ["websocket", "polling"],
                auth: { token: localStorage.getItem("jwtToken") },
            });
        }

        if (userId) socket.emit("join", userId);

        const handleNotification = (data) => {
            setNotifications((prev) => [{ ...data, is_read: false }, ...prev]);
        };

        socket.on("notification", handleNotification);
        return () => socket.off("notification", handleNotification);
    }, []);

    const init = async () => {
        await fetchNotifications();
        await markAllAsSeen();
    };

    const fetchNotifications = async () => {
        try {
            const res = await Api.get("/notifications");
            console.log("data:", res);
            setNotifications(res || []);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };
    const markAllAsSeen = async () => {
        /*
         try {
             await Api.post("/notifications/mark-all-seen");
             setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
         } catch (err) {
             console.error("Failed to mark all as seen", err);
         }
        */
    };

    const markAsRead = async (id) => {
        try {
            await Api.post(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };
    const handleClick = (n) => {
        markAsRead(n.id);


    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const today = notifications.filter((n) => {
        const d = new Date(n.created_at);
        const now = new Date();
        return d.toDateString() === now.toDateString();
    });

    const earlier = notifications.filter((n) => {
        const d = new Date(n.created_at);
        const now = new Date();
        return d.toDateString() !== now.toDateString();
    });

    const renderCard = (n) => {
        const cfg = ICON_CONFIG[n.type] || ICON_CONFIG.default;
        const avatar = n.data?.sender_image;

        return (
            <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-150 hover:-translate-y-px
                    ${n.is_read
                        ? "border-gray-200 hover:bg-gray-50"
                        : "bg-[#f0fdf8] border-[#d1fae5] hover:bg-[#e6faf4]"
                    }`}
                style={{
                    background: n.is_read ? "var(--background)" : undefined,
                }}
            >
                {/* Avatar or Icon */}
                <div className="relative flex-shrink-0 mt-0.5">
                    {avatar ? (
                        <img
                            src={avatar}
                            alt={n.data?.sender_name || ""}
                            onError={e => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(n.data?.sender_name || "U")}&background=E1F5EE&color=0F6E56&size=40`;
                            }}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cfg.bg}`}>
                            {cfg.icon}
                        </div>
                    )}
                    {/* Type icon badge on avatar */}
                    {avatar && (
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${cfg.bg}`}>
                            <div className="scale-75">{cfg.icon}</div>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--card-foreground)" }}>
                            {n.title}
                        </p>
                        {!n.is_read && (
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--primary)" }} />
                        )}
                    </div>
                    <p className="text-[13px] leading-snug" style={{ color: "var(--muted-foreground)" }}>{n.message}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>{formatTime(n.created_at)}</p>
                </div>
            </div>
        );
    };

    return (
        <div
            className="w-full min-h-screen pb-8"
            style={{ background: "var(--background)", textAlign: "left" }}
        >
            {/* Header */}
            <div
                className="px-5 pt-6 pb-4 mb-3"
                style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}
            >
                <div className="flex items-center gap-3">

                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>

                    {/* Title */}
                    <div style={{ textAlign: "left" }}>
                        <p style={{
                            textAlign: "left",
                            margin: 0,
                            fontSize: 26,
                            fontWeight: 800,
                            color: "var(--card-foreground)",
                            letterSpacing: "-0.03em",
                            lineHeight: 1.2,
                        }}>
                            Notifications
                        </p>
                        <p style={{
                            textAlign: "left",
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 500,
                            color: "var(--muted-foreground)",
                        }}>
                            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                        </p>
                    </div>

                    {/* Badge */}
                    {unreadCount > 0 && (
                        <span
                            className="ml-auto text-xs font-bold rounded-full px-3 py-1"
                            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                        >
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>

            {/* Notification List */}
            <div className="px-4 flex flex-col gap-2">
                {notifications.length === 0 ? (
                    <div className="text-center pt-12">
                        <div
                            className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
                            style={{ background: "var(--secondary)" }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>No notifications yet</p>
                        <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>We'll let you know when something arrives.</p>
                    </div>
                ) : (
                    <>
                        {today.length > 0 && (
                            <>
                                <p className="text-[11px] font-bold tracking-widest uppercase px-1 pb-1" style={{ color: "var(--muted-foreground)" }}>Today</p>
                                {today.map(renderCard)}
                            </>
                        )}
                        {earlier.length > 0 && (
                            <>
                                <p className="text-[11px] font-bold tracking-widest uppercase px-1 pb-1 mt-3" style={{ color: "var(--muted-foreground)" }}>Earlier</p>
                                {earlier.map(renderCard)}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
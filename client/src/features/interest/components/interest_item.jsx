import React from "react";
import toast from "react-hot-toast";
import { FaComments } from "react-icons/fa";

export default function InterestItem({
    item,
    tab,
    onClick,
    onAccept,
    onReject,
    onCancel,
    onChat,
}) {
    const profile =
        tab === "sent"
            ? item.toProfile || {}
            : item.fromProfile || {};

    const name = profile.name || "Unknown User";
    const image = profile.image || "/placeholder.png";
    const location = [profile.city, profile.country].filter(Boolean).join(", ") || "Location unavailable";
    const isMutual = item.status === "accepted" && item.guardian_approved;

    const statusConfig = {
        pending: { label: "Pending", dot: "bg-amber-400", text: "text-amber-600", bg: "bg-amber-50  border-amber-100" },
        accepted: { label: "Accepted", dot: "bg-emerald-400", text: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
        rejected: { label: "Rejected", dot: "bg-red-400", text: "text-red-500", bg: "bg-red-50    border-red-100" },
    };

    const status = statusConfig[item.status] || statusConfig.pending;

    const guardianStatus = item.guardian_approved
        ? { label: "Guardian Approved", text: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", dot: "bg-emerald-400" }
        : { label: "Guardian Pending", text: "text-amber-600", bg: "bg-amber-50  border-amber-100", dot: "bg-amber-400" };

    return (
        <div
            onClick={() => onClick?.(profile)}
            className="group relative bg-white rounded-2xl mb-3 shadow-sm hover:shadow-lg
                border border-gray-100 hover:border-primary/20
                transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
            style={{ minHeight: 240 }}
        >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60
                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Main Content (Details - BLUR BOTTOM, show text ABOVE blur, blur separator, then image below) */}
            <div className="flex flex-col flex-1 z-10">
                <div className="flex-1 flex flex-col p-4 pb-0"> {/* Remove bottom padding, let blur edge */}
                    {/* Name row */}
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h2 className="font-bold text-gray-900 text-base leading-tight truncate">
                            {name}
                        </h2>
                        {isMutual && (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold
                                bg-primary/10 text-primary border border-primary/20">
                                ✦ Matched
                            </span>
                        )}
                    </div>

                    {/* Location */}
                    <p className="text-gray-400 text-xs flex items-center gap-1 mb-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {location}
                    </p>

                    {/* Status badges row */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {/* Interest status */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                            text-xs font-medium border ${status.bg} ${status.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {tab === "sent" ? `Interest ${status.label}` :
                                tab === "received" ? `Request ${status.label}` :
                                    "Mutual Accepted"}
                        </span>

                        {/* Guardian badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                            text-xs font-medium border ${guardianStatus.bg} ${guardianStatus.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${guardianStatus.dot}`} />
                            {guardianStatus.label}
                        </span>
                    </div>

                    {/* Actions */}
                    <div onClick={(e) => e.stopPropagation()} className="flex flex-wrap gap-2">
                        {/* Received: Accept / Reject */}
                        {tab === "received" && item.status === "pending" && (
                            <>
                                <button
                                    onClick={() => onAccept?.(item)}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold
                                        bg-primary text-white hover:bg-primary/90 active:scale-95
                                        transition-all duration-150 shadow-sm shadow-primary/20"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Accept
                                </button>
                                <button
                                    onClick={() => onReject?.(item)}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold
                                        border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500
                                        hover:bg-red-50 active:scale-95 transition-all duration-150"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Reject
                                </button>
                            </>
                        )}

                        {/* Sent: Cancel */}
                        {tab === "sent" && item.status === "pending" && (
                            <button
                                onClick={() => onCancel?.(item)}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold
                                    border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500
                                    hover:bg-red-50 active:scale-95 transition-all duration-150"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel Request
                            </button>
                        )}
                    </div>

                    {/* ── Chat Button ── */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isMutual) {
                                onChat?.(profile);
                            } else {
                                toast("Mutual interest and guardian approval required to chat.", {
                                    icon: "🔒",
                                    style: { borderRadius: "12px", fontSize: "13px" },
                                });
                            }
                        }}
                        className={`mt-3 flex-shrink-0 flex flex-col items-center gap-1 p-2.5 rounded-xl w-max
                            transition-all duration-200
                            ${isMutual
                                ? "text-primary hover:bg-primary/10 hover:scale-105 cursor-pointer"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                    >
                        <FaComments className="text-xl" />
                        <span className="text-xs font-medium">
                            {isMutual ? "Chat" : "Locked"}
                        </span>
                    </div>
                </div>

                {/* Mutual celebration banner */}
                {isMutual && (
                    <div className="mx-4 mt-2 mb-1 px-3 py-2 rounded-xl bg-gradient-to-r from-primary/8 to-primary/5
                        border border-primary/15 flex items-center gap-2">
                        <span className="text-sm">🤝</span>
                        <p className="text-xs text-primary/80 font-medium">
                            Alhamdulillah! Both families have approved. You may now communicate.
                        </p>
                    </div>
                )}

                {/* Blur divider above image */}
                <div
                    className="relative w-full h-12"
                    style={{
                        marginTop: 10,
                        pointerEvents: 'none',
                        zIndex: 2,
                    }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            background: "linear-gradient(to bottom, rgba(255,255,255,0.85), rgba(255,255,255,0.50) 60%, rgba(255,255,255,0))",
                            backdropFilter: "blur(12px)",
                        }}
                    />
                </div>
            </div>

            {/* Avatar at the bottom, bellow blur */}
            <div className="flex justify-center items-end pb-5 pt-1">
                <div className="relative flex-shrink-0 ">
                    <img
                        src={image}
                        alt={name}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100 shadow-lg"
                        style={{
                            marginTop: -34,
                            background: "#fff",
                        }}
                    />
                    {/* Online dot */}
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full
                        bg-emerald-400 border-2 border-white" />
                </div>
            </div>
        </div>
    );
}
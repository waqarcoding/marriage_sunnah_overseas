// @ts-nocheck
import { useState, useEffect } from "react";
import {
    MessageCircle, Trash2, Search, ChevronLeft, ChevronRight,
    ArrowRight, Calendar, Sparkles, X, AlertTriangle, Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";

const PRIMARY = "#1B4D3E";

/* ─── Mini user avatar ─── */
function MiniUser({ user, gradient }) {
    return (
        <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold text-white overflow-hidden flex-shrink-0 shadow-sm"
                style={{ background: gradient }}>
                {user?.avatar_url
                    ? <img src={user.avatar_url} alt={user?.name} className="w-full h-full object-cover" />
                    : (user?.name?.charAt(0)?.toUpperCase() || "U")}
            </div>
            <span className="text-xs font-semibold text-gray-900 truncate max-w-[100px]">
                {user?.name || "Unknown"}
            </span>
        </div>
    );
}

export default function MessagesPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [selectedMsg, setSelectedMsg] = useState(null);

    useEffect(() => { loadMessages(); }, [pagination.page]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getMessages({
                page: pagination.page, limit: pagination.limit, search,
            });
            if (response.success) {
                setMessages(response.data.messages);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total,
                    totalPages: response.data.totalPages,
                }));
            }
        } catch {
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            const res = await AdminService.deleteMessage(deleteConfirm.id);
            if (res.success) {
                toast.success("Message deleted");
                setDeleteConfirm(null);
                loadMessages();
            }
        } catch { toast.error("Failed to delete"); }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        loadMessages();
    };

    const handleClearSearch = () => {
        setSearch("");
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const formatTime = (d) =>
        new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f5f3] to-[#fafaf9] p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-5">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#1B4D3E]/10 text-[#1B4D3E] mb-2">
                            <Sparkles size={11} /> Admin · Messages
                        </div>
                        <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight"
                            style={{ letterSpacing: "-0.03em" }}>
                            Messages
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Monitor and moderate user conversations
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-2xl px-4 py-2.5 border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>
                                <MessageCircle size={16} className="text-white" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total</div>
                                <div className="text-lg font-extrabold text-gray-900 leading-none" style={{ letterSpacing: "-0.02em" }}>
                                    {pagination.total.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Search Bar ── */}
                <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.04)] border border-gray-100">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search messages by content or user…"
                                className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/10 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                            />
                        </div>
                        <button type="submit"
                            className="h-11 px-6 rounded-xl font-bold text-white text-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}>
                            Search
                        </button>
                        {search && (
                            <button type="button" onClick={handleClearSearch}
                                className="h-11 px-4 rounded-xl font-bold text-sm bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all flex items-center gap-1.5">
                                <X size={14} /> Clear
                            </button>
                        )}
                    </form>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.04)] border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 text-sm font-medium">Loading messages…</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                                <MessageCircle size={28} className="text-gray-300" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 mb-1">No messages yet</h3>
                            <p className="text-xs text-gray-400">Messages will appear here when users start chatting</p>
                            {search && (
                                <button onClick={handleClearSearch}
                                    className="mt-3 text-xs font-bold text-[#1B4D3E] hover:underline">
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">ID</th>
                                            <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">From</th>
                                            <th className="text-left px-2 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500"></th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">To</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Message</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Sent</th>
                                            <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {messages.map((msg, i) => (
                                            <motion.tr
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-[#f0f5f3]/40 hover:to-transparent transition-colors group"
                                            >
                                                <td className="px-5 py-3">
                                                    <span className="text-xs font-mono font-bold text-gray-400">#{msg.id}</span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <MiniUser user={msg.sender} gradient="linear-gradient(135deg,#1B4D3E,#2d7a63)" />
                                                </td>
                                                <td className="px-2 py-3">
                                                    <ArrowRight size={14} className="text-gray-300" />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <MiniUser user={msg.receiver} gradient="linear-gradient(135deg,#059669,#047857)" />
                                                </td>
                                                <td className="px-3 py-3 max-w-[320px]">
                                                    <p className="text-xs text-gray-700 truncate" title={msg.message}>
                                                        {msg.message}
                                                    </p>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="text-xs text-gray-700 font-semibold">{formatDate(msg.created_at)}</div>
                                                    <div className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</div>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => setSelectedMsg(msg)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white transition-colors"
                                                            title="View">
                                                            <Eye size={14} />
                                                        </button>
                                                        <button onClick={() => setDeleteConfirm(msg)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                                            title="Delete">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile card list */}
                            <div className="lg:hidden divide-y divide-gray-100">
                                {messages.map((msg) => (
                                    <div key={msg.id} className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-mono font-bold text-gray-400">#{msg.id}</span>
                                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                                <Calendar size={11} /> {formatDate(msg.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <MiniUser user={msg.sender} gradient="linear-gradient(135deg,#1B4D3E,#2d7a63)" />
                                            <ArrowRight size={12} className="text-gray-300" />
                                            <MiniUser user={msg.receiver} gradient="linear-gradient(135deg,#059669,#047857)" />
                                        </div>
                                        <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 mb-3 line-clamp-3">
                                            {msg.message}
                                        </p>
                                        <div className="flex justify-end gap-1 pt-3 border-t border-gray-100">
                                            <button onClick={() => setSelectedMsg(msg)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#1B4D3E] bg-[#1B4D3E]/10">
                                                <Eye size={11} /> View
                                            </button>
                                            <button onClick={() => setDeleteConfirm(msg)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-red-600 bg-red-50">
                                                <Trash2 size={11} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-gray-50 border-t border-gray-100">
                                <div className="text-xs text-gray-500 font-medium">
                                    Showing <span className="font-bold text-gray-900">{((pagination.page - 1) * pagination.limit) + 1}</span>
                                    {" – "}
                                    <span className="font-bold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                                    {" of "}
                                    <span className="font-bold text-gray-900">{pagination.total.toLocaleString()}</span> messages
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="w-8 h-8 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-[#1B4D3E]/30 transition-all flex items-center justify-center">
                                        <ChevronLeft size={16} className="text-gray-600" />
                                    </button>
                                    <span className="text-xs font-bold text-gray-700 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                                        {pagination.page} <span className="text-gray-400">/</span> {pagination.totalPages}
                                    </span>
                                    <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="w-8 h-8 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-[#1B4D3E]/30 transition-all flex items-center justify-center">
                                        <ChevronRight size={16} className="text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── View modal ── */}
            <AnimatePresence>
                {selectedMsg && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedMsg(null)}
                        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 16 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="border-b border-gray-100 p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                                        style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>
                                        <MessageCircle size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-gray-900 leading-tight" style={{ letterSpacing: "-0.02em" }}>
                                            Message #{selectedMsg.id}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                            <Calendar size={11} />
                                            {formatDate(selectedMsg.created_at)} · {formatTime(selectedMsg.created_at)}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedMsg(null)}
                                    className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-2xl p-3">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">From</div>
                                        <MiniUser user={selectedMsg.sender} gradient="linear-gradient(135deg,#1B4D3E,#2d7a63)" />
                                        <div className="text-[10px] text-gray-400 mt-1 truncate">{selectedMsg.sender?.email}</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-3">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">To</div>
                                        <MiniUser user={selectedMsg.receiver} gradient="linear-gradient(135deg,#059669,#047857)" />
                                        <div className="text-[10px] text-gray-400 mt-1 truncate">{selectedMsg.receiver?.email}</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Message</div>
                                    <div className="bg-gradient-to-br from-[#f0f5f3] to-white rounded-2xl p-4 border border-[#1B4D3E]/10">
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                                            {selectedMsg.message}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 p-4 flex gap-2">
                                <button onClick={() => setSelectedMsg(null)}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                    Close
                                </button>
                                <button onClick={() => { setDeleteConfirm(selectedMsg); setSelectedMsg(null); }}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.30)] flex items-center justify-center gap-1.5">
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Delete confirm modal ── */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setDeleteConfirm(null)}
                        className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 16 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6"
                        >
                            <div className="w-14 h-14 rounded-full mx-auto mb-4 bg-red-100 flex items-center justify-center">
                                <AlertTriangle size={26} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900 text-center mb-2"
                                style={{ letterSpacing: "-0.02em" }}>
                                Delete message?
                            </h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed mb-5">
                                Message <span className="font-mono font-bold">#{deleteConfirm.id}</span> from{" "}
                                <strong className="text-gray-700">{deleteConfirm.sender?.name}</strong> will be permanently removed.
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleDelete}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.30)]">
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

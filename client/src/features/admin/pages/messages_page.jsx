import { useState, useEffect } from "react";
import { MessageCircle, Trash2, Search, ChevronLeft, ChevronRight, Send, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";


export default function MessagesPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

    useEffect(() => {
        loadMessages();
    }, [pagination.page]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getMessages({
                page: pagination.page,
                limit: pagination.limit,
                search
            });

            if (response.success) {
                setMessages(response.data.messages);
                setPagination(prev => ({ ...prev, total: response.data.total, totalPages: response.data.totalPages }));
            }
        } catch (error) {
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this message?")) return;
        try {
            const response = await AdminService.deleteMessage(id);
            if (response.success) {
                toast.success("Message deleted");
                loadMessages();
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        loadMessages();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
                        <p className="text-gray-600">Monitor and moderate user conversations</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-2xl text-white shadow-lg">
                        <MessageCircle size={24} />
                        <div>
                            <div className="text-2xl font-bold">{messages.length}</div>
                            <div className="text-xs text-white/90">Messages</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search messages..."
                                className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-8 h-12 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">Loading messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}>
                                <MessageCircle size={36} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
                            <p className="text-gray-500">Messages will appear here when users start chatting</p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-gray-100">
                                {messages.map(msg => (
                                    <div key={msg.id} className="group p-4 sm:p-6 hover:bg-gradient-to-r hover:from-green-50/30 hover:to-transparent transition-all">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            {/* Main Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Users Row */}
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                                    {/* Sender */}
                                                    <div className="flex items-center gap-2 bg-gradient-to-r from-[#1B4D3E]/5 to-transparent rounded-xl px-3 py-1.5">
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0 shadow-sm"
                                                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}>
                                                            {msg.sender?.avatar_url ? (
                                                                <img
                                                                    src={msg.sender.avatar_url}
                                                                    alt={msg.sender?.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={e => {
                                                                        const target = e.currentTarget;
                                                                        target.style.display = 'none';
                                                                        if (target.parentElement) {
                                                                            target.parentElement.textContent = msg.sender?.name?.charAt(0)?.toUpperCase() || "U";
                                                                        }
                                                                    }}
                                                                />
                                                            ) : (
                                                                msg.sender?.name?.charAt(0)?.toUpperCase() || "U"
                                                            )}
                                                        </div>
                                                        <span className="font-semibold text-gray-900 text-sm truncate max-w-[120px]">
                                                            {msg.sender?.name}
                                                        </span>
                                                    </div>

                                                    {/* Arrow */}
                                                    <Send size={14} className="text-[#1B4D3E] flex-shrink-0" />

                                                    {/* Receiver */}
                                                    <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-xl px-3 py-1.5">
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0 shadow-sm"
                                                            style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)" }}>
                                                            {msg.receiver?.avatar_url ? (
                                                                <img
                                                                    src={msg.receiver.avatar_url}
                                                                    alt={msg.receiver?.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={e => {
                                                                        const target = e.currentTarget;
                                                                        target.style.display = 'none';
                                                                        if (target.parentElement) {
                                                                            target.parentElement.textContent = msg.receiver?.name?.charAt(0)?.toUpperCase() || "U";
                                                                        }
                                                                    }}
                                                                />
                                                            ) : (
                                                                msg.receiver?.name?.charAt(0)?.toUpperCase() || "U"
                                                            )}
                                                        </div>
                                                        <span className="font-semibold text-gray-900 text-sm truncate max-w-[120px]">
                                                            {msg.receiver?.name}
                                                        </span>
                                                    </div>

                                                    {/* Time */}
                                                    <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Calendar size={12} />
                                                        <span className="hidden sm:inline">
                                                            {new Date(msg.created_at).toLocaleString()}
                                                        </span>
                                                        <span className="sm:hidden">
                                                            {new Date(msg.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Message Content */}
                                                <div className="relative">
                                                    <div className="text-sm text-gray-700 bg-gradient-to-br from-gray-50 to-green-50/30 rounded-2xl p-4 border border-gray-100 group-hover:border-[#1B4D3E]/20 transition-all">
                                                        <div className="flex items-start gap-2">
                                                            <MessageCircle size={16} className="text-[#1B4D3E] flex-shrink-0 mt-0.5" />
                                                            <p className="flex-1">{msg.message}</p>
                                                        </div>
                                                    </div>
                                                    {/* ID Badge */}
                                                    <div className="absolute -bottom-2 right-3 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-xs text-gray-500 font-medium">
                                                        #{msg.id}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(msg.id)}
                                                className="flex-shrink-0 p-2 rounded-xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-200"
                                                title="Delete Message"
                                            >
                                                <Trash2 size={18} className="text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="bg-gradient-to-r from-gray-50 to-green-50/30 px-4 sm:px-6 py-4 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-sm text-gray-600 font-medium">
                                        Showing <span className="font-bold text-gray-900">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-bold text-gray-900">{pagination.total}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                            disabled={pagination.page === 1}
                                            className="w-10 h-10 rounded-xl border-2 border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1B4D3E] hover:bg-green-50 transition-all flex items-center justify-center"
                                        >
                                            <ChevronLeft size={20} className="text-gray-600" />
                                        </button>
                                        <div className="px-4 py-2 rounded-xl text-white font-bold text-sm min-w-[100px] text-center"
                                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                                        >
                                            {pagination.page} of {pagination.totalPages}
                                        </div>
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                            disabled={pagination.page === pagination.totalPages}
                                            className="w-10 h-10 rounded-xl border-2 border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1B4D3E] hover:bg-green-50 transition-all flex items-center justify-center"
                                        >
                                            <ChevronRight size={20} className="text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

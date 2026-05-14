import { useState, useEffect } from "react";
import { MessageCircle, Trash2, Search, ChevronLeft, ChevronRight, Send } from "lucide-react";
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

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="p-12 text-center">
                            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-400">No messages found</p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-gray-100">
                                {messages.map(msg => (
                                    <div key={msg.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                                                    style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                                                    {msg.sender?.name?.charAt(0)?.toUpperCase() || "U"}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="font-semibold text-gray-900">{msg.sender?.name}</span>
                                                        <Send size={14} className="text-gray-400" />
                                                        <span className="font-semibold text-gray-900">{msg.receiver?.name}</span>
                                                        <span className="text-xs text-gray-500 ml-auto">
                                                            {new Date(msg.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                                                        {msg.message}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(msg.id)}
                                                className="p-2 rounded-lg hover:bg-red-50 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} className="text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-100">
                                <div className="text-sm text-gray-600">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1}
                                        className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-white transition-all">
                                        <ChevronLeft size={20} className="text-gray-600" />
                                    </button>
                                    <span className="text-sm font-medium text-gray-700 px-4">Page {pagination.page} of {pagination.totalPages}</span>
                                    <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page === pagination.totalPages}
                                        className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-white transition-all">
                                        <ChevronRight size={20} className="text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

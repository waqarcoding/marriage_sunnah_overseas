import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart, Eye, ChevronLeft, ChevronRight, Calendar, TrendingUp, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";


export default function MatchesPage() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadMatches();
    }, [pagination.page]);

    const loadMatches = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search
            };

            const response = await AdminService.getMatches(params);

            if (response.success) {
                setMatches(response.data.matches);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total,
                    totalPages: response.data.totalPages
                }));
            }
        } catch (error) {
            toast.error("Failed to load matches");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        loadMatches();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-gray-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
                {/* Hero Header */}
                <div className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1B4D3E]/5 via-transparent to-[#2d7a63]/5" />
                    <div className="relative p-6 sm:p-8">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                                        style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                                    >
                                        <Heart size={24} className="text-white fill-white" />
                                    </div>
                                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                        Successful Matches
                                    </h1>
                                </div>
                                <p className="text-gray-600 ml-15">
                                    Celebrating love connections made on the platform
                                </p>
                            </div>

                            {/* Stats Cards */}
                            <div className="flex flex-wrap gap-4">
                                <div className="rounded-2xl px-6 py-4 text-white shadow-lg min-w-[140px]"
                                    style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Heart size={16} className="fill-white" />
                                        <span className="text-sm font-medium opacity-90">Total Matches</span>
                                    </div>
                                    <div className="text-3xl font-bold">{pagination.total}</div>
                                </div>

                            </div>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="mt-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search couples by name..."
                                        className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none transition-all bg-white/80 backdrop-blur-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-8 h-12 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:scale-105"
                                    style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Matches Grid */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">Finding love stories...</p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                            <Heart size={64} className="mx-auto mb-4 text-gray-200" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No matches yet</h3>
                            <p className="text-gray-500">Love connections will appear here</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                {matches.map(match => (
                                    <MatchCard
                                        key={match.id}
                                        match={match}
                                        navigate={navigate}
                                        formatDate={formatDate}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
                                    <div className="text-sm text-gray-600 font-medium">
                                        Showing <span className="font-bold text-gray-900">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-bold text-gray-900">{pagination.total}</span> matches
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

// Match Card Component
function MatchCard({ match, navigate, formatDate }) {
    const user1 = match.user_one;
    const user2 = match.user_two;

    return (
        <div className="group bg-white rounded-3xl border-2 border-gray-100 overflow-hidden   hover:shadow-2xl transition-all duration-300">
            {/* Sparkle Effect on Hover */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <Sparkles size={24} className="text-[#1B4D3E]" />
            </div>

            {/* Users Section */}
            <div className="relative p-6 bg-gradient-to-br from-green-50/50 via-white to-green-50/30">
                {/* Heart Connector */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="relative">
                        {/* Pulse Animation */}
                        <div className="absolute inset-0 bg-[#1B4D3E] rounded-full animate-ping opacity-20" />
                        <div className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                        >
                            <Heart size={22} className="text-white fill-white" />
                        </div>
                    </div>
                </div>

                {/* User 1 */}
                <div className="flex items-center gap-3 mb-14">
                    <div
                        onClick={() => navigate(`/admin/users/${user1.id}`)}
                        className="relative group/avatar cursor-pointer"
                    >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1B4D3E] to-[#2d7a63] rounded-2xl blur-sm opacity-0 group-hover/avatar:opacity-50 transition-opacity" />
                        <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white overflow-hidden shadow-lg transform group-hover/avatar:scale-110 transition-transform"
                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                        >
                            {user1.avatar_url ? (
                                <img
                                    src={user1.avatar_url}
                                    alt={user1.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.style.display = 'none';
                                        if (target.parentElement) {
                                            target.parentElement.textContent = user1.name?.charAt(0)?.toUpperCase() || "U";
                                        }
                                    }}
                                />
                            ) : (
                                user1.name?.charAt(0)?.toUpperCase() || "U"
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg text-gray-900 truncate">{user1.name}</div>
                        <div className="text-sm text-gray-500 truncate mb-2">{user1.email}</div>
                        <button
                            onClick={() => navigate(`/admin/users/${user1.id}`)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4D3E] hover:text-[#2d7a63] hover:gap-2 transition-all"
                        >
                            <Eye size={14} />
                            View Profile
                        </button>
                    </div>
                </div>

                {/* User 2 */}
                <div className="flex items-center gap-3 flex-row-reverse">
                    <div
                        onClick={() => navigate(`/admin/users/${user2.id}`)}
                        className="relative group/avatar cursor-pointer"
                    >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#059669] to-[#047857] rounded-2xl blur-sm opacity-0 group-hover/avatar:opacity-50 transition-opacity" />
                        <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white overflow-hidden shadow-lg transform group-hover/avatar:scale-110 transition-transform"
                            style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)" }}
                        >
                            {user2.avatar_url ? (
                                <img
                                    src={user2.avatar_url}
                                    alt={user2.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.style.display = 'none';
                                        if (target.parentElement) {
                                            target.parentElement.textContent = user2.name?.charAt(0)?.toUpperCase() || "U";
                                        }
                                    }}
                                />
                            ) : (
                                user2.name?.charAt(0)?.toUpperCase() || "U"
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                        <div className="font-bold text-lg text-gray-900 truncate">{user2.name}</div>
                        <div className="text-sm text-gray-500 truncate mb-2">{user2.email}</div>
                        <button
                            onClick={() => navigate(`/admin/users/${user2.id}`)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#059669] hover:text-[#047857] hover:gap-2 transition-all ml-auto"
                        >
                            <Eye size={14} />
                            View Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Match Info Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-green-50/50 px-6 py-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-[#1B4D3E]" />
                        <span className="font-medium">{formatDate(match.created_at)}</span>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-600">
                        #{match.id}
                    </div>
                </div>
            </div>
        </div>
    );
}
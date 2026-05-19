import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Heart, Eye, ChevronLeft, ChevronRight, Calendar, Shield, User, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";


export default function PendingInterestsPage() {
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        status: "",
        guardianStatus: ""
    });
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadInterests();
    }, [pagination.page, filters]);

    const loadInterests = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search,
                ...filters
            };

            const response = await AdminService.getPendingInterests(params);

            if (response.success) {
                setInterests(response.data.interests);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total,
                    totalPages: response.data.totalPages
                }));
            }
        } catch (error) {
            toast.error("Failed to load interests");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        loadInterests();
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

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#fef3c7', color: '#92400e', icon: Clock },
            accepted: { bg: '#dcfce7', color: '#166534', icon: CheckCircle },
            declined: { bg: '#fee2e2', color: '#991b1b', icon: XCircle }
        };
        const style = styles[status] || styles.pending;
        const Icon = style.icon;

        return (
            <div
                className="px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                style={{ background: style.bg, color: style.color }}
            >
                <Icon size={12} />
                {status}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Pending Interests
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            Monitor all pending interest requests and guardian approvals
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Heart className="text-pink-500" size={20} />
                                <div>
                                    <div className="text-xs text-gray-600">Total Pending</div>
                                    <div className="text-lg font-bold text-gray-900">{pagination.total}</div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="h-full px-4 py-3 rounded-xl font-medium transition-all"
                            style={{
                                background: showFilters ? "#1B4D3E" : "white",
                                color: showFilters ? "white" : "#1B4D3E",
                                border: "1px solid #e5e7eb",
                                boxShadow: showFilters ? "0 4px 12px rgba(27, 77, 62, 0.15)" : "none"
                            }}
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by user name..."
                                className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-8 h-12 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                        >
                            Search
                        </button>
                    </form>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="h-11 px-3 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="declined">Declined</option>
                            </select>
                            <select
                                value={filters.guardianStatus}
                                onChange={(e) => setFilters({ ...filters, guardianStatus: e.target.value })}
                                className="h-11 px-3 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none"
                            >
                                <option value="">All Guardian Status</option>
                                <option value="pending">Guardian Pending</option>
                                <option value="accepted">Guardian Accepted</option>
                                <option value="declined">Guardian Declined</option>
                            </select>
                            <button
                                onClick={() => {
                                    setFilters({ status: "", guardianStatus: "" });
                                    setSearch("");
                                }}
                                className="h-11 px-4 rounded-xl text-sm font-medium text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:text-red-600 transition-all"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* Interests List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading interests...</p>
                        </div>
                    ) : interests.length === 0 ? (
                        <div className="p-12 text-center">
                            <Heart size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-400">No pending interests found</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 p-4 sm:p-6">
                                {interests.map(interest => (
                                    <InterestCard
                                        key={interest.id}
                                        interest={interest}
                                        navigate={navigate}
                                        formatDate={formatDate}
                                        getStatusBadge={getStatusBadge}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 border-t border-gray-100">
                                <div className="text-sm text-gray-600">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} interests
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all"
                                    >
                                        <ChevronLeft size={20} className="text-gray-600" />
                                    </button>
                                    <span className="text-sm font-medium text-gray-700 px-4">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all"
                                    >
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

// Interest Card Component
function InterestCard({ interest, navigate, formatDate, getStatusBadge }) {
    const fromUser = interest.fromUser;
    const toUser = interest.toUser;

    return (
        <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-primary-700 hover:shadow-lg transition-all">
            <div className="p-4 sm:p-6">
                {/* Header with Main Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                            <Heart size={20} className="text-pink-600" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900">Interest Request</div>
                            <div className="text-sm text-gray-500">ID: {interest.id}</div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(interest.status)}
                        {interest.is_super_like && (
                            <div className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700">
                                ⭐ Super Like
                            </div>
                        )}
                        {interest.is_mutual && (
                            <div className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
                                🎉 Mutual
                            </div>
                        )}
                    </div>
                </div>

                {/* Users Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* From User */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-600">
                            <User size={16} />
                            From
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                onClick={() => navigate(`/admin/users/${fromUser.id}`)}
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white cursor-pointer hover:scale-105 transition-transform overflow-hidden flex-shrink-0 shadow-md"
                                style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                            >
                                {fromUser.avatar_url ? (
                                    <img
                                        src={fromUser.avatar_url}
                                        alt={fromUser.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            target.style.display = 'none';
                                            if (target.parentElement) {
                                                target.parentElement.textContent = fromUser.name?.charAt(0)?.toUpperCase() || "U";
                                            }
                                        }}

                                    />
                                ) : (
                                    fromUser.name?.charAt(0)?.toUpperCase() || "U"
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 truncate">{fromUser.name}</div>
                                <div className="text-sm text-gray-500 truncate">{fromUser.email}</div>
                                <button
                                    onClick={() => navigate(`/admin/users/${fromUser.id}`)}
                                    className="text-xs text-[#1B4D3E] hover:underline mt-1 flex items-center gap-1"
                                >
                                    <Eye size={12} />
                                    View Profile
                                </button>
                            </div>
                        </div>

                        {/* From Guardian Status */}
                        {interest.from_guardian_status && (
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Shield size={14} />
                                        Guardian Status
                                    </div>
                                    {getStatusBadge(interest.from_guardian_status)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* To User */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-600">
                            <User size={16} />
                            To
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                onClick={() => navigate(`/admin/users/${toUser.id}`)}
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white cursor-pointer hover:scale-105 transition-transform overflow-hidden flex-shrink-0 shadow-md"
                                style={{ background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)" }}
                            >
                                {toUser.avatar_url ? (
                                    <img
                                        src={toUser.avatar_url}
                                        alt={toUser.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target;
                                            const img = e.currentTarget;
                                            if (img instanceof HTMLImageElement) {
                                                img.style.display = 'none';
                                                if (img.parentElement) {
                                                    img.parentElement.textContent = toUser.name?.charAt(0)?.toUpperCase() || "U";
                                                }
                                            }


                                        }}
                                    />

                                ) : (
                                    toUser.name?.charAt(0)?.toUpperCase() || "U"
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 truncate">{toUser.name}</div>
                                <div className="text-sm text-gray-500 truncate">{toUser.email}</div>
                                <button
                                    onClick={() => navigate(`/admin/users/${toUser.id}`)}
                                    className="text-xs text-[#1B4D3E] hover:underline mt-1 flex items-center gap-1"
                                >
                                    <Eye size={12} />
                                    View Profile
                                </button>
                            </div>
                        </div>

                        {/* To Guardian Status */}
                        {interest.to_guardian_status && (
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Shield size={14} />
                                        Guardian Status
                                    </div>
                                    {getStatusBadge(interest.to_guardian_status)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer with Approval Flags */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            <span>{formatDate(interest.created_at)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {interest.both_guardians_approved && (
                                <div className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                                    <Shield size={12} />
                                    Both Guardians Approved
                                </div>
                            )}
                            {interest.both_users_approved && (
                                <div className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                                    <CheckCircle size={12} />
                                    Both Users Approved
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, UserCheck, UserX, Shield, ChevronLeft, ChevronRight, Eye, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";


export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        role: "",
        status: "",
        verified: "",
        isPro: "",
        country: ""
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
        loadUsers();
    }, [pagination.page, filters]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search,
                ...filters
            };

            const response = await AdminService.getUsers(params);

            if (response.success) {
                setUsers(response.data.users);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total,
                    totalPages: response.data.totalPages
                }));
            }
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        loadUsers();
    };

    const handleBanUser = async (userId) => {
        if (!confirm("Are you sure you want to ban this user?")) return;
        try {
            const response = await AdminService.banUser(userId);
            if (response.success) {
                toast.success("User banned successfully");
                loadUsers();
            }
        } catch (error) {
            toast.error("Failed to ban user");
        }
    };

    const handleUnbanUser = async (userId) => {
        try {
            const response = await AdminService.unbanUser(userId);
            if (response.success) {
                toast.success("User unbanned successfully");
                loadUsers();
            }
        } catch (error) {
            toast.error("Failed to unban user");
        }
    };

    const handleVerifyUser = async (userId) => {
        try {
            const response = await AdminService.verifyUser(userId);
            if (response.success) {
                toast.success(response.message || "User verified successfully");
                loadUsers();
            }
        } catch (error) {
            toast.error("Failed to verify user");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Users Management
                        </h1>
                        <p className="text-gray-600">
                            Manage and monitor all platform users
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all"
                        style={{
                            background: showFilters ? "#1B4D3E" : "white",
                            color: showFilters ? "white" : "#1B4D3E",
                            border: "1px solid #e5e7eb",
                            boxShadow: showFilters ? "0 4px 12px rgba(27, 77, 62, 0.15)" : "none"
                        }}
                    >
                        <Filter size={20} />
                        Filters
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email, or mobile..."
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

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-4 border-t border-gray-100">
                            <select
                                value={filters.role}
                                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                                className="h-11 px-3 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none"
                            >
                                <option value="">All Roles</option>
                                <option value="individual">Individual</option>
                                <option value="guardian">Guardian</option>
                            </select>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="h-11 px-3 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                            </select>
                            <select
                                value={filters.verified}
                                onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
                                className="h-11 px-3 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none"
                            >
                                <option value="">All Verification</option>
                                <option value="true">Verified</option>
                                <option value="false">Not Verified</option>
                            </select>
                            <select
                                value={filters.isPro}
                                onChange={(e) => setFilters({ ...filters, isPro: e.target.value })}
                                className="h-11 px-3 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none"
                            >
                                <option value="">All Members</option>
                                <option value="true">Pro Members</option>
                                <option value="false">Free Members</option>
                            </select>
                            <button
                                onClick={() => {
                                    setFilters({ role: "", status: "", verified: "", isPro: "", country: "" });
                                    setSearch("");
                                }}
                                className="h-11 px-4 rounded-xl text-sm font-medium text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:text-red-600 transition-all"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-12 text-center">
                            <Search size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-400">No users found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">User</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Contact</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Role</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Status</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Credits</th>
                                            <th className="text-right p-4 text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white"
                                                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                                                        >
                                                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-gray-900">{user.name}</span>
                                                                {user.is_verified && <UserCheck size={16} className="text-green-500" />}
                                                                {user.is_pro && <Shield size={16} className="text-amber-500" />}
                                                            </div>
                                                            <div className="text-xs text-gray-500">ID: {user.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-gray-900">{user.email}</div>
                                                    <div className="text-xs text-gray-500">{user.mobile}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className="px-3 py-1 rounded-lg text-xs font-semibold"
                                                        style={{
                                                            background: user.role === 'guardian' ? "#fef3c7" : "#dbeafe",
                                                            color: user.role === 'guardian' ? "#92400e" : "#1e40af"
                                                        }}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className="px-3 py-1 rounded-lg text-xs font-semibold"
                                                        style={{
                                                            background: user.is_suspended ? "#fee2e2" : "#dcfce7",
                                                            color: user.is_suspended ? "#991b1b" : "#166534"
                                                        }}
                                                    >
                                                        {user.is_suspended ? "Suspended" : "Active"}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm font-semibold text-gray-900">{user.credits || 0} credits</div>
                                                    <div className="text-xs text-gray-500">{user.rcredits || 0} referral</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => navigate(`/admin/users/${user.id}`)}
                                                            className="p-2 rounded-lg hover:bg-blue-50 transition-all"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} className="text-blue-600" />
                                                        </button>
                                                        {!user.is_verified && (
                                                            <button
                                                                onClick={() => handleVerifyUser(user.id)}
                                                                className="p-2 rounded-lg hover:bg-green-50 transition-all"
                                                                title="Verify User"
                                                            >
                                                                <UserCheck size={18} className="text-green-600" />
                                                            </button>
                                                        )}
                                                        {user.is_suspended ? (
                                                            <button
                                                                onClick={() => handleUnbanUser(user.id)}
                                                                className="p-2 rounded-lg hover:bg-green-50 transition-all"
                                                                title="Unban User"
                                                            >
                                                                <UserCheck size={18} className="text-green-600" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleBanUser(user.id)}
                                                                className="p-2 rounded-lg hover:bg-red-50 transition-all"
                                                                title="Ban User"
                                                            >
                                                                <UserX size={18} className="text-red-600" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-100">
                                <div className="text-sm text-gray-600">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
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

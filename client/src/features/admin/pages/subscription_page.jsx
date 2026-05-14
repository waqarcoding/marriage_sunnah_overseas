import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Crown, XCircle, Plus, Calendar, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";


export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: "",
        planType: "",
        processor: ""
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [selectedSub, setSelectedSub] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadSubscriptions();
    }, [pagination.page, filters]);

    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            };

            const response = await AdminService.getSubscriptions(params);

            if (response.success) {
                setSubscriptions(response.data.subscriptions);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total,
                    totalPages: response.data.totalPages
                }));
            }
        } catch (error) {
            toast.error("Failed to load subscriptions");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async (id) => {
        if (!confirm("Are you sure you want to cancel this subscription?")) return;

        try {
            const response = await AdminService.cancelSubscription(id);
            if (response.success) {
                toast.success("Subscription canceled successfully");
                loadSubscriptions();
            }
        } catch (error) {
            toast.error("Failed to cancel subscription");
        }
    };

    const handleExtendSubscription = async (id) => {
        const days = prompt("Enter number of days to extend:");
        const daysNum = parseInt(days, 10);
        if (isNaN(daysNum) || daysNum <= 0) return;


        try {
            const response = await AdminService.extendSubscription(id, parseInt(days));
            if (response.success) {
                toast.success(`Subscription extended by ${days} days`);
                loadSubscriptions();
            }
        } catch (error) {
            toast.error("Failed to extend subscription");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981' };
            case 'canceled': return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
            case 'expired': return { bg: 'rgba(107, 114, 128, 0.2)', color: '#6b7280' };
            default: return { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' };
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>
                    Subscriptions Management
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                    Manage user subscriptions and pro memberships
                </p>
            </div>

            {/* Filters */}
            <div
                className="rounded-xl p-6"
                style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="h-10 px-3 rounded-lg outline-none"
                        style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "var(--foreground)"
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="canceled">Canceled</option>
                        <option value="expired">Expired</option>
                    </select>

                    <select
                        value={filters.planType}
                        onChange={(e) => setFilters({ ...filters, planType: e.target.value })}
                        className="h-10 px-3 rounded-lg outline-none"
                        style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "var(--foreground)"
                        }}
                    >
                        <option value="">All Plans</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                    </select>

                    <select
                        value={filters.processor}
                        onChange={(e) => setFilters({ ...filters, processor: e.target.value })}
                        className="h-10 px-3 rounded-lg outline-none"
                        style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "var(--foreground)"
                        }}
                    >
                        <option value="">All Processors</option>
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                    </select>

                    <button
                        onClick={() => setFilters({ status: "", planType: "", processor: "" })}
                        className="h-10 px-4 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "var(--foreground)"
                        }}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Subscriptions Table */}
            <div
                className="rounded-xl overflow-hidden"
                style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                }}
            >
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                            style={{ borderColor: "var(--primary)" }}></div>
                        <p style={{ color: "var(--muted-foreground)" }}>Loading subscriptions...</p>
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="p-12 text-center">
                        <Crown size={48} className="mx-auto mb-4" style={{ color: "var(--muted-foreground)" }} />
                        <p style={{ color: "var(--muted-foreground)" }}>No subscriptions found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                                        <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>User</th>
                                        <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Plan</th>
                                        <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Status</th>
                                        <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Period</th>
                                        <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Amount</th>
                                        <th className="text-right p-4 text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptions.map(sub => {
                                        const statusStyle = getStatusColor(sub.status);
                                        return (
                                            <tr
                                                key={sub.id}
                                                style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}
                                                className="hover:bg-white hover:bg-opacity-5 transition-colors"
                                            >
                                                <td className="p-4">
                                                    <div>
                                                        <div className="font-medium" style={{ color: "var(--foreground)" }}>
                                                            {sub.user?.name || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                                            {sub.user?.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div>
                                                        <div className="font-medium" style={{ color: "var(--foreground)" }}>
                                                            {sub.plan_type}
                                                        </div>
                                                        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                                            {sub.payment_processor}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className="px-2 py-1 rounded text-xs font-medium"
                                                        style={{
                                                            background: statusStyle.bg,
                                                            color: statusStyle.color
                                                        }}
                                                    >
                                                        {sub.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm" style={{ color: "var(--foreground)" }}>
                                                        {new Date(sub.current_period_end).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                                        Started: {new Date(sub.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium" style={{ color: "var(--foreground)" }}>
                                                        ${sub.amount} {sub.currency}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {sub.status === 'active' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleExtendSubscription(sub.id)}
                                                                    className="p-2 rounded-lg transition-all hover:bg-green-500 hover:bg-opacity-20"
                                                                    title="Extend Subscription"
                                                                >
                                                                    <Plus size={16} color="#10b981" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCancelSubscription(sub.id)}
                                                                    className="p-2 rounded-lg transition-all hover:bg-red-500 hover:bg-opacity-20"
                                                                    title="Cancel Subscription"
                                                                >
                                                                    <XCircle size={16} color="#ef4444" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div
                            className="flex items-center justify-between p-4"
                            style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}
                        >
                            <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} subscriptions
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="p-2 rounded-lg transition-all disabled:opacity-50"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.05)",
                                        border: "1px solid rgba(255, 255, 255, 0.1)"
                                    }}
                                >
                                    <ChevronLeft size={16} style={{ color: "var(--foreground)" }} />
                                </button>
                                <span className="text-sm px-3" style={{ color: "var(--foreground)" }}>
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="p-2 rounded-lg transition-all disabled:opacity-50"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.05)",
                                        border: "1px solid rgba(255, 255, 255, 0.1)"
                                    }}
                                >
                                    <ChevronRight size={16} style={{ color: "var(--foreground)" }} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

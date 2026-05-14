import { useState, useEffect } from "react";
import { Crown, Plus, XCircle, Calendar, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";


export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: "", planType: "", processor: "" });
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

    useEffect(() => {
        loadSubscriptions();
    }, [pagination.page, filters]);

    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getSubscriptions({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });

            if (response.success) {
                setSubscriptions(response.data.subscriptions);
                setPagination(prev => ({ ...prev, total: response.data.total, totalPages: response.data.totalPages }));
            }
        } catch (error) {
            toast.error("Failed to load subscriptions");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm("Cancel this subscription?")) return;
        try {
            const response = await AdminService.cancelSubscription(id);
            if (response.success) {
                toast.success("Subscription canceled");
                loadSubscriptions();
            }
        } catch (error) {
            toast.error("Failed to cancel");
        }
    };

    const handleExtend = async (id) => {
        const days = prompt("Days to extend:");
        // @ts-ignore
        if (!days || isNaN(days)) return;
        try {
            const response = await AdminService.extendSubscription(id, parseInt(days));
            if (response.success) {
                toast.success(`Extended by ${days} days`);
                loadSubscriptions();
            }
        } catch (error) {
            toast.error("Failed to extend");
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            active: { bg: "#dcfce7", color: "#166534" },
            canceled: { bg: "#fee2e2", color: "#991b1b" },
            expired: { bg: "#f3f4f6", color: "#4b5563" }
        };
        return styles[status] || styles.expired;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscriptions</h1>
                        <p className="text-gray-600">Manage user pro memberships</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 rounded-2xl text-white shadow-lg">
                        <TrendingUp size={24} />
                        <div>
                            <div className="text-2xl font-bold">{subscriptions.filter(s => s.status === 'active').length}</div>
                            <div className="text-xs text-white/90">Active</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="h-11 px-3 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="canceled">Canceled</option>
                            <option value="expired">Expired</option>
                        </select>
                        <select value={filters.planType} onChange={(e) => setFilters({ ...filters, planType: e.target.value })}
                            className="h-11 px-3 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none">
                            <option value="">All Plans</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        <select value={filters.processor} onChange={(e) => setFilters({ ...filters, processor: e.target.value })}
                            className="h-11 px-3 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none">
                            <option value="">All Processors</option>
                            <option value="stripe">Stripe</option>
                            <option value="paypal">PayPal</option>
                        </select>
                        <button onClick={() => setFilters({ status: "", planType: "", processor: "" })}
                            className="h-11 px-4 rounded-xl text-sm font-medium text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:text-red-600 transition-all">
                            Clear
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading...</p>
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <div className="p-12 text-center">
                            <Crown size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-400">No subscriptions found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">User</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Plan</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Status</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Period</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Amount</th>
                                            <th className="text-right p-4 text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscriptions.map(sub => {
                                            const style = getStatusStyle(sub.status);
                                            return (
                                                <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-semibold text-gray-900">{sub.user?.name || 'Unknown'}</div>
                                                        <div className="text-sm text-gray-500">{sub.user?.email}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-semibold text-gray-900 capitalize">{sub.plan_type}</div>
                                                        <div className="text-sm text-gray-500">{sub.payment_processor}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="px-3 py-1 rounded-lg text-xs font-semibold capitalize" style={{ background: style.bg, color: style.color }}>
                                                            {sub.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm text-gray-900">{new Date(sub.current_period_end).toLocaleDateString()}</div>
                                                        <div className="text-xs text-gray-500">Started: {new Date(sub.created_at).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-semibold text-gray-900">${sub.amount}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {sub.status === 'active' && (
                                                                <>
                                                                    <button onClick={() => handleExtend(sub.id)} className="p-2 rounded-lg hover:bg-green-50 transition-all" title="Extend">
                                                                        <Plus size={18} className="text-green-600" />
                                                                    </button>
                                                                    <button onClick={() => handleCancel(sub.id)} className="p-2 rounded-lg hover:bg-red-50 transition-all" title="Cancel">
                                                                        <XCircle size={18} className="text-red-600" />
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

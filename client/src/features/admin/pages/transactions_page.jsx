import { useState, useEffect } from "react";
import { DollarSign, RotateCcw, ChevronLeft, ChevronRight, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";


export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: "", type: "", processor: "" });
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

    useEffect(() => {
        loadTransactions();
    }, [pagination.page, filters]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getTransactions({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });

            if (response.success) {
                setTransactions(response.data.transactions);
                setPagination(prev => ({ ...prev, total: response.data.total, totalPages: response.data.totalPages }));
            }
        } catch (error) {
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    const handleRefund = async (id) => {
        if (!confirm("Refund this transaction?")) return;
        try {
            const response = await AdminService.refundTransaction(id);
            if (response.success) {
                toast.success("Transaction refunded");
                loadTransactions();
            }
        } catch (error) {
            toast.error("Failed to refund");
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            succeeded: { bg: "#dcfce7", color: "#166534" },
            failed: { bg: "#fee2e2", color: "#991b1b" },
            pending: { bg: "#fef3c7", color: "#92400e" }
        };
        return styles[status] || { bg: "#f3f4f6", color: "#4b5563" };
    };

    const totalRevenue = transactions.filter(t => t.status === 'succeeded').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
                        <p className="text-gray-600">Monitor all payment transactions</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 rounded-2xl text-white shadow-lg">
                        <CreditCard size={24} />
                        <div>
                            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                            <div className="text-xs text-white/90">Total Revenue</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="h-11 px-3 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none">
                            <option value="">All Status</option>
                            <option value="succeeded">Succeeded</option>
                            <option value="failed">Failed</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="h-11 px-3 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none">
                            <option value="">All Types</option>
                            <option value="subscription">Subscription</option>
                            <option value="credits">Credits</option>
                        </select>
                        <select value={filters.processor} onChange={(e) => setFilters({ ...filters, processor: e.target.value })}
                            className="h-11 px-3 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none">
                            <option value="">All Processors</option>
                            <option value="stripe">Stripe</option>
                            <option value="paypal">PayPal</option>
                        </select>
                        <button onClick={() => setFilters({ status: "", type: "", processor: "" })}
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
                    ) : transactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-400">No transactions found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">User</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Amount</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Type</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Status</th>
                                            <th className="text-left p-4 text-sm font-semibold text-gray-700">Date</th>
                                            <th className="text-right p-4 text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map(tx => {
                                            const style = getStatusStyle(tx.status);
                                            return (
                                                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-semibold text-gray-900">{tx.user?.name || 'Unknown'}</div>
                                                        <div className="text-sm text-gray-500">{tx.user?.email}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-gray-900">${tx.amount}</div>
                                                        <div className="text-xs text-gray-500">{tx.currency}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm text-gray-900 capitalize">{tx.type}</div>
                                                        <div className="text-xs text-gray-500">{tx.payment_processor}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="px-3 py-1 rounded-lg text-xs font-semibold capitalize" style={{ background: style.bg, color: style.color }}>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm text-gray-900">{new Date(tx.created_at).toLocaleDateString()}</div>
                                                        <div className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleTimeString()}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-end">
                                                            {tx.status === 'succeeded' && (
                                                                <button onClick={() => handleRefund(tx.id)} className="p-2 rounded-lg hover:bg-red-50 transition-all" title="Refund">
                                                                    <RotateCcw size={18} className="text-red-600" />
                                                                </button>
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

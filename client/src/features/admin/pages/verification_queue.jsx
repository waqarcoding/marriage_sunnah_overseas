import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Eye, Image as ImageIcon, Clock, Award } from "lucide-react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";


export default function VerificationQueue() {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadVerifications();
    }, []);

    const loadVerifications = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getPendingVerifications();

            if (response.success) {
                setVerifications(response.data);
            }
        } catch (error) {
            toast.error("Failed to load verifications");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        if (!confirm("Approve this verification? User will receive bonus credits.")) return;

        try {
            const response = await AdminService.approveVerification(userId);
            if (response.success) {
                toast.success("Verification approved successfully");
                setShowModal(false);
                setSelectedUser(null);
                loadVerifications();
            }
        } catch (error) {
            toast.error("Failed to approve verification");
        }
    };

    const handleReject = async (userId) => {
        const reason = prompt("Enter rejection reason (optional):");

        try {
            const response = await AdminService.rejectVerification(userId, reason);
            if (response.success) {
                toast.success("Verification rejected");
                setShowModal(false);
                setSelectedUser(null);
                loadVerifications();
            }
        } catch (error) {
            toast.error("Failed to reject verification");
        }
    };

    const openModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading verifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            ID Verification Queue
                        </h1>
                        <p className="text-gray-600">
                            Review and approve user identity verifications
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
                        <Clock size={24} className="text-amber-500" />
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{verifications.length}</div>
                            <div className="text-xs text-gray-500">Pending Review</div>
                        </div>
                    </div>
                </div>

                {/* Stats Banner */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Award size={32} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">Verification Rewards</h3>
                            <p className="text-white/90">Each approved verification grants users bonus credits automatically</p>
                        </div>
                    </div>
                </div>

                {/* Verification List */}
                {verifications.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                        <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                        <p className="text-gray-600">No pending verifications at the moment</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {verifications.map(user => (
                            <div
                                key={user.id}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
                            >
                                {/* User Info */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                                        style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                                    >
                                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                </div>

                                {/* Profile Info */}
                                {user.profile && (
                                    <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Gender & Age</span>
                                            <span className="font-medium text-gray-900">{user.profile.gender} • {user.profile.age} years</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Location</span>
                                            <span className="font-medium text-gray-900">{user.profile.city}, {user.profile.country}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Submitted Date */}
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                    <Clock size={14} />
                                    Submitted: {new Date(user.created_at).toLocaleDateString()}
                                </div>

                                {/* Actions */}
                                <button
                                    onClick={() => openModal(user)}
                                    className="w-full h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                                    style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                                >
                                    <Eye size={18} />
                                    Review Documents
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Review Modal */}
                {showModal && selectedUser && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
                        onClick={() => setShowModal(false)}
                    >
                        <div
                            className="max-w-5xl w-full bg-white rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">ID Verification Review</h2>
                                    <p className="text-gray-600 mt-1">{selectedUser.name} • {selectedUser.email}</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all"
                                >
                                    <XCircle size={24} className="text-gray-500" />
                                </button>
                            </div>

                            {/* ID Images */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Front ID */}
                                <div>
                                    <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <ImageIcon size={16} />
                                        Front ID Document
                                    </div>
                                    {selectedUser.frontid_url ? (
                                        <div className="relative group">
                                            <img
                                                src={selectedUser.frontid_url}
                                                alt="Front ID"
                                                className="w-full rounded-2xl border-2 border-gray-200 shadow-lg"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                                <Eye size={32} className="text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-64 rounded-2xl flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300">
                                            <p className="text-gray-400">No image uploaded</p>
                                        </div>
                                    )}
                                </div>

                                {/* Back ID */}
                                <div>
                                    <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <ImageIcon size={16} />
                                        Back ID Document
                                    </div>
                                    {selectedUser.backid_url ? (
                                        <div className="relative group">
                                            <img
                                                src={selectedUser.backid_url}
                                                alt="Back ID"
                                                className="w-full rounded-2xl border-2 border-gray-200 shadow-lg"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                                <Eye size={32} className="text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-64 rounded-2xl flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300">
                                            <p className="text-gray-400">No image uploaded</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleApprove(selectedUser.id)}
                                    className="flex-1 h-14 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg text-white"
                                    style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                                >
                                    <CheckCircle size={20} />
                                    Approve Verification
                                </button>
                                <button
                                    onClick={() => handleReject(selectedUser.id)}
                                    className="flex-1 h-14 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg text-white"
                                    style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
                                >
                                    <XCircle size={20} />
                                    Reject Verification
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

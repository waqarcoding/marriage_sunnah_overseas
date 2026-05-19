import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Save, Trash2, UserX, Eye, Shield,
    Crown, Mail, Phone, Calendar, User, MessageSquare,
    Image as ImageIcon, Video, X, Edit2, Check
} from "lucide-react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";
import ChatService from "../../chat/services/ChatService";

export default function UserDetailPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [guardians, setGuardians] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});
    const [selectedMedia, setSelectedMedia] = useState(null);

    useEffect(() => {
        loadUserDetails();
    }, [userId]);

    const loadUserDetails = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getUserDetails(userId);

            if (response.success) {
                setUser(response.data.user);
                setProfile(response.data.profile);
                // Filter out null values
                setGuardians((response.data.guardians || []).filter(g => g !== null));
                setWards((response.data.wards || []).filter(w => w !== null));
                setEditedProfile(response.data.profile || {});
            }
        } catch (error) {
            toast.error("Failed to load user details");
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const response = await AdminService.updateUserProfileByAdmin(userId, editedProfile);
            if (response.success) {
                toast.success("Profile updated successfully");
                setProfile(editedProfile);
                setEditMode(false);
                loadUserDetails();
            }
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    const handleDeleteImage = async (imageUrl) => {
        if (!confirm("Delete this image?")) return;

        try {
            const response = await AdminService.deleteUserImage(userId, imageUrl);
            if (response.success) {
                toast.success("Image deleted");
                loadUserDetails();
            }
        } catch (error) {
            toast.error("Failed to delete image");
        }
    };

    const handleDeleteVideo = async (videoUrl) => {
        if (!confirm("Delete this video?")) return;

        try {
            const response = await AdminService.deleteUserVideo(userId, videoUrl);
            if (response.success) {
                toast.success("Video deleted");
                loadUserDetails();
            }
        } catch (error) {
            toast.error("Failed to delete video");
        }
    };

    const handleRemoveGuardian = async (guardianId) => {
        if (!confirm("Remove this guardian link?")) return;

        try {
            const response = await AdminService.removeGuardianByAdmin(userId, guardianId);
            if (response.success) {
                toast.success("Guardian removed");
                loadUserDetails();
            }
        } catch (error) {
            toast.error("Failed to remove guardian");
        }
    };

    const handleRemoveWard = async (wardId) => {
        if (!confirm("Remove this ward link?")) return;

        try {
            const response = await AdminService.removeWard(userId, wardId);
            if (response.success) {
                toast.success("Ward removed");
                loadUserDetails();
            }
        } catch (error) {
            toast.error("Failed to remove ward");
        }
    };

    const handleViewGuardian = (guardianId) => {
        navigate(`/admin/users/${guardianId}`);
    };

    const handleViewWard = (wardId) => {
        navigate(`/admin/users/${wardId}`);
    };

    const handleMessageUser = async () => {
        // Navigate to messages page with this user pre-selected
        await ChatService.addConversationUser(user.id);
        navigate(`/admin/chats?receiver_id=${user.id}`, {
            state: { user },
        });

    };

    // Parse images and videos from JSON strings (only for individuals)
    const images = (user?.role === 'individual' && profile?.images)
        ? (typeof profile.images === 'string' ? JSON.parse(profile.images) : profile.images)
        : [];
    const videos = (user?.role === 'individual' && profile?.videos)
        ? (typeof profile.videos === 'string' ? JSON.parse(profile.videos) : profile.videos)
        : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const isGuardian = user.role === 'guardian';
    const isIndividual = user.role === 'individual';

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="p-2 rounded-lg hover:bg-white transition-all border border-gray-200"
                        >
                            <ArrowLeft size={20} className="text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {isGuardian ? 'Guardian Profile' : 'User Profile'}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                ID: {user.id} • {user.role}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Message Button */}
                        <button
                            onClick={handleMessageUser}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 h-11 rounded-xl font-semibold transition-all border-2 border-[#1B4D3E] text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white"
                        >
                            <MessageSquare size={18} />
                            Message
                        </button>

                        {/* Edit/Save Buttons - Only for Individuals */}
                        {isIndividual && (
                            editMode ? (
                                <>
                                    <button
                                        onClick={() => setEditMode(false)}
                                        className="flex-1 sm:flex-none px-4 h-11 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 h-11 rounded-xl text-white font-semibold transition-all hover:shadow-lg"
                                        style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                                    >
                                        <Save size={18} />
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 h-11 rounded-xl text-white font-semibold transition-all hover:shadow-lg"
                                    style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                                >
                                    <Edit2 size={18} />
                                    Edit Profile
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div
                            className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white overflow-hidden"
                            style={{
                                background: isGuardian
                                    ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                    : "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)"
                            }}
                        >
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            ) : (
                                user.name?.charAt(0)?.toUpperCase() || "U"
                            )}
                        </div>


                        <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                {user.is_verified && (
                                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                                        <Check size={14} />
                                        Verified
                                    </span>
                                )}
                                {user.is_pro && (
                                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 flex items-center gap-1">
                                        <Crown size={14} />
                                        Pro Member
                                    </span>
                                )}
                                {isGuardian && (
                                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1">
                                        <Shield size={14} />
                                        Guardian
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail size={16} className="text-gray-400" />
                                    <span className="text-gray-700">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone size={16} className="text-gray-400" />
                                    <span className="text-gray-700">{user.mobile}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span className="text-gray-700">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <div className="px-3 py-1 rounded-lg bg-gray-50 text-sm">
                                    <span className="text-gray-600">Credits:</span> <span className="font-semibold text-gray-900">{user.credits || 0}</span>
                                </div>
                                <div className="px-3 py-1 rounded-lg bg-gray-50 text-sm">
                                    <span className="text-gray-600">Referral Credits:</span> <span className="font-semibold text-gray-900">{user.rcredits || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details - Only for Individuals */}
                {isIndividual && profile && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <User size={20} />
                            Profile Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ProfileField
                                label="Gender"
                                value={profile.gender}
                                editMode={editMode}
                                onChange={(v) => setEditedProfile({ ...editedProfile, gender: v })}
                                type="select"
                                options={['male', 'female']}
                            />
                            <ProfileField
                                label="Age"
                                value={profile.age}
                                editMode={editMode}
                                onChange={(v) => setEditedProfile({ ...editedProfile, age: v })}
                                type="number"
                            />
                            <ProfileField
                                label="Height (inches)"
                                value={profile.height_inches}
                                editMode={editMode}
                                onChange={(v) => setEditedProfile({ ...editedProfile, height_inches: v })}
                                type="number"
                            />
                            <ProfileField
                                label="Marital Status"
                                value={profile.marital_status}
                                editMode={editMode}
                                onChange={(v) => setEditedProfile({ ...editedProfile, marital_status: v })}
                            />
                            <ProfileField
                                label="City"
                                value={profile.city}
                                editMode={editMode}
                                onChange={(v) => setEditedProfile({ ...editedProfile, city: v })}
                            />
                            <ProfileField
                                label="Country"
                                value={profile.country}
                                editMode={editMode}
                                onChange={(v) => setEditedProfile({ ...editedProfile, country: v })}
                            />
                            <ProfileField
                                label="Education"
                                value={profile.education}
                                editMode={editMode}
                                onChange={(v) => setEditedProfile({ ...editedProfile, education: v })}
                            />
                            <ProfileField
                                label="Profession"
                                value={profile.profession}
                                editMode={editMode}
                                onChange={(v) => setEditedProfile({ ...editedProfile, profession: v })}
                            />
                            <ProfileField
                                label="Religion"
                                value={profile.religion}
                                editMode={editMode}
                                onChange={(v) => setEditedProfile({ ...editedProfile, religion: v })}
                            />
                            <ProfileField
                                label="Sect"
                                value={profile.sect}
                                editMode={editMode}
                                onChange={(v) => setEditedProfile({ ...editedProfile, sect: v })}
                            />
                            <ProfileField
                                label="Bio"
                                value={profile.bio}
                                editMode={editMode}
                                onChange={(v) => setEditedProfile({ ...editedProfile, bio: v })}
                                type="textarea"
                                fullWidth
                            />
                        </div>
                    </div>
                )}

                {/* Media Section - Only for Individuals */}
                {isIndividual && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Images */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ImageIcon size={20} />
                                Images ({images.length})
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                {images.map((imageUrl, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={imageUrl}
                                            alt={`Image ${index + 1}`}
                                            className="w-full h-40 object-cover rounded-xl border border-gray-200 cursor-pointer"
                                            onClick={() => setSelectedMedia({ type: 'image', url: imageUrl })}
                                        />
                                        <button
                                            onClick={() => handleDeleteImage(imageUrl)}
                                            className="absolute top-2 right-2 p-2 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {images.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No images uploaded</p>
                                </div>
                            )}
                        </div>

                        {/* Videos */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Video size={20} />
                                Videos ({videos.length})
                            </h3>

                            <div className="space-y-3">
                                {videos.map((videoUrl, index) => (
                                    <div key={index} className="relative group">
                                        <video
                                            src={videoUrl}
                                            controls
                                            className="w-full h-48 rounded-xl border border-gray-200 bg-black"
                                        />
                                        <button
                                            onClick={() => handleDeleteVideo(videoUrl)}
                                            className="absolute top-2 right-2 p-2 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {videos.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    <Video size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No videos uploaded</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Guardians Section - For Individuals */}
                {isIndividual && guardians.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield size={20} />
                            Linked Guardians ({guardians.length})
                        </h3>

                        <div className="space-y-3">
                            {guardians.map(guardian => guardian && (
                                <div key={guardian.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                                        >
                                            {guardian.avatar_url ? (
                                                <img
                                                    src={guardian.avatar_url}
                                                    alt={guardian.name}
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                            ) : (
                                                guardian.name?.charAt(0)?.toUpperCase() || "G"
                                            )}
                                        </div>


                                        <div>
                                            <div className="font-semibold text-gray-900">{guardian.name}</div>
                                            <div className="text-sm text-gray-500">{guardian.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => handleViewGuardian(guardian.id)}
                                            className="flex-1 sm:flex-none p-2 rounded-lg hover:bg-blue-50 transition-all"
                                            title="View Guardian"
                                        >
                                            <Eye size={18} className="text-blue-600" />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveGuardian(guardian.id)}
                                            className="flex-1 sm:flex-none p-2 rounded-lg hover:bg-red-50 transition-all"
                                            title="Remove Guardian"
                                        >
                                            <UserX size={18} className="text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Wards Section - For Guardians */}
                {isGuardian && wards.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <User size={20} />
                            Linked Individuals ({wards.length})
                        </h3>

                        <div className="space-y-3">
                            {wards.map(ward => ward && (
                                <div key={ward.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                                        >
                                            {ward.avatar_url ? (
                                                <img
                                                    src={ward.avatar_url}
                                                    alt={ward.name}
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                            ) : (
                                                ward.name?.charAt(0)?.toUpperCase() || "I"
                                            )}
                                        </div>

                                        <div>
                                            <div className="font-semibold text-gray-900">{ward.name}</div>
                                            <div className="text-sm text-gray-500">{ward.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => handleViewWard(ward.id)}
                                            className="flex-1 sm:flex-none p-2 rounded-lg hover:bg-blue-50 transition-all"
                                            title="View Individual"
                                        >
                                            <Eye size={18} className="text-blue-600" />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveWard(ward.id)}
                                            className="flex-1 sm:flex-none p-2 rounded-lg hover:bg-red-50 transition-all"
                                            title="Remove Individual"
                                        >
                                            <UserX size={18} className="text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State for Guardians with no wards */}
                {isGuardian && wards.length === 0 && (
                    <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                        <Shield size={64} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Linked Individuals</h3>
                        <p className="text-gray-500">This guardian hasn't linked any individuals yet.</p>
                    </div>
                )}

                {/* Media Preview Modal */}
                {selectedMedia && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
                        onClick={() => setSelectedMedia(null)}
                    >
                        <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setSelectedMedia(null)}
                                className="absolute -top-12 right-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                            >
                                <X size={24} className="text-white" />
                            </button>
                            {selectedMedia.type === 'image' ? (
                                <img
                                    src={selectedMedia.url}
                                    alt="Preview"
                                    className="w-full h-auto rounded-2xl max-h-[80vh] object-contain"
                                />
                            ) : (
                                <video
                                    src={selectedMedia.url}
                                    controls
                                    autoPlay
                                    className="w-full h-auto rounded-2xl max-h-[80vh]"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper Component
function ProfileField({ label, value, editMode, onChange, type = "text", options = [], fullWidth = false }) {
    return (
        <div className={fullWidth ? "md:col-span-2" : ""}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            {editMode ? (
                type === "select" ? (
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none transition-all"
                    >
                        <option value="">Select {label}</option>
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : type === "textarea" ? (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none transition-all resize-none"
                    />
                ) : (
                    <input
                        type={type}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none transition-all"
                    />
                )
            ) : (
                <div className="text-gray-900 font-medium">{value || '-'}</div>
            )}
        </div>
    );
}
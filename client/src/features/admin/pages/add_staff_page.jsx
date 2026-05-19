// CREATE: client/src/features/admin/pages/AddStaffPage.jsx
// Compact, no-scroll design

import { useState } from "react";
import { UserPlus, Upload, Mail, Lock, User, Shield, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AuthService from "../../auth/services/AuthService";

export default function AddStaffPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: 'male',
        role: 'staff',
        image: null
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload a valid image file');
                return;
            }

            setFormData(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return false;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Please enter a valid email');
            return false;
        }
        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        if (!formData.image) {
            toast.error('Profile image is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('gender', formData.gender);
        data.append('role', formData.role);
        data.append('avatar', formData.image);

        AuthService.register(data, {
            onSuccess: () => {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('authData');
                toast.success(`${formData.role === 'staff' ? 'Staff' : 'Admin'} member created!`);
                navigate('/admin/staff');
            },
            onFailed: (err) => {
                toast.error(err.message || 'Failed to create staff member');
                setLoading(false);
            }
        });
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b" style={{ background: 'linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)' }}>
                    <h1 className="text-2xl font-bold text-white">Add Staff Member</h1>
                    <p className="text-white/80 text-sm mt-1">Create a new staff or admin account</p>
                </div>

                {/* Form - Two Column Layout */}
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Profile Image *</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={32} className="text-gray-400" />
                                        )}
                                    </div>
                                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium cursor-pointer hover:bg-blue-100 transition-colors text-sm">
                                        <Upload size={16} />
                                        Choose
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Full Name *</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter full name"
                                        className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Email Address *</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="email@example.com"
                                        className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Gender & Role */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">Gender *</label>
                                    <div className="relative">
                                        <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-colors appearance-none bg-white cursor-pointer"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">Role *</label>
                                    <div className="relative">
                                        <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-colors appearance-none bg-white cursor-pointer"
                                        >
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Password *</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Minimum 8 characters"
                                        className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Confirm Password *</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Re-enter password"
                                        className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Role Info */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <p className="text-xs font-semibold text-blue-900 mb-2">Role Permissions:</p>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• <strong>Staff:</strong> Can moderate meetings</li>
                                    <li>• <strong>Admin:</strong> Full admin panel access</li>
                                </ul>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="flex-1 h-11 rounded-lg border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 h-11 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 text-sm"
                                    style={{
                                        background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)',
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={18} />
                                            Create Staff
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
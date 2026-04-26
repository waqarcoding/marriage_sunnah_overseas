import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiUserX } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';


export default function UsersPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);

    // Fetch users from API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('jwtToken');

                // @ts-ignore
                const baseurl = import.meta.env.VITE_BASE_URL; // get token from env
                const res = await axios.get(`${baseurl}/api/profile/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                setUsers(res.data); // assuming API returns array of profiles
            } catch (err) {
                console.error(err);

                toast.error('Failed to fetch users! ' + err);
            }
        };
        fetchUsers();
    }, []);

    // Filtered users
    const filteredUsers = users.filter(
        u =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    // Delete (dummy for now)
    const deleteUser = (id) => {

        setUsers(users.filter(u => u.id !== id));
        toast.success('User deleted successfully!');
        setConfirmAction(null);
    };

    // Toggle Active/Suspended (dummy for now)
    const toggleStatus = (id) => {
        setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
        toast.success('Status updated successfully!');
        setConfirmAction(null);
    };

    return (
        <div className="space-y-6 p-4">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white/20 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden">
                    <thead className="bg-white/30 backdrop-blur-md">
                        <tr>
                            <th className="py-3 px-4 text-left text-gray-700 font-semibold">#</th>
                            <th className="py-3 px-4 text-left text-gray-700 font-semibold">User</th>
                            <th className="py-3 px-4 text-left text-gray-700 font-semibold">Role</th>
                            <th className="py-3 px-4 text-left text-gray-700 font-semibold">Status</th>
                            <th className="py-3 px-4 text-right text-gray-700 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-white/10 transition-colors cursor-pointer">
                                <td className="py-3 px-4 text-gray-200">{user.id}</td>

                                {/* User Info */}
                                <td className="py-3 px-4 flex items-center space-x-3">
                                    <img
                                        onClick={() => navigate(`/profile/${user.id}`, { state: { user } })}
                                        src={user.photo_url || 'https://i.pravatar.cc/150?img=1'}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full object-cover cursor-pointer"
                                    />
                                    <div>
                                        <p className="text-gray-100 font-medium">{user.name}</p>
                                        <p className="text-gray-300 text-sm">{user.email}</p>
                                    </div>
                                </td>

                                {/* Role */}
                                <td className="py-3 px-4 text-gray-200">{user.role}</td>

                                {/* Status */}
                                <td className="py-3 px-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.is_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.is_verified ? 'Verified' : 'Not Verified'}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="py-3 px-4 flex justify-end items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => navigate(`/profile/${user.id}`, { state: { user } })} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500">
                                        <FiEdit2 size={18} />
                                    </button>
                                    <button onClick={() => setConfirmAction({ type: 'delete', user })} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                                        <FiTrash2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setConfirmAction({ type: 'toggle', user })}
                                        className={`p-2 rounded-lg text-white ${user.is_verified ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                                    >
                                        <FiUserX size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

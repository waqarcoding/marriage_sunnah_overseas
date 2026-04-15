import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminSettings() {
    // Example settings state
    const [settings, setSettings] = useState({
        siteName: 'Marriage Sunna Overseas',
        adminEmail: 'admin@example.com',
        allowRegistrations: true,
        maintenanceMode: false,
    });

    const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);

    const handleSave = () => {
        // Placeholder: call API to save settings
        toast.success('Settings saved successfully!');
    };

    const handleLogoutAll = () => {
        // Placeholder: call API to log out all users
        toast.success('All users logged out successfully!');
        setConfirmLogoutAll(false);
    };

    return (
        <div className="space-y-6 p-4">
            <Toaster position="top-right" reverseOrder={false} />

            <div className='h-10'></div>

            <h1 className="text-3xl font-bold text-gray-800">Admin Settings</h1>
            <p className="text-gray-600">Update site configuration and manage users.</p>

            {/* Settings Form */}
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl shadow-lg space-y-4">
                {/* Site Name */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Site Name</label>
                    <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Admin Email */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Admin Email</label>
                    <input
                        type="email"
                        value={settings.adminEmail}
                        onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Allow Registrations */}
                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        checked={settings.allowRegistrations}
                        onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
                        className="h-5 w-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-400"
                    />
                    <label className="text-gray-700 font-medium">Allow New User Registrations</label>
                </div>

                {/* Maintenance Mode */}
                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                        className="h-5 w-5 text-red-500 rounded focus:ring-2 focus:ring-red-400"
                    />
                    <label className="text-gray-700 font-medium">Enable Maintenance Mode</label>
                </div>

                {/* Logout All Users */}
                <div className="flex items-center justify-between mt-4">
                    <p className="text-gray-700 font-medium">Logout All Users</p>
                    <button
                        onClick={() => setConfirmLogoutAll(true)}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                        Save Settings
                    </button>
                </div>
            </div>

            {/* Confirm Logout All Modal */}
            {confirmLogoutAll && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 w-96 shadow-xl">
                        <h2 className="text-xl font-semibold mb-4">Confirm Logout All Users</h2>
                        <p className="mb-6 text-gray-700">
                            Are you sure you want to log out <strong>all users</strong> from the platform? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setConfirmLogoutAll(false)}
                                className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogoutAll}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

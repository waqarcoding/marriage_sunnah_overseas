import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, ChevronDown } from "lucide-react";

export default function ProfileDropdown({ avatar, name, role, onLogout, menuItems }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const dropdownRef = useRef(null);
    const isMountedRef = useRef(true);

    // ✅ Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // ✅ Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                if (isMountedRef.current) {
                    setIsOpen(false);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMenuClick = (item) => {
        if (!isMountedRef.current) return;

        if (item.action === "logout") {
            setShowLogoutDialog(true);
            setIsOpen(false);
        } else if (item.path) {
            window.location.href = item.path;
            setIsOpen(false);
        } else if (item.onClick) {
            item.onClick();
            setIsOpen(false);
        }
    };

    const handleLogout = () => {
        if (!isMountedRef.current) return;

        setShowLogoutDialog(false);
        if (onLogout) {
            onLogout();
        }
    };

    const handleToggle = () => {
        if (isMountedRef.current) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <>
            <div ref={dropdownRef} className="relative">
                {/* Profile Button */}
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={handleToggle}
                    className="flex items-center gap-2 pr-3 border-r cursor-pointer"
                    style={{ borderColor: "rgba(27, 77, 62, 0.15)" }}
                >
                    {/* Avatar */}
                    <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold select-none overflow-hidden"
                        style={{
                            background: "var(--primary, #1B4D3E)",
                            color: "#fff"
                        }}
                    >
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={name || "User"}
                                className="h-8 w-8 rounded-full object-cover"
                                onError={(e) => {
                                    const target = e.target;
                                    if (target instanceof HTMLImageElement && target.parentElement) {
                                        target.style.display = 'none';
                                        target.parentElement.textContent = (name?.[0] || "U").toUpperCase();
                                    }
                                }}

                            />
                        ) : (
                            (name?.[0] || "U").toUpperCase()
                        )}
                    </div>

                    {/* Name and Role */}
                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold leading-tight" style={{ color: "var(--background, #fff)" }}>
                            {name || "User"}
                        </p>
                        <p className="text-xs capitalize leading-tight" style={{ color: "var(--accent, #fff)", opacity: 0.7 }}>
                            {role || "Member"}
                        </p>
                    </div>

                    {/* Chevron */}
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="hidden sm:block"
                    >
                        <ChevronDown className="w-4 h-4" style={{ color: "var(--background, #fff)", opacity: 0.6 }} />
                    </motion.div>
                </motion.div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-2 min-w-[220px] bg-white rounded-xl shadow-xl border overflow-hidden"
                            style={{
                                borderColor: "rgba(27, 77, 62, 0.1)",
                                zIndex: 1000,
                            }}
                        >
                            {/* User Info Header */}
                            <div className="p-4 pb-3 border-b border-gray-100">
                                <p className="text-sm font-bold text-gray-900 mb-0.5">
                                    {name || "User"}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {role || "Member"}
                                </p>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                                {menuItems && menuItems.length > 0 ? (
                                    menuItems.map((item, idx) => (
                                        <motion.button
                                            key={idx}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleMenuClick(item)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                                            style={{
                                                borderTop: item.action === "logout" ? "1px solid #f3f4f6" : "none",
                                                marginTop: item.action === "logout" ? 4 : 0,
                                            }}
                                        >
                                            {item.icon && (
                                                <item.icon
                                                    className="w-[18px] h-[18px]"
                                                    style={{ color: item.color || "#6b7280" }}
                                                />
                                            )}
                                            <span
                                                className="text-sm font-medium"
                                                style={{ color: item.color || "#374151" }}
                                            >
                                                {item.label}
                                            </span>
                                        </motion.button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-400">
                                        No menu items
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Logout Confirmation Dialog */}
            <AnimatePresence>
                {showLogoutDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                        style={{
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            backdropFilter: "blur(4px)",
                        }}
                        onClick={() => setShowLogoutDialog(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                        >
                            {/* Icon */}
                            <div
                                className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
                                style={{
                                    background: "linear-gradient(135deg, #fee2e2, #fecaca)",
                                }}
                            >
                                <LogOut className="w-7 h-7 text-red-500" />
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                                Confirm Logout
                            </h3>

                            {/* Message */}
                            <p className="text-sm text-gray-600 text-center leading-relaxed mb-7">
                                Are you sure you want to log out? You'll need to sign in again to access your account.
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setShowLogoutDialog(false)}
                                    className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleLogout}
                                    className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/40"
                                >
                                    Logout
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
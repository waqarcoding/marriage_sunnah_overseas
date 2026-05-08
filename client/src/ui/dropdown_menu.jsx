import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, Settings, CreditCard, Shield, ChevronDown } from "lucide-react";

export default function ProfileDropdown({ avatar, name, role, onLogout, menuItems }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);





    const handleMenuClick = (item) => {
        if (item.action === "logout") {
            setShowLogoutDialog(true);
            setIsOpen(false);
        } else if (item.path) {
            window.location.href = item.path;
            setIsOpen(false);
        }
    };

    const handleLogout = () => {
        setShowLogoutDialog(false);
        onLogout();
    };

    return (
        <>
            <div ref={dropdownRef} style={{ position: "relative" }}>
                {/* Profile Button */}
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 pr-3 border-r cursor-pointer"
                    style={{ borderColor: "rgba(27, 77, 62, 0.15)" }}
                >
                    <span
                        className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold select-none bg-[var(--primary)]"
                        style={{
                            background: "var(--primary)",
                            color: "var(--primary-foreground)"
                        }}
                    >
                        {(avatar && (
                            <img
                                src={avatar}
                                alt={name}
                                className="h-8 w-8 rounded-full object-cover"
                            />
                        )) || (name?.[0] || "U").toUpperCase()}
                    </span>

                    <div>
                        <p className="text-sm font-semibold leading-tight" style={{ color: "var(--background)" }}>
                            {name}
                        </p>
                        <p className="text-xs capitalize leading-tight" style={{ color: "var(--accent)", opacity: 0.6 }}>
                            {role}
                        </p>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown style={{ width: 16, height: 16, color: "var(--background)", opacity: 0.6 }} />
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
                            style={{
                                position: "absolute",
                                top: "calc(100% + 8px)",
                                right: 0,
                                minWidth: 220,
                                backgroundColor: "#fff",
                                borderRadius: 12,
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                                border: "1px solid rgba(27, 77, 62, 0.1)",
                                overflow: "hidden",
                                zIndex: 1000,
                            }}
                        >
                            {/* User Info */}
                            <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #f0f5f3" }}>
                                <p style={{ fontSize: 14, fontWeight: 700, color: "#1B4D3E", marginBottom: 2 }}>
                                    {name}
                                </p>
                                <p style={{ fontSize: 12, color: "#1B4D3E", opacity: 0.6, textTransform: "capitalize" }}>
                                    {role}
                                </p>
                            </div>

                            {/* Menu Items */}
                            <div style={{ padding: "8px 0" }}>
                                {menuItems.map((item, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleMenuClick(item)}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            padding: "12px 16px",
                                            border: "none",
                                            background: "transparent",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            borderTop: item.action === "logout" ? "1px solid #f0f5f3" : "none",
                                            marginTop: item.action === "logout" ? 4 : 0,
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "#f0f5f3";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "transparent";
                                        }}
                                    >
                                        <item.icon style={{ width: 18, height: 18, color: item.color }} />
                                        <span style={{ fontSize: 14, fontWeight: 500, color: item.color }}>
                                            {item.label}
                                        </span>
                                    </motion.button>
                                ))}
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
                        style={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            backdropFilter: "blur(4px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 9999,
                        }}
                        onClick={() => setShowLogoutDialog(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: "#fff",
                                borderRadius: 20,
                                padding: 32,
                                maxWidth: 400,
                                width: "90%",
                                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                            }}
                        >
                            {/* Icon */}
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #fee2e2, #fecaca)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 20px",
                                }}
                            >
                                <LogOut style={{ width: 28, height: 28, color: "#ef4444" }} />
                            </div>

                            {/* Title */}
                            <h3
                                style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: "#1B4D3E",
                                    textAlign: "center",
                                    marginBottom: 8,
                                }}
                            >
                                Confirm Logout
                            </h3>

                            {/* Message */}
                            <p
                                style={{
                                    fontSize: 14,
                                    color: "#6b7280",
                                    textAlign: "center",
                                    lineHeight: 1.6,
                                    marginBottom: 28,
                                }}
                            >
                                Are you sure you want to log out? You'll need to sign in again to access your account.
                            </p>

                            {/* Buttons */}
                            <div style={{ display: "flex", gap: 12 }}>
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setShowLogoutDialog(false)}
                                    style={{
                                        flex: 1,
                                        padding: "12px 24px",
                                        borderRadius: 12,
                                        border: "1.5px solid #f0f5f3",
                                        background: "#fff",
                                        color: "#1B4D3E",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#f0f5f3";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#fff";
                                    }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleLogout}
                                    style={{
                                        flex: 1,
                                        padding: "12px 24px",
                                        borderRadius: 12,
                                        border: "none",
                                        background: "#ef4444",
                                        color: "#fff",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#dc2626";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#ef4444";
                                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(239, 68, 68, 0.3)";
                                    }}
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

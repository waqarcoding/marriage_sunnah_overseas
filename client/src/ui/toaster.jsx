import { Toaster, ToastBar } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const AppToaster = () => (
    <Toaster
        position="top-center"
        gutter={10}
        toastOptions={{
            duration: 2000,
        }}
    >
        {(t) => (
            <AnimatePresence>
                {t.visible && (
                    <motion.div
                        layout   // 🔥 important for stacking + removal
                        initial={{ opacity: 0, y: -40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <ToastBar
                            toast={t}
                            style={{
                                background:
                                    t.type === "success"
                                        ? "#1B4D3E"
                                        : t.type === "error"
                                            ? "#ffe4e6"
                                            : "#f0f5f3",

                                color:
                                    t.type === "success"
                                        ? "#fef3c7"
                                        : t.type === "error"
                                            ? "#7f1d1d"
                                            : "#1B4D3E",

                                borderRadius: "12px",
                                padding: "12px 16px",
                                fontSize: "14px",
                                minWidth: "260px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                                border: "1px solid rgba(27,77,62,0.1)",
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        )}
    </Toaster>
);

export default AppToaster;
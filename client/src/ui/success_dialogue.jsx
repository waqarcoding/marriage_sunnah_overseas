// @ts-nocheck
import { useEffect } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";

export default function SuccessDialog({ onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 2000); return () => clearTimeout(t); }, []);
    return (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-3xl px-10 py-8 flex flex-col items-center gap-3 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-gray-800 font-semibold text-lg">Profile Updated!</p>
                <p className="text-gray-400 text-sm">Your changes have been saved.</p>
            </div>
        </motion.div>
    );
}
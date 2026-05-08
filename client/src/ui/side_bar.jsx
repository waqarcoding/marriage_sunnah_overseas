import { Link, useLocation } from "react-router-dom";
import {
    HeartIcon,
    HandThumbUpIcon,
    UserIcon,
    UserGroupIcon,
    ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { FiMessageCircle } from "react-icons/fi";
import { Compass, CheckCircle } from "lucide-react";

const iconMap = {
    "Explore": <Compass className="w-6 h-6" />,
    "Match": <HeartIcon className="w-6 h-6" />,
    "Interest": <HandThumbUpIcon className="w-6 h-6" />,
    "Chats": <FiMessageCircle className="w-6 h-6" />,
    "Guardian": <UserGroupIcon className="w-6 h-6" />,
    "Profile": <UserIcon className="w-6 h-6" />,
    "Approvals": <CheckCircle className="w-6 h-6" />,
};

export default function Sidebar({ links = [], onLogout }) {
    const location = useLocation();

    return (
        <>
            <aside
                className="hidden md:flex md:flex-col md:w-15 md:h-screen text-white shadow-md items-center bg-primary"
            >
                <div className="flex items-center justify-center h-20 border-b border-primary/50 w-full">
                    <span className="text-lg font-bold text-center">MSO</span>
                </div>

                <div className="flex flex-col justify-between h-full w-full">
                    <nav className="flex flex-col items-center py-4 space-y-4 w-full">
                        {links.map((item, index) => (
                            <Link
                                key={index}
                                to={item.to}
                                className={`flex flex-col items-center justify-center w-full text-center transition-colors rounded-md py-2 ${location.pathname === item.to ? "bg-white/20" : "hover:bg-white/10"
                                    }`}
                            >
                                {iconMap[item.name] || <UserIcon className="w-6 h-6" />}
                                <span className="text-xs mt-1">{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    <button
                        onClick={onLogout}
                        className="flex flex-col items-center justify-center w-full text-center hover:bg-white/20 rounded-md py-2 mb-4"
                    >
                        <ArrowRightOnRectangleIcon className="w-6 h-6" />
                        <span className="text-xs mt-1">Logout</span>
                    </button>
                </div>
            </aside>

            <nav style={{ background: "var(--gradient-primary)" }} className="md:hidden fixed bottom-0 left-0 right-0 bg-primary text-white shadow-inner flex justify-around items-center h-16 z-50">
                {links.map((item) => (
                    <Link
                        key={item.name}
                        to={item.to}
                        className={`flex flex-col items-center justify-center text-xs p-2 rounded transition duration-200 ${location.pathname === item.to ? "bg-white/20" : "hover:bg-white/10"
                            }`}
                    >
                        {iconMap[item.name] || <UserIcon className="w-6 h-6" />}
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
        </>
    );
}
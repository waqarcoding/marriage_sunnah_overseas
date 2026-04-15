import { motion } from "motion/react";
import { Heart, MessageCircle, Grid3X3, User } from "lucide-react";
import React from 'react'; // <-- add this
interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "discover", icon: Grid3X3, label: "Discover" },
    { id: "likes", icon: Heart, label: "Likes" },
    { id: "messages", icon: MessageCircle, label: "Messages" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-inset-bottom">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center gap-1 relative"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActive
                    ? "bg-gradient-to-br from-pink-500 to-red-500"
                    : "bg-transparent"
                    }`}
                >
                  <Icon
                    className={`w-6 h-6 transition-colors ${isActive ? "text-white" : "text-gray-400"
                      }`}
                  />
                </div>
                <span
                  className={`text-xs transition-colors ${isActive ? "text-pink-500" : "text-gray-400"
                    }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { motion } from "motion/react";
import { Sliders, Search } from "lucide-react";
import { Badge } from "./ui/badge";
import React from 'react'; // <-- add this
interface FilterBarProps {
  activeFilters: string[];
  onFilterToggle: (filter: string) => void;
  onOpenSettings: () => void;
}

const filterOptions = [
  "Nearby",
  "New",
  "Active Now",
  "Recently Joined",
  "Verified",
];

export function FilterBar({
  activeFilters,
  onFilterToggle,
  onOpenSettings,
}: FilterBarProps) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-md"
          >
            <Sliders className="w-5 h-5 text-white" />
          </motion.button>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search interests, hobbies..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filterOptions.map((filter) => (
            <motion.button
              key={filter}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterToggle(filter)}
              className="shrink-0"
            >
              <Badge
                variant={activeFilters.includes(filter) ? "default" : "outline"}
                className={
                  activeFilters.includes(filter)
                    ? "bg-gradient-to-r from-pink-500 to-red-500 border-0 hover:from-pink-600 hover:to-red-600"
                    : ""
                }
              >
                {filter}
              </Badge>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

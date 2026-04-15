import { motion } from "motion/react";
import { Search, MoreVertical, Heart } from "lucide-react";
import React from 'react';
export function MessagesPage() {
  const conversations = [
    {
      id: 1,
      name: "Emma",
      age: 26,
      photo:
        "https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfHx8fDE3NzI2ODA2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      lastMessage: "That sounds like a great idea! When are you free?",
      time: "10m",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Marcus",
      age: 29,
      photo:
        "https://images.unsplash.com/photo-1584940121258-c2553b66a739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NzI2ODI5NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      lastMessage: "Haha that's hilarious! 😂",
      time: "1h",
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: "Sophia",
      age: 24,
      photo:
        "https://images.unsplash.com/photo-1602304648968-dd05bad729e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMG91dGRvb3IlMjBhZHZlbnR1cmV8ZW58MXx8fHwxNzcyNjMxMDMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      lastMessage: "I love that hiking trail! We should go together",
      time: "3h",
      unread: 0,
      online: false,
    },
    {
      id: 4,
      name: "Alex",
      age: 27,
      photo:
        "https://images.unsplash.com/photo-1695485121912-25c7ea05119c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBjYXN1YWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI2MjE0MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      lastMessage: "Coffee sounds perfect! See you at 3pm",
      time: "1d",
      unread: 0,
      online: false,
    },
    {
      id: 5,
      name: "Isabella",
      age: 28,
      photo:
        "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjY1MzI5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      lastMessage: "You: That restaurant was amazing!",
      time: "2d",
      unread: 0,
      online: false,
    },
    {
      id: 6,
      name: "James",
      age: 30,
      photo:
        "https://images.unsplash.com/photo-1666620657207-c748f7600a42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjB0cmF2ZWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI2ODI5NTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      lastMessage: "I'd love to show you my photography portfolio",
      time: "3d",
      unread: 1,
      online: false,
    },
    {
      id: 7,
      name: "Mia",
      age: 25,
      photo:
        "https://images.unsplash.com/photo-1650895422057-355060e05c95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGJlYWNoJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNjgwNjAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      lastMessage: "Can't wait for the weekend! 🌴",
      time: "4d",
      unread: 0,
      online: false,
    },
  ];

  const newMatches = [
    {
      id: 101,
      name: "Oliver",
      photo:
        "https://images.unsplash.com/photo-1644579140038-6140b454a250?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBhcnRpc3RpYyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjY4Mjk1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      time: "2h",
    },
    {
      id: 102,
      name: "Luna",
      photo:
        "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc3MjYxNjk2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      time: "5h",
    },
    {
      id: 103,
      name: "Ethan",
      photo:
        "https://images.unsplash.com/photo-1599139497467-3e7f6e244c8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBvdXRkb29yJTIwaGlraW5nfGVufDF8fHx8MTc3MjY4MzI5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      time: "1d",
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 sticky top-0 z-10">
          <h1 className="text-2xl mb-3">Messages</h1>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
            />
          </div>
        </div>

        {/* New Matches */}
        {newMatches.length > 0 && (
          <div className="bg-white border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm text-gray-500">New Matches</h2>
              <span className="text-xs text-pink-500">
                {newMatches.length} new
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {newMatches.map((match) => (
                <motion.button
                  key={match.id}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0"
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-pink-500 bg-gray-100">
                      <img
                        src={match.photo}
                        alt={match.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center border-2 border-white">
                      <Heart className="w-3 h-3 text-white fill-white" />
                    </div>
                  </div>
                  <div className="text-xs mt-2 text-center truncate w-20">
                    {match.name}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Messages List */}
        <div className="bg-white">
          <div className="px-6 py-3 border-b border-gray-100">
            <h2 className="text-sm text-gray-500">Messages</h2>
          </div>
          {conversations.map((conversation, index) => (
            <motion.button
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-4 flex items-center gap-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={conversation.photo}
                    alt={conversation.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {conversation.online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900">
                      {conversation.name}, {conversation.age}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {conversation.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm truncate ${conversation.unread > 0
                        ? "text-gray-900"
                        : "text-gray-500"
                      }`}
                  >
                    {conversation.lastMessage}
                  </p>
                  {conversation.unread > 0 && (
                    <div className="ml-2 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">
                        {conversation.unread}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* More Button */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("More options");
                }}
                className="flex-shrink-0"
              >
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </motion.div>
            </motion.button>
          ))}
        </div>

        {/* Empty State or Load More */}
        <div className="text-center py-8 text-gray-500 text-sm">
          You're all caught up! 💬
        </div>
      </div>
    </div>
  );
}

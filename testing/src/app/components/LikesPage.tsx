import { motion } from "motion/react";
import { Heart, Star, MessageCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import React from 'react'; // <-- add this
export function LikesPage() {
  const likesReceived = [
    {
      id: 1,
      name: "Sophie",
      age: 25,
      location: "Brooklyn, NY",
      photo:
        "https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfHx8fDE3NzI2ODA2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      type: "like",
      time: "2 hours ago",
      interests: ["Art", "Coffee", "Travel"],
    },
    {
      id: 2,
      name: "Olivia",
      age: 27,
      location: "Manhattan, NY",
      photo:
        "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjY1MzI5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      type: "super",
      time: "5 hours ago",
      interests: ["Finance", "Yoga", "Wine"],
    },
    {
      id: 3,
      name: "Lucas",
      age: 29,
      location: "Queens, NY",
      photo:
        "https://images.unsplash.com/photo-1584940121258-c2553b66a739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NzI2ODI5NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      type: "like",
      time: "1 day ago",
      interests: ["Coding", "Gaming", "Music"],
    },
    {
      id: 4,
      name: "Ava",
      age: 24,
      location: "East Village, NY",
      photo:
        "https://images.unsplash.com/photo-1650895422057-355060e05c95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGJlYWNoJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNjgwNjAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      type: "like",
      time: "1 day ago",
      interests: ["Content", "Beach", "Dance"],
    },
    {
      id: 5,
      name: "Nathan",
      age: 30,
      location: "Chelsea, NY",
      photo:
        "https://images.unsplash.com/photo-1666620657207-c748f7600a42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjB0cmF2ZWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI2ODI5NTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      type: "super",
      time: "2 days ago",
      interests: ["Architecture", "Travel", "Jazz"],
    },
    {
      id: 6,
      name: "Chloe",
      age: 26,
      location: "Williamsburg, NY",
      photo:
        "https://images.unsplash.com/photo-1602304648968-dd05bad729e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMG91dGRvb3IlMjBhZHZlbnR1cmV8ZW58MXx8fHwxNzcyNjMxMDMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      type: "like",
      time: "3 days ago",
      interests: ["Hiking", "Sustainability", "Cooking"],
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 sticky top-0 z-10">
          <h1 className="text-2xl">Likes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {likesReceived.length} people like you
          </p>
        </div>

        {/* Premium Blur Banner */}
        <div className="bg-gradient-to-br from-pink-500 to-purple-600 m-4 rounded-3xl p-6 text-white text-center">
          <div className="text-4xl mb-2">💎</div>
          <h3 className="text-xl mb-2">See Who Likes You</h3>
          <p className="text-sm text-white/80 mb-4">
            Upgrade to Premium to see all your likes and match instantly
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-white text-pink-600 px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
          >
            Upgrade Now
          </motion.button>
        </div>

        {/* Likes Grid */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {likesReceived.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                className="relative"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
                  {/* Blur effect for premium feature */}
                  {index > 2 && (
                    <div className="absolute inset-0 backdrop-blur-xl bg-white/30 z-10 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🔒</div>
                        <div className="text-sm text-gray-700">Premium</div>
                      </div>
                    </div>
                  )}

                  <img
                    src={person.photo}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Type Badge */}
                  {person.type === "super" && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

                  {/* Info */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-lg mb-1">
                      {person.name}, {person.age}
                    </div>
                    <div className="text-xs opacity-90 mb-2">
                      {person.location}
                    </div>
                    {index <= 2 && (
                      <div className="flex gap-1">
                        {person.interests.slice(0, 2).map((interest, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs bg-white/20 backdrop-blur-sm border-0 text-white"
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {index <= 2 && (
                    <div className="absolute top-3 left-3 right-3 flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="flex-1 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm flex items-center justify-center gap-1"
                      >
                        <Heart className="w-4 h-4" />
                        Like
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="py-2 px-3 rounded-full bg-white/20 backdrop-blur-sm text-white"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>

                {index <= 2 && (
                  <div className="mt-2 text-center text-xs text-gray-500">
                    {person.time}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Message */}
        <div className="text-center py-8 text-gray-500 text-sm">
          Check back later for more likes! 💕
        </div>
      </div>
    </div>
  );
}

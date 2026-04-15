import { motion } from "motion/react";
import {
  Settings,
  Camera,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Users,
  Award,
  Edit3,
  ChevronRight,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function ProfilePage() {
  const userProfile = {
    name: "You",
    age: 28,
    location: "New York, NY",
    occupation: "UX Designer",
    education: "Rhode Island School of Design",
    bio: "Passionate about creating meaningful digital experiences. Love exploring new restaurants, hiking on weekends, and finding the best coffee spots in the city.",
    interests: [
      "Design",
      "Coffee",
      "Hiking",
      "Photography",
      "Travel",
      "Cooking",
      "Art",
      "Music",
    ],
    photos: [
      "https://images.unsplash.com/photo-1559674850-47859f577fba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBzZWxmaWUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI2ODMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc3MjYxNjk2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1599139497467-3e7f6e244c8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBvdXRkb29yJTIwaGlraW5nfGVufDF8fHx8MTc3MjY4MzI5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    stats: {
      likes: 142,
      matches: 38,
      superLikes: 12,
    },
  };

  const settingsOptions = [
    { icon: Settings, label: "Settings & Privacy", color: "text-gray-600" },
    { icon: Award, label: "Get Verified", color: "text-blue-500" },
    { icon: Heart, label: "Upgrade to Premium", color: "text-pink-500" },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-2xl">Profile</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>

        {/* Profile Photos Grid */}
        <div className="bg-white p-4 mb-3">
          <div className="grid grid-cols-3 gap-3">
            {userProfile.photos.map((photo, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100"
              >
                <img
                  src={photo}
                  alt={`Profile ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs">
                    Main
                  </div>
                )}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
                >
                  <Edit3 className="w-4 h-4 text-gray-700" />
                </motion.button>
              </motion.div>
            ))}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-pink-500 transition-colors"
            >
              <Camera className="w-8 h-8 text-gray-400" />
              <span className="text-xs text-gray-500">Add Photo</span>
            </motion.button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white p-6 mb-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl mb-1">
                {userProfile.name}, {userProfile.age}
              </h2>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{userProfile.location}</span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <Edit3 className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{userProfile.occupation}</span>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{userProfile.education}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white p-6 mb-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-2">
                <Heart className="w-7 h-7 text-pink-500" />
              </div>
              <div className="text-2xl mb-1">{userProfile.stats.likes}</div>
              <div className="text-sm text-gray-500">Likes Given</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                <Users className="w-7 h-7 text-purple-500" />
              </div>
              <div className="text-2xl mb-1">{userProfile.stats.matches}</div>
              <div className="text-sm text-gray-500">Matches</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <Award className="w-7 h-7 text-blue-500" />
              </div>
              <div className="text-2xl mb-1">{userProfile.stats.superLikes}</div>
              <div className="text-sm text-gray-500">Super Likes</div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white p-6 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg">About Me</h3>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="text-pink-500 text-sm"
            >
              Edit
            </motion.button>
          </div>
          <p className="text-gray-700 leading-relaxed">{userProfile.bio}</p>
        </div>

        {/* Interests */}
        <div className="bg-white p-6 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg">Interests</h3>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="text-pink-500 text-sm"
            >
              Edit
            </motion.button>
          </div>
          <div className="flex flex-wrap gap-2">
            {userProfile.interests.map((interest, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-sm px-4 py-2"
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>

        {/* Settings Options */}
        <div className="bg-white mb-3">
          {settingsOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.button
                key={index}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${option.color}`} />
                  <span className="text-gray-700">{option.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </motion.button>
            );
          })}
        </div>

        {/* Premium CTA */}
        <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-6 mx-4 mb-6">
          <div className="text-white text-center">
            <div className="text-4xl mb-2">✨</div>
            <h3 className="text-xl mb-2">Upgrade to Premium</h3>
            <p className="text-sm text-white/80 mb-4">
              Get unlimited likes, see who likes you, and more exclusive features
            </p>
            <Button className="bg-white text-pink-600 hover:bg-white/90 w-full">
              See Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { motion } from "motion/react";
import { ChevronLeft, Heart, MessageCircle, Star, UserPlus, Settings } from "lucide-react";

interface NotificationPageProps {
  onBack: () => void;
  onProfileClick?: (person: any) => void;
}

export function NotificationPage({ onBack, onProfileClick }: NotificationPageProps) {
  const notifications = [
    {
      id: 1,
      type: "like",
      user: {
        name: "Sophie",
        age: 25,
        photo:
          "https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfHx8fDE3NzI2ODA2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      },
      message: "liked your profile",
      time: "2 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "super_like",
      user: {
        name: "Olivia",
        age: 27,
        photo:
          "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjY1MzI5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      },
      message: "sent you a Super Like!",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 3,
      type: "message",
      user: {
        name: "Emma",
        age: 26,
        photo:
          "https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfHx8fDE3NzI2ODA2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      },
      message: "sent you a message",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 4,
      type: "match",
      user: {
        name: "Lucas",
        age: 29,
        photo:
          "https://images.unsplash.com/photo-1584940121258-c2553b66a739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NzI2ODI5NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      },
      message: "You matched!",
      time: "2 hours ago",
      read: true,
    },
    {
      id: 5,
      type: "like",
      user: {
        name: "Ava",
        age: 24,
        photo:
          "https://images.unsplash.com/photo-1650895422057-355060e05c95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGJlYWNoJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNjgwNjAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      },
      message: "liked your profile",
      time: "5 hours ago",
      read: true,
    },
    {
      id: 6,
      type: "profile_view",
      user: {
        name: "Nathan",
        age: 30,
        photo:
          "https://images.unsplash.com/photo-1666620657207-c748f7600a42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjB0cmF2ZWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI2ODI5NTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      },
      message: "viewed your profile",
      time: "Yesterday",
      read: true,
    },
    {
      id: 7,
      type: "message",
      user: {
        name: "Marcus",
        age: 29,
        photo:
          "https://images.unsplash.com/photo-1584940121258-c2553b66a739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NzI2ODI5NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      },
      message: "replied to your message",
      time: "Yesterday",
      read: true,
    },
    {
      id: 8,
      type: "system",
      message: "Your profile was featured in Discover!",
      time: "2 days ago",
      read: true,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return (
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-600" />
          </div>
        );
      case "super_like":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Star className="w-5 h-5 text-blue-600 fill-blue-600" />
          </div>
        );
      case "message":
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-purple-600" />
          </div>
        );
      case "match":
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-green-600 fill-green-600" />
          </div>
        );
      case "profile_view":
        return (
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-orange-600" />
          </div>
        );
      case "system":
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-600" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-gray-600" />
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </motion.button>
          <h1 className="text-xl font-medium">Notifications</h1>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Today Section */}
          <div className="px-4 py-3 text-sm font-medium text-gray-500">
            Today
          </div>
          {notifications
            .filter((n) => !n.time.includes("day"))
            .map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => notification.user && onProfileClick?.(notification.user)}
                className={`bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? "bg-pink-50/30" : ""
                }`}
              >
                {/* Avatar or Icon */}
                {notification.user ? (
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={notification.user.photo}
                        alt={notification.user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? "font-medium text-gray-900" : "text-gray-600"}`}>
                    {notification.user && (
                      <span className="font-semibold text-gray-900">
                        {notification.user.name}, {notification.user.age}{" "}
                      </span>
                    )}
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.time}
                  </p>
                </div>

                {/* Unread Indicator */}
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0" />
                )}
              </motion.div>
            ))}

          {/* Earlier Section */}
          <div className="px-4 py-3 text-sm font-medium text-gray-500 mt-2">
            Earlier
          </div>
          {notifications
            .filter((n) => n.time.includes("day"))
            .map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                onClick={() => notification.user && onProfileClick?.(notification.user)}
                className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {notification.user ? (
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={notification.user.photo}
                        alt={notification.user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600">
                    {notification.user && (
                      <span className="font-semibold text-gray-900">
                        {notification.user.name}, {notification.user.age}{" "}
                      </span>
                    )}
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.time}
                  </p>
                </div>
              </motion.div>
            ))}
        </div>

        {/* Empty State Message */}
        <div className="text-center py-8 text-gray-500 text-sm">
          You're all caught up! 🎉
        </div>
      </div>
    </div>
  );
}

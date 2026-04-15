import { motion } from "motion/react";
import { MoreVertical } from "lucide-react";
import ImageAvatar from "../../../components/ImageAvatar";

// Props:
//   conversation — { id, name, age, photo, online, time, lastMessage, unread }
//   index        — number (for staggered animation)
//   onClick      — fn(conversation)
//   onMore       — fn(conversation)

export default function ConversationItem({ conversation, index = 0, onClick, onMore }) {
    console.log(JSON.stringify(conversation));
    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick?.(conversation)}
            className="w-full px-6 py-4 flex items-center gap-4
                border-b border-gray-100 last:border-0
                hover:bg-gray-50 transition-colors text-left"
        >
            {/* ── Avatar ── */}
            <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">
                    {conversation.avatar ? (
                        <ImageAvatar
                            images={conversation.avatar}
                            gender={conversation.gender}
                            alt={conversation.name}
                            interestStatus={"accepted"}
                            isShowPending={false}
                            className="w-full h-full object-cover  "
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center
                            font-bold text-xl text-gray-400 select-none">
                            {conversation.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                    )}
                </div>
                {/* Online dot */}
                {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500
                        rounded-full border-2 border-white" />
                )}
            </div>

            {/* ── Content ── */}
            <div className="flex-1 min-w-0">
                {/* Name + time */}
                <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                        {conversation.name}
                        {conversation.age && (
                            <span className="text-gray-500 font-normal">, {conversation.age}</span>
                        )}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {conversation.time}
                    </span>
                </div>

                {/* Last message + unread badge */}
                <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${conversation.unread > 0 ? "text-gray-900 font-medium" : "text-gray-500"
                        }`}>
                        {conversation.lastMessage || conversation.last_message || "Start a conversation…"}
                    </p>
                    {conversation.unread > 0 && (
                        <div className="ml-2 min-w-[20px] h-5 px-1 rounded-full bg-pink-500
                            flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                                {conversation.unread > 9 ? "9+" : conversation.unread}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── More button ── */}
            <motion.div
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onMore?.(conversation); }}
                className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
                <MoreVertical className="w-5 h-5 text-gray-400" />
            </motion.div>
        </motion.button>
    );
}
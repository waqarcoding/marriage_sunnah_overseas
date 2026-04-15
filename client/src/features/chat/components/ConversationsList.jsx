import ConversationItem from "./ConversationItem";

// Props:
//   conversations — array of conversation objects
//   onClick       — fn(conversation)
//   onMore        — fn(conversation)

export default function ConversationsList({ conversations, onClick, onMore }) {
    return (
        <div>
            {/* Header */}
            <div className="bg-white">
                <div className="px-6 py-3 border-b border-gray-100">
                    <h2 className="text-lg font-medium">
                        <span className="text-gray-500">Messages</span>
                    </h2>
                </div>

                {/* List */}
                {conversations.map((conversation, index) => (
                    <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        index={index}
                        onClick={onClick}
                        onMore={onMore}
                    />
                ))}
            </div>

            {/* Footer / empty state */}
            <div className="text-center py-8 text-gray-500 text-sm">
                {conversations.length === 0
                    ? "No conversations yet 💬"
                    : conversations.length > 10 ? "You're all caught up! 💬" : ""
                }
            </div>
        </div>
    );
}
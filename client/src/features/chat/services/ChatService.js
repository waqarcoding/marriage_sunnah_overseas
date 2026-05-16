import Api from "../../../api/Api";

class ChatService {
    constructor() {
        this.base = "/chat";
    }

    async getConversationUsers() {
        try {
            const res = await Api._fetch(`${this.base}/conversation-users`, {
                method: "GET",
                headers: Api._getHeaders(),
            });
            return res;
        } catch (err) {
            console.error("Failed to fetch conversation users", err);
            throw err;
        }
    }

    async startChat({ item, activeTab }) {
        console.log('🚀 startChat called with:', {
            activeTab,
            item,
            hasToProfile: !!item?.toProfile,
            hasFromProfile: !!item?.fromProfile,
            toProfileIndividualId: item?.toProfile?.individual_id,
            fromProfileIndividualId: item?.fromProfile?.individual_id
        });

        let receiverId;
        let receiverProfile;

        if (activeTab.toLowerCase() === "sent") {
            receiverId = item?.toProfile?.individual_id;
            receiverProfile = item?.toProfile;
        } else if (activeTab.toLowerCase() === "received") {
            receiverId = item?.fromProfile?.individual_id;
            receiverProfile = item?.fromProfile;
        } else {
            // Fallback: try both
            receiverId = item?.toProfile?.individual_id || item?.fromProfile?.individual_id;
            receiverProfile = item?.toProfile || item?.fromProfile;
        }

        console.log('🔍 Resolved:', { receiverId, receiverProfile });

        if (!receiverId) {
            console.error("❌ Receiver ID not found", {
                activeTab,
                itemStructure: {
                    hasToProfile: !!item?.toProfile,
                    hasFromProfile: !!item?.fromProfile,
                    toProfile: item?.toProfile,
                    fromProfile: item?.fromProfile
                }
            });
            throw new Error('Receiver ID not found. Please check the interest data.');
        }

        await this.addConversationUser(receiverId);

        return {
            id: receiverId,
            name: receiverProfile?.name || 'Unknown User',
            avatar: receiverProfile?.image || receiverProfile?.avatar || '/default-avatar.png',
        };
    }

    async addConversationUser(receiverId) {
        try {
            const res = await Api._fetch(`${this.base}/add-conversation`, {
                method: "POST",
                headers: Api._getHeaders(),
                body: JSON.stringify({ receiver_id: receiverId, message: "Hi! 👋" }),
            });
            return res;
        } catch (err) {
            const msg = err?.message?.toLowerCase() || "";
            if (msg.includes("already exists") || msg.includes("conflict")) {
                return { success: true, alreadyExists: true };
            }
            console.error("Failed to add conversation user", err);
            throw err;
        }
    }

    async sendMessage({ receiverId, message }) {
        try {
            const res = await Api._fetch(`${this.base}/send-message`, {
                method: "POST",
                headers: Api._getHeaders(),
                body: JSON.stringify({ receiver_id: receiverId, message }),
            });
            return res;
        } catch (err) {
            console.error("Failed to send message", err);
            throw err;
        }
    }

    async getMessages({ receiverId }) {
        try {
            const res = await Api._fetch(
                `${this.base}/get-messages?receiver_id=${receiverId}`,
                { method: "GET", headers: Api._getHeaders() }
            );
            return res;
        } catch (err) {
            console.error("Failed to fetch messages", err);
            throw err;
        }
    }

    // ✅ NEW: Get unread message count
    async getUnreadCount() {
        try {
            const res = await Api._fetch(`${this.base}/unread-count`, {
                method: "GET",
                headers: Api._getHeaders(),
            });
            return res;
        } catch (err) {
            console.error("Failed to fetch unread count", err);
            throw err;
        }
    }
    async clearUnreadCount() {
        try {
            const res = await Api._fetch(`${this.base}/unread-count/clear`, {
                method: "POST",
                headers: Api._getHeaders(),
            });
            return res;
        } catch (err) {
            console.error("Failed to clear unread count", err);
            throw err;
        }
    }

    deleteConversation(conversationId) {
        return Api._fetch(
            `${this.base}/conversation/${conversationId}`,
            { method: 'DELETE', headers: Api._getHeaders() }
        );
    }
}

export default new ChatService();
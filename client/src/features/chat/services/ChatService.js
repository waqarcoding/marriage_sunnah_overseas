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
                body: JSON.stringify({ receiver_id: receiverId }),
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
    // ADD THIS METHOD TO YOUR ChatService.js

    /**
     * Get conversation details including match_id
     * @param {string|number} receiverId - The other user's ID
     * @returns {Promise<{success: boolean, data: {match_id: number}}>}
     */
    async getConversationDetails(receiverId) {
        try {
            // Option 1: If you have a dedicated endpoint
            const response = await Api.get(`/chat/conversation/${receiverId}`);
            return response;

            // Option 2: If you don't have an endpoint, get it from conversations list
            // const conversations = await this.getConversationUsers();
            // const conversation = conversations.data?.find(c => 
            //     String(c.other_user_id) === String(receiverId)
            // );
            // return {
            //     success: true,
            //     data: {
            //         match_id: conversation?.match_id || null
            //     }
            // };
        } catch (error) {
            console.error('Error getting conversation details:', error);
            return { success: false, data: null };
        }
    }
}

export default new ChatService();
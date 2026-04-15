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
        let receiverId;

        if (activeTab.toLowerCase() === "sent") {
            receiverId = item.toProfile?.individual_id;
        } else if (activeTab.toLowerCase() === "received") {
            receiverId = item.fromProfile?.individual_id;
        } else {
            receiverId = item.toProfile?.individual_id || item.fromProfile?.individual_id;
        }

        if (!receiverId) {
            console.error("Receiver ID not found");
            return null;
        }

        await this.addConversationUser(receiverId);

        return {
            id: receiverId,
            name: item.toProfile?.name || item.fromProfile?.name,
            avatar: item.toProfile?.image || item.fromProfile?.image,
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


}

export default new ChatService();
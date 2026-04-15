import { getIO, isUserOnline } from '../config/socket.js';
import db from '../models/index.js';
import { Op } from 'sequelize';
const { Message, User, Profile } = db;

export const sendMessage = async (req, res, next) => {
  try {
    const sender_id = req.user.id;
    const { receiver_id, message, interest_id } = req.body;
    const receiverIdNum = Number(receiver_id);

    const saved = await Message.create({
      sender_id,
      receiver_id: receiverIdNum,
      message,
      interest_id: interest_id || null,
      is_seen: false,
    });

    getIO().to(`user_${receiverIdNum}`).emit('message', saved);

    res.json({ success: true, data: saved }); // ✅ include success
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const current_user_id = req.user.id;
    const receiverIdNum = Number(req.query.receiver_id);

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: current_user_id, receiver_id: receiverIdNum },
          { sender_id: receiverIdNum, receiver_id: current_user_id },
        ],
      },
      order: [['created_at', 'ASC']],
    });

    res.json({ success: true, data: messages }); // ✅ include success
  } catch (err) {
    next(err);
  }
};



export const getConversationUsers = async (req, res, next) => {
  try {
    const current_user_id = req.user.id;

    // 1️⃣ Get all messages involving current user
    const messages = await Message.findAll({
      attributes: ["sender_id", "receiver_id", "message", "created_at"],
      where: {
        [Op.or]: [
          { sender_id: current_user_id },
          { receiver_id: current_user_id },
        ],
      },
      order: [['created_at', 'DESC']], // latest first
    });

    // 2️⃣ Collect unique user IDs
    const interactedIds = new Set();
    messages.forEach(msg => {
      if (msg.sender_id !== current_user_id) interactedIds.add(msg.sender_id);
      if (msg.receiver_id !== current_user_id) interactedIds.add(msg.receiver_id);
    });

    if (interactedIds.size === 0) return res.json({ success: true, data: [] });

    // 3️⃣ Get profile info
    const profiles = await Profile.findAll({
      where: { individual_id: { [Op.in]: [...interactedIds] } },
      attributes: ["individual_id", "name", "images", "city", "country"],
    });

    // 4️⃣ Map conversations with last message
    const conversations = [...profiles].map(p => {
      // Find latest message between current user and this profile
      const lastMsg = messages.find(
        m => (m.sender_id === p.individual_id && m.receiver_id === current_user_id) ||
          (m.receiver_id === p.individual_id && m.sender_id === current_user_id)
      );

      return {
        id: p.individual_id,
        other_user_id: p.individual_id,
        name: p.name || "Unknown",
        avatar: p.images || "/placeholder.png",
        location: [p.city, p.country].filter(Boolean).join(", "),
        last_message: lastMsg?.message || "",
        last_message_at: lastMsg?.created_at || null,
        is_online: isUserOnline(p.individual_id),
      };
    });

    res.json({ success: true, data: conversations });

  } catch (err) {
    console.error(err);
    next(err);
  }
};
// ---------------- Add Conversation User ----------------
export const addConversationUser = async (req, res, next) => {
  try {
    const sender_id = req.user.id; // from JWT
    const { receiver_id, message } = req.body;

    // Create first message
    const saved = await Message.create({
      sender_id,
      receiver_id,
      message: message || "Hi! 👋",
      is_seen: false
    });

    // Emit via Socket.io
    getIO().to(`user_${receiver_id}`).emit('message', saved);

    res.json(saved);
  } catch (err) {
    next(err);
  }
};
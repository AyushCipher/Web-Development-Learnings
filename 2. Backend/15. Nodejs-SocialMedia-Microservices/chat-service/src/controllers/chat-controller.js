const mongoose = require("mongoose");
const Message = require("../models/Message");
const logger = require("../utils/logger");
const { buildConversationId } = require("../utils/conversation");

// GET /api/chat/conversations
// Returns one row per conversation this user is part of - just enough to
// render a conversation list: the other participant's id and a preview of
// the most recent message in that conversation.
const listConversations = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // $match this user's messages -> $sort newest first -> $group by
    // conversationId keeping only the first (i.e. newest, thanks to the sort
    // above) document per group. That $first is what gives us "the most
    // recent message per conversation" in one query instead of N queries.
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    const result = conversations.map((c) => {
      const { sender, recipient } = c.lastMessage;
      const otherUserId =
        sender.toString() === req.user.userId ? recipient : sender;

      return {
        conversationId: c._id,
        otherUserId,
        lastMessage: {
          text: c.lastMessage.text,
          sender: c.lastMessage.sender,
          createdAt: c.lastMessage.createdAt,
        },
      };
    });

    res.json({ success: true, conversations: result });
  } catch (e) {
    logger.error("Error listing conversations", e);
    res.status(500).json({
      success: false,
      message: "Error listing conversations",
    });
  }
};

// GET /api/chat/messages/:otherUserId
const getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;

    const conversationId = buildConversationId(
      req.user.userId,
      req.params.otherUserId
    );

    // Oldest first - normal chat reading order (newest message at the
    // bottom), unlike post-service's feed which sorts newest first.
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip(startIndex)
      .limit(limit);

    const totalMessages = await Message.countDocuments({ conversationId });

    res.json({
      success: true,
      messages,
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
    });
  } catch (e) {
    logger.error("Error fetching messages", e);
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
    });
  }
};

module.exports = { listConversations, getMessages };

const ChatMessage = require('../models/ChatMessage');

// @desc    Send message to AI
// @route   POST /api/ai/chat
// @access  Private
exports.sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;

    // Save user message
    const userMsg = await ChatMessage.create({
      userId: req.user.id,
      role: 'user',
      content: message
    });

    // Mock AI logic for now (can be connected to GPT or other LLM)
    let aiResponseContent = "I'm Looper, your AI assistant! How can I help with your pet today?";
    
    if (message.toUpperCase().includes('SCHEDULE')) {
      aiResponseContent = "I can help you schedule a checkup. Would you like to view nearby clinics or book an appointment?";
    } else if (message.toUpperCase().includes('EMERGENCY')) {
      aiResponseContent = "⚠️ If this is an emergency, please visit the nearest clinic immediately. I can show you emergency vets nearby.";
    } else if (message.toUpperCase().includes('HEALTH RISK')) {
      aiResponseContent = "Based on your pet's recent records, everything looks stable. Would you like a detailed health analysis?";
    }

    // Save AI response
    const aiMsg = await ChatMessage.create({
      userId: req.user.id,
      role: 'assistant',
      content: aiResponseContent
    });

    res.status(200).json({
      success: true,
      data: aiMsg
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get chat history
// @route   GET /api/ai/chat/history
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const history = await ChatMessage.find({ userId: req.user.id }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

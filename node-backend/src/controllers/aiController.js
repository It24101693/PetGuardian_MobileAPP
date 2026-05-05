const ChatMessage = require('../models/ChatMessage');
const Pet = require('../models/Pet');

// @desc    Send message to AI
// @route   POST /api/ai/chat
// @access  Private
exports.sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log('📩 Received message:', message);

    // Save user message
    await ChatMessage.create({
      userId: req.user.id,
      role: 'user',
      content: message
    });

    // Get user's pets for context
    
    // Enhanced AI logic with context awareness
    const aiResponseContent = generateAIResponse(message, pets, req.user);
    console.log('🤖 AI Response:', aiResponseContent.substring(0, 50) + '...');

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
    console.error('❌ AI Chat Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// AI Response Generator with context
function generateAIResponse(message, pets, user) {
  const msgLower = message.toLowerCase().trim();
  const petCount = pets.length;
  const petNames = pets.map(p => p.name).join(', ');

  console.log('🔍 Processing message:', msgLower);
  console.log('🐾 Pet count:', petCount);

  // Greeting responses
  if (msgLower.match(/^(hi|hello|hey|hii|hiii|hai)$/i)) {
    console.log('✅ Matched: Greeting');
    if (petCount === 0) {
      return "Hi! 👋 I'm Looper, your AI pet assistant. I noticed you haven't added any pets yet. Would you like to add your first pet?";
    }
    return `Hi! 👋 I'm Looper, your AI assistant for ${petNames}. How can I help you today?`;
  }

  // Schedule/Appointment related
  if (msgLower.includes('schedule') || msgLower.includes('checkup') || msgLower.includes('appointment')) {
    console.log('✅ Matched: Schedule/Appointment');
    if (petCount === 0) {
      return "To schedule a checkup, you'll need to add a pet first. Would you like to add one now?";
    }
    return `I can help you schedule a checkup for ${petNames}. Would you like to:\n\n• View nearby veterinary clinics\n• Book an appointment\n• See your upcoming appointments`;
  }

  // Emergency related
  if (msgLower.includes('emergency') || msgLower.includes('urgent')) {
    console.log('✅ Matched: Emergency');
    return "⚠️ EMERGENCY PROTOCOL\n\nIf your pet is experiencing:\n• Difficulty breathing\n• Severe bleeding\n• Seizures\n• Loss of consciousness\n\nPlease visit the nearest emergency vet immediately! I can show you emergency clinics nearby.";
  }

  // Health risk assessment
  if (msgLower.includes('health') && (msgLower.includes('risk') || msgLower.includes('check'))) {
    console.log('✅ Matched: Health Risk');
    if (petCount === 0) {
      return "I'd love to help assess health risks, but you need to add your pet first. Once added, I can analyze their health records and vaccination status.";
    }
    
    return `Based on ${petNames}'s records:\n\n✓ I can analyze their health passport\n✓ Check vaccination status\n✓ Review recent medical records\n✓ Identify potential health risks\n\nWould you like a detailed health analysis?`;
  }

  // Vaccination queries
  if (msgLower.includes('vaccin') || msgLower.includes('shot') || msgLower.includes('immuniz')) {
    console.log('✅ Matched: Vaccination');
    if (petCount === 0) {
      return "To track vaccinations, please add your pet first. I'll help you keep their vaccination records up to date!";
    }
    return `I can help you manage ${petNames}'s vaccination records. Would you like to:\n\n• View vaccination history\n• Check upcoming vaccinations\n• Get reminders for due vaccines`;
  }

  // Food/Diet related
  if (msgLower.includes('food') || msgLower.includes('diet') || msgLower.includes('eat') || msgLower.includes('feed')) {
    console.log('✅ Matched: Food/Diet');
    if (petCount > 0) {
      const petTypes = [...new Set(pets.map(p => p.species))].join(' and ');
      return `For ${petTypes}s like ${petNames}, I recommend:\n\n• High-quality protein-based food\n• Age-appropriate portions\n• Fresh water always available\n• Avoid chocolate, grapes, onions\n\nWould you like specific dietary recommendations?`;
    }
    return "I can provide dietary advice once you add your pet. Different species and breeds have different nutritional needs!";
  }

  // Disease/Symptoms
  if (msgLower.includes('sick') || msgLower.includes('symptom') || msgLower.includes('disease') || msgLower.includes('ill')) {
    console.log('✅ Matched: Disease/Symptoms');
    return `I can help identify potential health issues! You can:\n\n• Use the AI Disease Scanner to analyze symptoms\n• Upload photos of skin conditions\n• Get treatment recommendations\n\n⚠️ Remember: Always consult a vet for serious concerns!`;
  }

  // Breed identification
  if (msgLower.includes('breed') || msgLower.includes('what kind') || msgLower.includes('identify')) {
    console.log('✅ Matched: Breed');
    return `I can identify your pet's breed! Just:\n\n1. Go to the AI Scan tab\n2. Upload a clear photo\n3. I'll analyze and identify the breed\n\nThis works for both dogs and cats! 🐕🐈`;
  }

  // General pet care
  if (msgLower.includes('care') || msgLower.includes('tips') || msgLower.includes('advice')) {
    console.log('✅ Matched: Pet Care');
    return `Here are essential pet care tips:\n\n🏥 Regular vet checkups\n💉 Keep vaccinations current\n🍖 Balanced nutrition\n🏃 Daily exercise\n❤️ Lots of love and attention\n\nWhat specific aspect would you like to know more about?`;
  }

  // Default response with helpful suggestions
  console.log('⚠️ No match - using default response');
  if (petCount === 0) {
    return "I'm Looper, your AI pet assistant! 🐾\n\nI can help you with:\n• Adding and managing pets\n• Scheduling vet appointments\n• Health monitoring\n• Disease detection\n• Breed identification\n\nStart by adding your first pet!";
  }

  return `I'm here to help with ${petNames}! I can assist with:\n\n• 📅 Scheduling checkups\n• 🏥 Health risk assessment\n• 💉 Vaccination tracking\n• 🔬 Disease detection\n• 📊 Health records\n\nWhat would you like to know?`;
}

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

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const communityPostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
    content: { type: String, required: [true, 'Content is required'], trim: true },
    category: {
      type: String,
      enum: ['general', 'health', 'nutrition', 'training', 'lost_found', 'adoption', 'question', 'tips'],
      default: 'general',
    },
    feeling: { type: String, default: null },
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

communityPostSchema.index({ userId: 1 });
communityPostSchema.index({ category: 1 });
communityPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);

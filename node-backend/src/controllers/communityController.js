const CommunityPost = require('../models/CommunityPost');

// @desc  Get all posts
// @route GET /api/community
const getAllPosts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    const posts = await CommunityPost.find(filter)
      .populate('userId', 'fullName profileImageUrl username')
      .populate('comments.userId', 'fullName profileImageUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await CommunityPost.countDocuments(filter);
    res.json({ success: true, count: posts.length, total, data: posts });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single post
// @route GET /api/community/:id
const getPostById = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('userId', 'fullName profileImageUrl username')
      .populate('comments.userId', 'fullName profileImageUrl');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

// @desc  Create post
// @route POST /api/community
const createPost = async (req, res, next) => {
  try {
    const postData = { ...req.body, userId: req.user._id };
    if (req.file) { postData.imageUrl = req.file.path; postData.imagePublicId = req.file.filename; }
    const post = await CommunityPost.create(postData);
    const populated = await post.populate('userId', 'fullName profileImageUrl username');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc  Update post
// @route PUT /api/community/:id
const updatePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (post.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    const updated = await CommunityPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete post
// @route DELETE /api/community/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (post.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await CommunityPost.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Post deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc  Like / unlike post
// @route POST /api/community/:id/like
const likePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    const alreadyLiked = post.likes.includes(req.user._id);
    if (alreadyLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    res.json({ success: true, liked: !alreadyLiked, likesCount: post.likes.length });
  } catch (error) {
    next(error);
  }
};

// @desc  Add comment
// @route POST /api/community/:id/comment
const addComment = async (req, res, next) => {
  try {
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { userId: req.user._id, userName: req.user.fullName, content: req.body.content } } },
      { new: true }
    ).populate('comments.userId', 'fullName profileImageUrl');
    res.json({ success: true, data: post.comments });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost, likePost, addComment };

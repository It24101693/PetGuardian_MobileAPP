const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadCommunityImage } = require('../config/cloudinary');
const { getAllPosts, getPostById, createPost, updatePost, deletePost, likePost, addComment } = require('../controllers/communityController');

const router = express.Router();

router.use(protect);

router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', uploadCommunityImage.single('image'), createPost);
router.put('/:id', uploadCommunityImage.single('image'), updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.post('/:id/comment', addComment);

module.exports = router;

import express from 'express';
import {createPost,getPosts,getPostBySlug,updatePost,deletePost, getTopPosts} from '../controllers/postController.js';

import { authenticateToken } from '../middlewares/authMiddleware.js';
import { incrementPostView } from '../controllers/postController.js';
import { getFollowedPosts } from '../controllers/postController.js';


const router = express.Router();
router.get('/top', getTopPosts);
router.get('/following/posts', authenticateToken, getFollowedPosts);
router.post('/:slug/view', incrementPostView); 
router.get('/', getPosts);
router.get('/:slug', getPostBySlug);
router.post('/', authenticateToken, createPost);
router.put('/:slug', authenticateToken, updatePost);
router.delete('/:slug', authenticateToken, deletePost);

export default router;

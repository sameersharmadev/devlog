import express from 'express';
import {createPost, getMyPosts, getPostsByUser,getPosts,getPostBySlug,updatePost,deletePost, getTopPosts, getLatestPosts} from '../controllers/postController.js';

import { authenticateToken } from '../middlewares/authMiddleware.js';
import { incrementPostView } from '../controllers/postController.js';
import { getFollowedPosts } from '../controllers/postController.js';


const router = express.Router();
router.get('/latest', getLatestPosts); 
router.get('/top', getTopPosts);
router.get('/user/:id', getPostsByUser);
router.get('/me', authenticateToken, getMyPosts); 
router.get('/following/posts', authenticateToken, getFollowedPosts);
router.post('/:slug/view', incrementPostView); 
router.get('/', getPosts);
router.get('/:slug', getPostBySlug);
router.post('/', authenticateToken, createPost);
router.put('/:slug', authenticateToken, updatePost);
router.delete('/:slug', authenticateToken, deletePost);
export default router;

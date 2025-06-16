import express from 'express';
import {createPost,getPosts,getPostBySlug,updatePost,deletePost} from '../controllers/postController.js';

import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/', getPosts);
router.get('/:slug', getPostBySlug);
router.post('/', authenticateToken, isAdmin, createPost);
router.put('/:slug', authenticateToken, isAdmin, updatePost);
router.delete('/:slug', authenticateToken, isAdmin, deletePost);

export default router;

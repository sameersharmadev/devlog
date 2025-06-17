import express from 'express';
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment
} from '../controllers/commentController.js';
import {authenticateToken} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:post_id', getCommentsByPost);
router.post('/', authenticateToken, createComment);
router.patch('/:id', authenticateToken, updateComment);
router.delete('/:id', authenticateToken, deleteComment);

export default router;

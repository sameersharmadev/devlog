import express from 'express';
import {
  createFeedback,
  getFeedbackForPost,
  deleteFeedback,
  getAverageRating,
  getUserAverageRating
} from '../controllers/feedbackController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/', authenticateToken, createFeedback);
router.get('/post/:post_id', getFeedbackForPost);
router.get('/post/:post_id/average', getAverageRating);
router.delete('/post/:id', authenticateToken, deleteFeedback);
router.get('/user/:user_id/average', getUserAverageRating);

export default router;

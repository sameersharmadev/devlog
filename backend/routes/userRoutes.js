import express from 'express';
import { getUserById,getSuggestedUsers } from '../controllers/userController.js';
import {authenticateToken} from '../middlewares/authMiddleware.js'
const router = express.Router();
router.get('/suggestions/get', authenticateToken, getSuggestedUsers);
router.get('/:id', getUserById); 
export default router;

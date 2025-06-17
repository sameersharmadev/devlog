import express from 'express';
import {followUser, unfollowUser, getFollowStatus, getFollowers, getFollowing} from '../controllers/followController.js';

import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/:id', authenticateToken, followUser);

router.delete('/:id', authenticateToken, unfollowUser);

router.get('/:id/status', authenticateToken, getFollowStatus);

router.get('/:id/followers', getFollowers);

router.get('/:id/following', getFollowing);

export default router;

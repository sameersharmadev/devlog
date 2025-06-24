import express from 'express';
import pool from '../db/index.js'
import { register, login, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js'
import passport from '../oauth/passportStrategies.js';
import jwt from 'jsonwebtoken';
const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, async (req, res) => {
  const { avatar_url, bio, username, email } = req.body;
  const userId = req.user.userId;

  try {
    const check = await pool.query(
      `SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3`,
      [username, email, userId]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already in use' });
    }
    await pool.query(
      `UPDATE users
         SET avatar_url = COALESCE(NULLIF($1, ''), avatar_url),
             bio = COALESCE(NULLIF($2, ''), bio),
             username = COALESCE($3, username),
             email = COALESCE($4, email),
             updated_at = NOW()
         WHERE id = $5`,
      [avatar_url, bio, username, email, userId]
    );

    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/google', (req, res, next) => {
  const from = req.query.from || '/';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    state: encodeURIComponent(from),
  })(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const { token } = req.user;
    const from = decodeURIComponent(req.query.state || '/');
    res.redirect(`${FRONTEND_URL}/oauth-success?token=${token}&from=${from}`);
  }
);

export default router
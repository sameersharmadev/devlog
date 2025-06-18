import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER CONTROLLER
export const register = async (req, res) => {
  const { user, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const avatar_url = `https://api.dicebear.com/8.x/shapes/svg?seed=${encodeURIComponent(user)}`;

  try {
    const existing = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, user]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, avatar_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, avatar_url`,
      [user, email, hash, avatar_url]
    );

    const newUser = result.rows[0];

    // Automatically log in after registration
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User created',
      token,
      user: newUser
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error creating user' });
  }
};

// LOGIN CONTROLLER
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'User does not exist' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET ME CONTROLLER
export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT id, username, email, avatar_url, bio, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

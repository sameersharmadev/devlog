import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
  console.log(JWT_SECRET)
  const { user, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, user]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [user, email, hash]
    );

    res.status(201).json({ message: 'User created', user: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating user' });
  }
};

export const login = async (req, res) => {
  console.log(JWT_SECRET)
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

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

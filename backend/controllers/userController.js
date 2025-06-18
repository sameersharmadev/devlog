import pool from '../db/index.js';

export const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT id, username, email, role, avatar_url, bio, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user by ID:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

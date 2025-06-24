import pool from '../db/index.js';

export const getUserById = async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, role, avatar_url, bio, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user by ID:', err.message || err);
    res.status(500).json({ error: 'Server error' });
  }
};


export const getSuggestedUsers = async (req, res) => {
  console.log('Decoded JWT user:', req.user);
  console.log('getSuggestedUsers called');
  console.log('req.user:', req.user);

  const userId = req.user?.userId;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const { rows: following } = await pool.query(
      `SELECT following_id FROM follows WHERE follower_id = $1`,
      [userId]
    );
    const followingIds = following.map((f) => f.following_id);

    const { rows: fof } = await pool.query(
      `SELECT DISTINCT following_id FROM follows
       WHERE follower_id = ANY($1) AND following_id != $2`,
      [followingIds, userId]
    );
    const fofIds = fof.map((f) => f.following_id);

    const { rows: popular } = await pool.query(
      `SELECT users.id FROM users
       LEFT JOIN follows ON users.id = follows.following_id
       WHERE users.id != $1
       GROUP BY users.id
       ORDER BY COUNT(follows.follower_id) DESC
       LIMIT 20`,
      [userId]
    );
    const popularIds = popular.map((u) => u.id);

    const mergedIds = Array.from(
      new Set([...fofIds, ...popularIds])
    ).filter((id) => !followingIds.includes(id)).slice(0, 12);

    if (!mergedIds.length) return res.json({ users: [] });

    const { rows: users } = await pool.query(
      `SELECT id, username, avatar_url, bio FROM users WHERE id = ANY($1)`,
      [mergedIds]
    );

    res.json({ users });
  } catch (err) {
    console.error('Error in getSuggestedUsers:', err);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

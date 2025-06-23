import express from 'express';
import pool from '../db/index.js'; 

const router = express.Router();

router.get('/', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.status(400).json({ error: 'Search term is required' });
  }

  const searchTerm = `%${q.trim()}%`;

  try {
    const postsQuery = `
      SELECT id, title, slug
      FROM posts
      WHERE title ILIKE $1 OR content ILIKE $1
      ORDER BY created_at DESC
      LIMIT 5
    `;

    const usersQuery = `
      SELECT id, username, avatar_url
      FROM users
      WHERE username ILIKE $1
      ORDER BY username ASC
      LIMIT 5
    `;

    const [postsResult, usersResult] = await Promise.all([
      pool.query(postsQuery, [searchTerm]),
      pool.query(usersQuery, [searchTerm])
    ]);

    res.json({
      posts: postsResult.rows,
      users: usersResult.rows,
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
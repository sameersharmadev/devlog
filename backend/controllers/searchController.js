import pool from '../db/index.js';

// Full-text search handler
export const search = async (req, res) => {
  const { query } = req.query;

  // Validate query input
  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        posts.id,
        posts.title,
        posts.slug,
        posts.description,
        posts.cover_image,
        posts.tags,
        posts.created_at,
        users.username AS author
      FROM posts
      JOIN users ON posts.author_id = users.id
      WHERE (
        to_tsvector('english', COALESCE(posts.title, '') || ' ' || COALESCE(posts.content, '') || ' ' || COALESCE(posts.description, '')) ||
        to_tsvector('english', COALESCE(array_to_string(posts.tags, ' '), '')) ||
        to_tsvector('english', COALESCE(users.username, ''))
      ) @@ plainto_tsquery('english', $1)
      AND posts.is_published = TRUE
      ORDER BY posts.created_at DESC
      LIMIT 20
      `,
      [query]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
};

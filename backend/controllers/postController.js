import pool from '../db/index.js';
import slugify from '../utils/slugify.js';

async function generateUniqueSlug(baseSlug, excludeSlug = null) {
  let slug = baseSlug, suffix = 1;
  while (true) {
    const query = excludeSlug
      ? `SELECT 1 FROM posts WHERE slug = $1 AND slug != $2`
      : `SELECT 1 FROM posts WHERE slug = $1`;
    const values = excludeSlug ? [slug, excludeSlug] : [slug];
    const check = await pool.query(query, values);
    if (check.rows.length === 0) break;
    slug = `${baseSlug}-${suffix++}`;
  }
  return slug;
}

export const createPost = async (req, res) => {
  try {
    const { title, content, tags = [], cover_image, description } = req.body;
    const author_id = req.user.userId;
    const slug = await generateUniqueSlug(slugify(title));

    const result = await pool.query(
      `INSERT INTO posts (title, slug, content, tags, cover_image, description, author_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, slug, content, tags, cover_image, description || '', author_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create Post Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT * FROM posts ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Fetch Posts Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(`SELECT * FROM posts WHERE slug = $1`, [slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Fetch Post Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFollowedPosts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
      SELECT p.*
      FROM posts p
      INNER JOIN follows f ON p.author_id = f.following_id
      WHERE f.follower_id = $1
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get Followed Posts Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, tags, cover_image, description } = req.body;
    const { userId, role } = req.user;

    const original = await pool.query(`SELECT * FROM posts WHERE slug = $1`, [slug]);
    if (original.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

    const post = original.rows[0];
    if (post.author_id !== userId && role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to update this post' });
    }

    const baseSlug = title ? slugify(title) : slug;
    const newSlug = await generateUniqueSlug(baseSlug, slug);

    const result = await pool.query(
      `UPDATE posts
       SET title = $1,
           slug = $2,
           content = $3,
           tags = $4,
           cover_image = $5,
           description = $6,
           updated_at = NOW()
       WHERE slug = $7 RETURNING *`,
      [
        title || post.title,
        newSlug,
        content || post.content,
        tags || post.tags,
        cover_image || post.cover_image,
        description || post.description,
        slug
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Update Post Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId, role } = req.user;

    const original = await pool.query(`SELECT * FROM posts WHERE slug = $1`, [slug]);
    if (original.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

    const post = original.rows[0];
    if (post.author_id !== userId && role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to delete this post' });
    }

    const result = await pool.query(`DELETE FROM posts WHERE slug = $1 RETURNING *`, [slug]);
    res.status(200).json({ message: 'Post deleted successfully', post: result.rows[0] });
  } catch (err) {
    console.error('Delete Post Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const incrementPostView = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `UPDATE posts SET view_count = view_count + 1 WHERE slug = $1 RETURNING view_count`,
      [slug]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Post not found' });

    res.status(200).json({ views: result.rows[0].view_count });
  } catch (err) {
    console.error('Increment Post View Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTopPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT
        p.*,
        COALESCE(AVG(f.rating), 0) AS avg_rating,
        COUNT(DISTINCT f.id) AS feedback_count,
        COUNT(DISTINCT c.id) AS comment_count,
        p.view_count,
        (
          COALESCE(AVG(f.rating), 0) * 0.5 +
          COUNT(DISTINCT f.id) * 0.3 +
          COUNT(DISTINCT c.id) * 0.1 +
          p.view_count * 0.1
        ) AS score
      FROM posts p
      LEFT JOIN post_feedback f ON p.id = f.post_id
      LEFT JOIN post_comments c ON p.id = c.post_id
      GROUP BY p.id
      ORDER BY score DESC, p.created_at DESC, p.id DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get Top Posts Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};




export const getMyPosts = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'SELECT * FROM posts WHERE author_id = $1 ORDER BY created_at DESC, id DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
};

export const getLatestPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
      SELECT *
      FROM posts
      ORDER BY created_at DESC, id DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get Latest Posts Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPostsByUser = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM posts WHERE author_id = $1`,
      [userId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT *
       FROM posts
       WHERE author_id = $1 
       ORDER BY created_at DESC, id DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.status(200).json({
      posts: result.rows,
      total,
      page,
      hasMore: offset + result.rows.length < total,
    });
  } catch (err) {
    console.error('Get Posts by User Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

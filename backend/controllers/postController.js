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
    const { title, content, tags = [], cover_image } = req.body;
    const slug = await generateUniqueSlug(slugify(title));
    const result = await pool.query(
      `INSERT INTO posts (title, slug, content, tags, cover_image)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, slug, content, tags, cover_image]
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
      `SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
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

export const updatePost = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, tags, cover_image, is_published } = req.body;
    const original = await pool.query(`SELECT * FROM posts WHERE slug = $1`, [slug]);
    if (original.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

    const old = original.rows[0];
    const baseSlug = title ? slugify(title) : slug;
    const newSlug = await generateUniqueSlug(baseSlug, slug);

    const result = await pool.query(
      `UPDATE posts SET title = $1, slug = $2, content = $3, tags = $4, cover_image = $5,
       is_published = $6, updated_at = NOW() WHERE slug = $7 RETURNING *`,
      [
        title || old.title,
        newSlug,
        content || old.content,
        tags || old.tags,
        cover_image || old.cover_image,
        is_published ?? old.is_published,
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
    const result = await pool.query(`DELETE FROM posts WHERE slug = $1 RETURNING *`, [slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete Post Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

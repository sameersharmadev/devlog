import pool from '../db/index.js';

export const createComment = async (req, res) => {
  try {
    const { post_id, parent_comment_id, content } = req.body;
    const user_id = req.user.userId;

    const result = await pool.query(
      `INSERT INTO post_comments (post_id, user_id, parent_comment_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [post_id, user_id, parent_comment_id || null, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create Comment Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCommentsByPost = async (req, res) => {
  try {
    const { post_id } = req.params;

    const result = await pool.query(
      `SELECT c.*, u.username FROM post_comments c
       JOIN users u ON c.user_id = u.id
       WHERE post_id = $1 ORDER BY created_at ASC`,
      [post_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get Comments Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user.userId;

    const existing = await pool.query(`SELECT * FROM post_comments WHERE id = $1`, [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
    if (existing.rows[0].user_id !== user_id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });

    const result = await pool.query(
      `UPDATE post_comments SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [content, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Update Comment Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const existing = await pool.query(`SELECT * FROM post_comments WHERE id = $1`, [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
    if (existing.rows[0].user_id !== user_id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });

    await pool.query(`DELETE FROM post_comments WHERE id = $1`, [id]);
    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Delete Comment Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

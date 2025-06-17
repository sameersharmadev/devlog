import pool from '../db/index.js';

export const createFeedback = async (req, res) => {
    const { post_id, rating, comment } = req.body;
    const user_id = req.user.userId;

    try {
        const result = await pool.query(
            `INSERT INTO post_feedback (post_id, user_id, rating, comment)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (post_id, user_id)
             DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = NOW()
             RETURNING *`,
            [post_id, user_id, rating, comment || null]
        );
        res.status(201).json({ success: true, feedback: result.rows[0] });
    } catch (err) {
        console.error('Feedback Insert Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getFeedbackForPost = async (req, res) => {
    const { post_id } = req.params;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
        return res.status(400).json({ error: 'Invalid pagination parameters' });
    }
    const offset = (page - 1) * limit;

    try {
        const feedbackResult = await pool.query(
            `SELECT pf.*, u.username FROM post_feedback pf JOIN users u ON pf.user_id = u.id WHERE pf.post_id = $1 ORDER BY pf.created_at DESC LIMIT $2 OFFSET $3`,
            [post_id, limit, offset]
        );
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM post_feedback WHERE post_id = $1`,
            [post_id]
        );
        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            feedback: feedbackResult.rows,
            pagination: { total, page, totalPages, limit }
        });
    } catch (err) {
        console.error('Feedback Fetch Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteFeedback = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const check = await pool.query(
            `SELECT * FROM post_feedback WHERE id = $1`,
            [id]
        );
        if (check.rowCount === 0) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        const feedback = check.rows[0];
        if (feedback.user_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this feedback' });
        }
        const result = await pool.query(
            `DELETE FROM post_feedback WHERE id = $1 RETURNING *`,
            [id]
        );
        res.status(200).json({ success: true, deleted: result.rows[0] });
    } catch (err) {
        console.error('Delete Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const getAverageRating = async (req, res) => {
  const { post_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT AVG(rating)::numeric(3,2) AS average_rating FROM post_feedback WHERE post_id = $1`,
      [post_id]
    );

    const average = result.rows[0].average_rating;

    res.status(200).json({
      success: true,
      post_id,
      average_rating: average ? parseFloat(average) : 0
    });
  } catch (err) {
    console.error('Average Rating Fetch Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

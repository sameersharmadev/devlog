import express from "express";
import pool from "../db/index.js";
import {authenticateToken} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const postQuery = `
      SELECT id, title, view_count
      FROM posts
      WHERE author_id = $1
    `;
    const { rows: posts } = await pool.query(postQuery, [userId]);

    const postCount = posts.length;
    const totalViews = posts.reduce((acc, post) => acc + post.view_count, 0);

    const viewsPerPost = posts.map(post => ({
      title: post.title.length > 12 ? `${post.title.slice(0, 12)}...` : post.title,
      views: post.view_count,
    }));

    const ratingQuery = `
      SELECT AVG(rating)::numeric(10, 2) AS avg_rating
      FROM post_feedback
      WHERE post_id IN (
        SELECT id FROM posts WHERE author_id = $1
      )
    `;
    const { rows: ratingResult } = await pool.query(ratingQuery, [userId]);
    const avgRating = ratingResult[0]?.avg_rating || "0.00";

    res.json({
      totalViews,
      postCount,
      avgRating,
      viewsPerPost,
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import pool from '../db/index.js';

export const followUser = async (req, res) => {
  const followerId = req.user.userId;
  const followingId = parseInt(req.params.id);

  if (followerId === followingId)
    return res.status(400).json({ error: "You cannot follow yourself" });

  try {
    await pool.query(
      `INSERT INTO follows (follower_id, following_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [followerId, followingId]
    );
    res.status(200).json({ message: "Followed successfully" });
  } catch (err) {
    console.error('Follow Error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const unfollowUser = async (req, res) => {
  const followerId = req.user.userId;
  const followingId = parseInt(req.params.id);

  try {
    await pool.query(
      `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );
    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error('Unfollow Error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowStatus = async (req, res) => {
  const followerId = req.user.userId;
  const followingId = parseInt(req.params.id);

  try {
    const result = await pool.query(
      `SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );
    res.status(200).json({ isFollowing: result.rowCount > 0 });
  } catch (err) {
    console.error('Follow Status Error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowers = async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.avatar_url FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = $1`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get Followers Error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowing = async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.avatar_url FROM follows f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = $1`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get Following Error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

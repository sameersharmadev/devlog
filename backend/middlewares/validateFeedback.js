export default function validateFeedback(req, res, next) {
    const { post_id, user_id, rating } = req.body;

    if (!post_id || !user_id || !rating) {
        return res.status(400).json({ error: "post_id, user_id, and rating are required" });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "rating must be between 1 and 5" });
    }

    next();
}

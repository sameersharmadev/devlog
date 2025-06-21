import { useEffect, useState } from 'react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

export default function CommentList({ postId, authorId }) {
    const [comments, setComments] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);

    async function fetchComments() {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/comments/${postId}`);
        const data = await res.json();
        setComments(buildCommentTree(data));
    }

    useEffect(() => {
        fetchComments();
    }, [postId]);

    return (
        <div className="mt-8 space-y-4 md:space-y-8">
            <div className="mb-8 md:mb-12">
                <CommentForm postId={postId} onCommentPosted={fetchComments} />
            </div>

            {comments.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={setReplyingTo}
                    onUpdated={fetchComments}
                    authorId={authorId}
                />
            ))}

            {replyingTo && (
                <div className="ml-4 mt-4 pl-4">
                    <CommentForm
                        postId={postId}
                        parentCommentId={replyingTo}
                        onCommentPosted={() => {
                            setReplyingTo(null);
                            fetchComments();
                        }}
                        onCancel={() => setReplyingTo(null)}
                    />
                </div>
            )}
        </div>
    );

}

function buildCommentTree(comments) {
    const map = {};
    comments.forEach((c) => (map[c.id] = { ...c, replies: [] }));
    return comments
        .filter((c) => !c.parent_comment_id)
        .map((c) => addReplies(map, c.id));

    function addReplies(map, id) {
        const comment = map[id];
        comment.replies = comments.filter((c) => c.parent_comment_id === id).map((c) => addReplies(map, c.id));
        return comment;
    }
}

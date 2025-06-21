import { useState } from 'react';
import { Link } from 'react-router-dom';
import CommentForm from './CommentForm';

export default function CommentItem({ comment, onReply, onUpdated, authorId }) {
    const [isEditing, setIsEditing] = useState(false);

    async function handleDelete() {
        if (!confirm('Delete this comment?')) return;
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/comments/${comment.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        onUpdated();
    }

    return (
        <div className="mt-2">
            {/* User info */}
            <div className="flex items-center gap-2 mb-1">
                <Link to={`/user/${comment.user_id}`} className="flex items-center gap-2 hover:underline">
                    <img
                        src={comment.avatar_url || '/default-avatar.png'}
                        alt={comment.username}
                        className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700"
                    />
                    <span className="text-sm font-medium">
                        {comment.username}
                        {comment.user_id === authorId && (
                            <span className="text-accent text-xs ml-1">(author)</span>
                        )}
                    </span>
                </Link>
            </div>

            {/* Content or edit form */}
            {isEditing ? (
                <CommentForm
                    postId={comment.post_id}
                    parentCommentId={comment.parent_comment_id}
                    commentId={comment.id}
                    existingContent={comment.content}
                    onCommentPosted={() => {
                        setIsEditing(false);
                        onUpdated();
                    }}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                <p className="text-sm mb-1">{comment.content}</p>
            )}

            {/* Actions */}
            <div className="text-xs flex gap-4 mb-1">
                <button onClick={() => onReply(comment.id)} className="text-accent hover:underline">
                    Reply
                </button>
                {comment.canEdit && (
                    <button onClick={() => setIsEditing(true)} className="text-accent hover:underline">
                        Edit
                    </button>
                )}
                {comment.canDelete && (
                    <button onClick={handleDelete} className="text-accent hover:underline">
                        Delete
                    </button>
                )}
            </div>

            {/* Nested replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="comment-replies ml-3 pl-2 space-y-3 mt-3">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                            onUpdated={onUpdated}
                            authorId={authorId}
                        />
                    ))}
                </div>
            )}

        </div>
    );
}

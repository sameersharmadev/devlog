import { useState } from 'react';
import { Send } from 'lucide-react';

export default function CommentForm({ postId, parentCommentId, commentId, existingContent = '', onCommentPosted, onCancel }) {
  const [content, setContent] = useState(existingContent || '');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;

    const res = await fetch(`${BASE_URL}/api/comments`, {
      method: commentId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ post_id: postId, parent_comment_id: parentCommentId, content, comment_id: commentId }),
    });

    if (!res.ok) return;
    setContent('');
    onCommentPosted();
  }

  return (
    <form onSubmit={handleSubmit} className="relative bg-lightCard dark:bg-darkCard p-2 rounded-xl shadow-sm">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={commentId ? 'Edit your comment...' : 'Write a comment...'}
        className="w-full resize-none bg-transparent border-none focus:outline-none p-2 pr-10 min-h-[60px] text-sm dark:text-neutral-200 placeholder-neutral-500"
      />
      <button
        type="submit"
        className="absolute bottom-2 right-2 text-accent hover:text-accent-dark transition-colors p-1 rounded-full"
      >
        <Send className="w-5 h-5" />
      </button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-2 right-10 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          X
        </button>
      )}
    </form>
  );
}

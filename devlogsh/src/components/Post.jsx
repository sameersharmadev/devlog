import { useEffect, useState } from 'react';
import { Eye, MessageSquare, Star } from 'lucide-react';
import { Link } from 'react-router';

export default function PostCard({ post }) {
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${post.author_id}`);
        if (!res.ok) throw new Error('Failed to fetch author');
        const data = await res.json();
        setAuthor(data);
      } catch (err) {
        console.error('Author fetch error:', err);
      }
    };

    fetchAuthor();
  }, [post.author_id]);

  return (
    <div className="bg-card dark:bg-darkCard p-4 md:p-6 rounded-xl shadow-md flex flex-col md:flex-row gap-6">
      {post.cover_image && (
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full md:w-48 h-40 object-cover rounded-lg"
        />
      )}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold">{post.title}</h3>
          {author && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <img
                src={author.avatar_url || '/default-avatar.png'}
                alt={author.username}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span>{author.username}</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground line-clamp-3 mb-3">{post.content}</p>
        <div className="flex items-center text-sm gap-4 text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Star size={16} />
            {post.average_rating || 0}
          </div>
          <div className="flex items-center gap-1">
            <Eye size={16} />
            {post.view_count}
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={16} />
            {post.comment_count || 0}
          </div>
        </div>
        <Link to={`/post/${post.slug}`} className="text-accent font-medium hover:underline">
          Read more
        </Link>
      </div>
    </div>
  );
}

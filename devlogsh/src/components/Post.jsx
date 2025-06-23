import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, MessageSquare, Star, Clock, Pencil, Search } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

function generateRandomGradient() {
  const hue1 = Math.floor(Math.random() * 360);
  const hue2 = (hue1 + Math.floor(Math.random() * 90) + 60) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 70%, 60%))`;
}

function capitalizeFirst(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncateUsername(username) {
  if (!username) return '';
  return username.length > 20 ? username.slice(0, 20) + '…' : username;
}

function calculateReadTime(text = '') {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [fallbackGradient, setFallbackGradient] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [viewCount, setViewCount] = useState(post.view_count || 0);
  const [commentCount, setCommentCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authorRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${post.author_id}`);
        if (!authorRes.ok) throw new Error('Failed to fetch author');
        setAuthor(await authorRes.json());
      } catch (err) {
        console.error('Author fetch error:', err);
      }

      try {
        const ratingRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/feedback/post/${post.id}/average`);
        if (!ratingRes.ok) throw new Error('Failed to fetch average rating');
        const data = await ratingRes.json();
        setAverageRating(data.average_rating || 0);
      } catch (err) {
        console.error('Rating fetch error:', err);
      }

      try {
        const commentsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/comments/${post.id}`);
        if (!commentsRes.ok) throw new Error('Failed to fetch comments');
        const comments = await commentsRes.json();
        setCommentCount(Array.isArray(comments) ? comments.length : 0);
      } catch (err) {
        console.error('Comment fetch error:', err);
        setCommentCount(0);
      }

      setViewCount(post.view_count || 0);
    };

    fetchData();
    if (!post.cover_image) setFallbackGradient(generateRandomGradient());

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.userId);
      }
    } catch (err) {
      console.error('Token decode error:', err);
    }
  }, [post]);

  const summaryText = (() => {
    let rawText = post.description || post.content || '';
    rawText = rawText.replace(/^#{1,6}\s+/gm, '');
    rawText = rawText.replace(/!\[.*?\]\(.*?\)/g, '');
    rawText = rawText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    rawText = rawText.replace(/[*_~`]/g, '');
    rawText = rawText.trim();

    let trimmed = rawText.slice(0, 250).trim();
    if (rawText.length > 250) trimmed += '…';
    return capitalizeFirst(trimmed);
  })();

  const readTime = calculateReadTime(post.content || post.description || '');

  const handleCardClick = () => {
    navigate(`/post/${post.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-lightCard dark:bg-darkCard p-4 md:p-6 rounded-xl border border-neutral-200 dark:border-none flex flex-col md:flex-row gap-6 min-h-[220px] cursor-pointer relative"
    >
      {post.cover_image ? (
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full md:w-48 h-40 object-cover rounded-lg flex-shrink-0"
        />
      ) : (
        <div
          className="w-full md:w-48 h-40 rounded-lg flex-shrink-0"
          style={{ background: fallbackGradient }}
        />
      )}

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold">{capitalizeFirst(post.title)}</h3>
            {/* Desktop Author */}
            {author && (
              <Link
                to={`/user/${author.id}`}
                onClick={(e) => e.stopPropagation()}
                className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:underline"
              >
                <img
                  src={author.avatar_url || '/default-avatar.png'}
                  alt={author.username}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span>{truncateUsername(author.username)}</span>
              </Link>
            )}
          </div>
          <p className="text-muted-foreground line-clamp-3 mb-3">{summaryText}</p>
        </div>

        <div className="mt-auto">
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-muted dark:bg-zinc-700 text-muted-foreground"
                >
                  {tag.toUpperCase()}
                </span>
              ))}
            </div>
          )}

          {/* Desktop: justify-between between stats and edit */}
          <div className="hidden md:flex justify-between items-center text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1"><Star size={16} />{averageRating.toFixed(1)}</div>
              <div className="flex items-center gap-1"><Eye size={16} />{viewCount}</div>
              <div className="flex items-center gap-1"><MessageSquare size={16} />{commentCount}</div>
              <div className="flex items-center gap-1"><Clock size={16} />{readTime} min read</div>
            </div>
            {currentUserId === post.author_id && (
              <Link
                to={`/write/${post.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-3 py-1 rounded-full border hover:bg-white dark:hover:bg-zinc-700 transition"
              >
                <Pencil size={14} /> Edit post
              </Link>
            )}
          </div>

          {/* Mobile: username + search icon row */}
          {author && (
            <div className="flex md:hidden justify-between items-center mt-1 text-sm text-muted-foreground">
              <Link
                to={`/user/${author.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 hover:underline"
              >
                <img
                  src={author.avatar_url || '/default-avatar.png'}
                  alt={author.username}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>{truncateUsername(author.username)}</span>
              </Link>

              {currentUserId === post.author_id && (
                <Link
                  to={`/write/${post.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 px-3 py-1"
                >
                  <Pencil size={14} /> Edit post
                </Link>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Star, Pencil, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CommentList from '../components/comments/CommentList';
import LoginPopup from '../pages/Login';
import { jwtDecode } from 'jwt-decode';

export default function PostDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');

    const [post, setPost] = useState(null);
    const [author, setAuthor] = useState(null);
    const [averageRating, setAverageRating] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchPost();
        try {
            if (token) {
                const decoded = jwtDecode(token);
                setCurrentUserId(decoded.userId);
            }
        } catch (err) {
            console.error('Token decode error:', err);
        }
    }, [slug]);

    useEffect(() => {
        if (post) {
            fetchAverageRating(post.id);
            fetchUserRating(post.id);
            fetchAuthor(post.author_id);
        }
    }, [post]);

    async function fetchPost() {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/posts/${slug}`);
            if (!res.ok) throw new Error('Post not found');
            const postData = await res.json();
            setPost(postData);
            fetch(`${BASE_URL}/api/posts/${slug}/view`, { method: 'POST' }).catch((err) =>
                console.error('Error incrementing view:', err)
            );
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function fetchAuthor(authorId) {
        try {
            const res = await fetch(`${BASE_URL}/api/users/${authorId}`);
            if (!res.ok) throw new Error('Author not found');
            const data = await res.json();
            setAuthor(data);
        } catch (e) {
            console.error('Error fetching author:', e);
        }
    }

    async function fetchAverageRating(postId) {
        try {
            const res = await fetch(`${BASE_URL}/api/feedback/post/${postId}/average`);
            const data = await res.json();
            setAverageRating(Number(data.average_rating) || 0);
        } catch (e) {
            console.error('Error fetching average rating:', e);
        }
    }

    async function fetchUserRating(postId) {
        if (!token) return;
        try {
            const res = await fetch(`${BASE_URL}/api/feedback/post/${postId}/user-rating`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUserRating(data.alreadyRated ? data.rating : null);
            }
        } catch (e) {
            console.error('Error fetching user rating:', e);
        }
    }

    async function handleRatingSubmit(rating) {
        if (!token) {
            setShowLoginPopup(true);
            return;
        }
        try {
            await fetch(`${BASE_URL}/api/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ post_id: post.id, rating }),
            });
            setUserRating(rating);
            fetchAverageRating(post.id);
        } catch (e) {
            console.error('Error submitting rating:', e);
        }
    }

    async function confirmDelete() {
        try {
            const res = await fetch(`${BASE_URL}/api/posts/${slug}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Delete failed');
            setShowDeleteModal(false);
            navigate(-1);
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete post.');
        }
    }

    if (loading) return <div className="p-4 flex justify-center items-center h-screen">Loading...</div>;
    if (!post) return <div className="p-4">Post not found</div>;

    const isDarkMode = document.documentElement.classList.contains('dark');

    return (
        <div className="w-full max-w-[1300px] mx-auto p-4 min-h-screen">
            <div className="flex flex-col justify-start items-start mb-4">
                <button onClick={() => navigate(-1)} className="cursor-pointer my-2 opacity-70">
                    Back
                </button>
            </div>

            <h1 className="text-2xl font-bold my-2">{post.title}</h1>
            <p className="text-base my-2">{post.description}</p>

            <div className="flex flex-wrap gap-2 my-2">
                {post.tags?.map((tag, i) => (
                    <span
                        key={i}
                        className="px-2 py-1 text-sm rounded border border-neutral-300 dark:border-neutral-700"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {author && (
                <div
                    className="flex items-center gap-2 mt-2 text-sm cursor-pointer hover:opacity-80"
                    onClick={() => navigate(`/user/${author.id}`)}
                >
                    <span className="font-medium">Author:</span>
                    <img
                        src={author.avatar_url}
                        alt="Author"
                        className="w-6 h-6 rounded-full"
                    />
                    <span>{author.username}</span>
                </div>
            )}

            <p className="text-sm my-2 opacity-70">Updated at: {format(new Date(post.updated_at), 'PPP')}</p>
            <p className="text-sm my-2 opacity-70">
                Views: {post.view_count} · Rating: {averageRating?.toFixed(1) || 'No rating yet'}
            </p>

            {currentUserId === post.author_id && (
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => navigate(`/write/${post.slug}`)}
                        className="px-4 py-1 rounded border dark:border-zinc-600 hover:bg-white dark:hover:bg-zinc-800 transition flex items-center gap-1"
                    >
                        <Pencil size={16} /> Edit Post
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-1"
                    >
                        <Trash size={16} /> Delete Post
                    </button>
                </div>
            )}

            <hr className="opacity-20 my-4" />

            <div className="prose dark:prose-invert rounded-2xl max-w-none overflow-hidden">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        img({ node, ...props }) {
                            return (
                                <img
                                    {...props}
                                    style={{ maxHeight: '400px', width: 'auto', objectFit: 'cover' }}
                                    className="rounded-md max-w-full"
                                />
                            );
                        },
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            if (inline || !match) return <code className={className}>{children}</code>;
                            return (
                                <SyntaxHighlighter
                                    key={isDarkMode ? 'dark' : 'light'}
                                    style={isDarkMode ? oneDark : oneLight}
                                    language={match[1]}
                                    wrapLongLines
                                    customStyle={{
                                        padding: '1rem',
                                        borderRadius: '0.75rem',
                                        background: 'transparent',
                                    }}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            );
                        },
                    }}
                >
                    {post.content}
                </ReactMarkdown>
            </div>

            <hr className="opacity-20 my-4" />

            <div className="mb-4 rounded-2xl py-4 text-neutral-800 dark:text-neutral-200">
                <h2 className="text-lg mb-2 font-semibold">Rate this post:</h2>
                {userRating ? (
                    <p className="flex items-center gap-1">
                        <span>You already rated {userRating}</span>
                        <Star className="w-5 h-5" />
                    </p>
                ) : (
                    <div className="flex gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button key={n} onClick={() => handleRatingSubmit(n)} className="hover:scale-110 transition">
                                <Star className="w-6 h-6" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <CommentList postId={post.id} authorId={post.author_id} setShowLoginPopup={setShowLoginPopup} />

            {showLoginPopup && <LoginPopup onClose={() => setShowLoginPopup(false)} />}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
                            Confirm Deletion
                        </h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-6">
                            Are you sure you want to delete this post? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 rounded border dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CommentList from '../components/comments/CommentList';

export default function PostDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');

    const [post, setPost] = useState(null);
    const [averageRating, setAverageRating] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPost();
    }, [slug]);

    useEffect(() => {
        if (post) {
            fetchAverageRating(post.id);
            fetchUserRating(post.id);
        }
    }, [post]);

    async function fetchPost() {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/posts/${slug}`);
            if (!res.ok) throw new Error('Post not found');
            const postData = await res.json();
            setPost(postData);
            fetch(`${BASE_URL}/api/posts/${slug}/view`, {
                method: 'POST',
            }).catch((err) => console.error('Error incrementing view:', err));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
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
                if (data.alreadyRated) {
                    setUserRating(data.rating);
                } else {
                    setUserRating(null); 
                }
            }
        } catch (e) {
            console.error('Error fetching user rating:', e);
        }
    }


    async function handleRatingSubmit(rating) {
        if (!token) return;
        try {
            await fetch(`${BASE_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ post_id: post.id, rating }),
            });
            setUserRating(rating);
            fetchAverageRating(post.id);
        } catch (e) {
            console.error('Error submitting rating:', e);
        }
    }

    if (loading) return <div className="p-4 flex justify-center items-center h-screen">Loading...</div>;
    if (!post) return <div className="p-4">Post not found</div>;

    const isDarkMode = document.documentElement.classList.contains('dark');

    return (
        <div className="w-full max-w-[1300px] mx-auto p-4 min-h-screen">
            <button onClick={() => navigate(-1)} className="cursor-pointer my-2 opacity-70">
                Back
            </button>

            <h1 className="text-2xl font-bold my-2">{post.title}</h1>
            <p className="text-base my-2">{post.description}</p>

            {/* Tags */}
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

            <p className="text-sm my-2 opacity-70">Updated at: {format(new Date(post.updated_at), 'PPP')}</p>
            <p className="text-sm my-2 opacity-70">
                Views: {post.view_count} · Rating: {averageRating?.toFixed(1) || 'No rating yet'}
            </p>

            <hr className="opacity-20 my-4" />

            {/* Markdown content */}
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
                            if (inline || !match) {
                                return <code className={className}>{children}</code>;
                            }
                            return (
                                <SyntaxHighlighter
                                    key={isDarkMode ? 'dark' : 'light'}
                                    style={isDarkMode ? oneDark : oneLight}
                                    language={match[1]}
                                    wrapLongLines={true}
                                    customStyle={{ padding: '1rem', borderRadius: '0.75rem', background: 'transparent' }}
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

            {/* Rating */}
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


            {/* Comment section */}
            <CommentList
                postId={post.id}
                authorId={post.author_id}
            />

        </div>
    );
}

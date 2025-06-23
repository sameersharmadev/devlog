import { useEffect, useState } from 'react';
import SectionHeading from '../../components/SectionHeading';
import Post from '../../components/Post';

export default function FollowingPostsList({ limit = 6 }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');
    if (!token) return null;
    useEffect(() => {
        const fetchFollowingPosts = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/api/posts/following/posts?limit=${limit}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!res.ok) throw new Error('Failed to fetch posts from followed users');
                const data = await res.json();
                setPosts(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchFollowingPosts();
    }, [limit]);

    if (loading) return null;

    if (error) {
        return <p className="text-center text-red-500">Error: {error}</p>;
    }

    if (posts.length === 0) return null;

    return (
        <div className="w-full max-w-[1300px] mx-auto p-4">
            <SectionHeading>From People You Follow</SectionHeading>
            <div className="flex flex-col gap-4 w-full">
                {posts.map((post) => (
                    <Post key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}

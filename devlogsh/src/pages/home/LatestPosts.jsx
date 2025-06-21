import { useEffect, useState } from 'react';
import SectionHeading from '../../components/SectionHeading';
import Post from '../../components/Post';

export default function LatestPostsList({ limit = 6 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/posts/latest?limit=${limit}`
        );
        if (!res.ok) throw new Error('Failed to fetch latest posts');
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestPosts();
  }, [limit]);

  if (loading) {
    return <p className="text-center text-muted-foreground">Loading latest posts…</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  if (posts.length === 0) {
    return <p className="text-center text-muted-foreground">No latest posts yet.</p>;
  }

  return (
    <div className="w-full max-w-[1300px] mx-auto p-4">
      <SectionHeading>Latest Posts</SectionHeading>
      <div className="flex flex-col gap-4 w-full">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

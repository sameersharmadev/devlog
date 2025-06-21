import { useEffect, useState } from 'react';
import SectionHeading from '../../components/SectionHeading';
import Post from '../../components/Post';

export default function TopPostsListWithLimit({ limit = 6 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopPosts = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/posts/top?limit=${limit}`
        );
        if (!res.ok) throw new Error('Failed to fetch top posts');
        const data = await res.json();
        setPosts(data); 
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTopPosts();
  }, [limit]);

  if (loading) return <p className="text-center text-muted-foreground">Loading top posts…</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (posts.length === 0) return <p className="text-center text-muted-foreground">No top posts yet.</p>;

  return (
    <div className="w-full max-w-[1300px] mx-auto p-4">
      <SectionHeading>Trending Posts</SectionHeading>
      <div className="flex flex-col gap-4 w-full">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

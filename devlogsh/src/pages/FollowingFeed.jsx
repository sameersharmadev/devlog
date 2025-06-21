import { useEffect, useState, useRef, useCallback } from 'react';
import Post from '../components/Post';
import SectionHeading from '../components/SectionHeading';
import PostCardSkeleton from '../components/skeletons/PostCardSkeleton';

const LIMIT = 6;

export default function FollowingFeed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const observerRef = useRef(null);

  const fetchMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/following/posts?page=${page}&limit=${LIMIT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch followed posts');

      const data = await res.json();

      if (Array.isArray(data)) {
        setPosts((prev) => [...prev, ...data]);
        setHasMore(data.length === LIMIT);
        setPage((prev) => prev + 1);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading, token]);

  useEffect(() => {
    fetchMorePosts();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMorePosts();
        }
      },
      { threshold: 1.0 }
    );

    const target = observerRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [fetchMorePosts, hasMore, loading]);

  return (
    <div className="w-full max-w-[1300px] mx-auto p-4 pt-8">
      <div className="flex flex-col gap-4 w-full">
        {posts.length === 0 && loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={`initial-skeleton-${i}`} />
          ))
        ) : (
          posts.map((post) => <Post key={post.id} post={post} />)
        )}

        {loading && posts.length > 0 &&
          Array.from({ length: 2 }).map((_, i) => (
            <PostCardSkeleton key={`loadmore-skeleton-${i}`} />
          ))}

        {posts.length === 0 && !loading && !error && (
          <p className="text-center text-muted-foreground mt-4">
            Follow more people and topics to customise your feed.
          </p>
        )}

        {!loading && hasMore && <div ref={observerRef} className="h-4" />}

        {!hasMore && posts.length > 0 && (
          <p className="text-center text-muted-foreground mt-4">
            You've reached the end.
          </p>
        )}

        {error && (
          <p className="text-center text-red-500 mt-4">Error: {error}</p>
        )}
      </div>
    </div>
  );
}

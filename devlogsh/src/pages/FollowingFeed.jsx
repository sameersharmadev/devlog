import { useEffect, useState, useRef, useCallback } from 'react';
import Post from '../components/Post';
import PostCardSkeleton from '../components/skeletons/PostCardSkeleton';
import SuggestedUsers from '../components/GetSuggestedUsers';

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
    <div className="w-full max-w-[1300px] mx-auto p-4 pt-20">
      <div className="flex flex-col gap-4 w-full">

        {/* Empty Feed */}
        {posts.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center justify-center mt-20 md:mt-28 mb-16 text-center text-muted-foreground px-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="96"
              height="96"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="mb-4 text-zinc-400 dark:text-zinc-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.59 14.37A4.5 4.5 0 008.41 14.37M9.75 9h.008v.008H9.75V9zm4.5 0h.008v.008h-.008V9zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold mb-1">Your feed is a little empty</h3>
            <p className="text-sm max-w-sm">
              Follow other developers to start seeing personalized posts here.
            </p>
            <div className="mt-8 w-full">
              <SuggestedUsers />
            </div>
          </div>
        )}

        {/* Initial Skeletons */}
        {posts.length === 0 && loading && (
          Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={`initial-skeleton-${i}`} />
          ))
        )}

        {/* Posts */}
        {posts.length > 0 && (
          <>
            {posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}

            {/* Loading more skeletons */}
            {loading && Array.from({ length: 2 }).map((_, i) => (
              <PostCardSkeleton key={`loadmore-skeleton-${i}`} />
            ))}

            {/* Observer for infinite scroll */}
            {hasMore && !loading && <div ref={observerRef} className="h-4" />}

            {/* End message */}
            {!hasMore && (
              <p className="text-center text-muted-foreground mt-4">
                You&apos;ve reached the end.
              </p>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-500 mt-4">Error: {error}</p>
        )}
      </div>
    </div>
  );
}

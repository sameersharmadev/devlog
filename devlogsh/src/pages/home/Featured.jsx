import { useEffect, useState } from 'react';
import SectionHeading from '../../components/SectionHeading';
import Post from '../../components/Post';
import PostCardSkeleton from '../../components/skeletons/PostCardSkeleton';

export default function Featured() {
  const [posts, setPosts] = useState([]);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    async function fetchPosts() {
      try {
        const slugs = [
          'building-scalable-rest-apis-with-node-js-and-express',
          'how-ai-is-revolutionizing-code-review-workflows',
        ];
        const requests = slugs.map((slug) =>
          fetch(`${BASE_URL}/api/posts/${slug}`).then((res) => {
            if (!res.ok) throw new Error(`Error fetching ${slug}`);
            return res.json();
          })
        );

        const results = await Promise.all(requests);
        setPosts(results);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    }

    fetchPosts();
  }, [BASE_URL]);

  return (
    <div className="w-full max-w-[1300px] py-6 lg:py-16 mx-auto px-4">
      <SectionHeading>Featured posts</SectionHeading>
      <div className="flex flex-col gap-6 mt-4">
        {posts.length === 2 ? (
          posts.map((post) => (
            <Post key={post.slug} post={post} />
          ))
        ) : (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        )}
      </div>
    </div>
  );
}

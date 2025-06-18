import PostCard from '../../components/Post';
import SectionHeading from '../../components/SectionHeading';

export default function UserPosts({ posts = [], loading = false }) {
  return (
    <section className="w-full bg-lightBg dark:bg-darkBg text-black dark:text-white py-12 md:py-20">
      <div className="w-full max-w-[1300px] mx-auto px-4">
        <SectionHeading>Your posts</SectionHeading>

        {loading ? (
          <p>Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">You haven’t written any posts yet.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

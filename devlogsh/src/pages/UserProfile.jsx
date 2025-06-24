import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Crown, X } from 'lucide-react';
import Post from '../components/Post';
import SectionHeading from '../components/SectionHeading';
import PostCardSkeleton from '../components/skeletons/PostCardSkeleton';
import LoadingScreen from '../components/LoadingScreen';

export default function UserProfile() {
  const { id: userId } = useParams();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [showPopup, setShowPopup] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const popupRef = useRef();

  const API = import.meta.env.VITE_API_BASE_URL;
  const TOKEN = localStorage.getItem('token');

  function getDefaultAvatar(username) {
    return `https://api.dicebear.com/8.x/shapes/svg?seed=${username}`;
  }

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoadingProfile(true);
        const [userRes, followersRes, followingRes, postsRes, ratingRes] = await Promise.all([
          fetch(`${API}/api/users/${userId}`),
          fetch(`${API}/api/follow/${userId}/followers`),
          fetch(`${API}/api/follow/${userId}/following`),
          fetch(`${API}/api/posts/user/${userId}?limit=100&page=1`),
          fetch(`${API}/api/feedback/user/${userId}/average`)
        ]);

        const userData = await userRes.json();
        if (userRes.ok) setUser(userData);
        setFollowers(await followersRes.json());
        setFollowing(await followingRes.json());
        const postData = await postsRes.json();
        setPosts(postData.posts || []);
        const ratingData = await ratingRes.json();
        setAvgRating(ratingData.average || 0);
      } catch (err) {
        console.error('Error fetching public profile:', err);
      } finally {
        setIsLoadingProfile(false);
        setIsLoadingPosts(false);
      }
    };

    const fetchFollowStatus = async () => {
      try {
        const res = await fetch(`${API}/api/follow/${userId}/status`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        if (res.ok) {
          const { isFollowing } = await res.json();
          setIsFollowing(isFollowing);
        }
      } catch (err) {
        console.error('Error checking follow status:', err);
      }
    };

    fetchUserInfo();
    if (TOKEN) fetchFollowStatus();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPopup(null);
      }
    };
    if (showPopup) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopup]);

  const handleFollowToggle = async () => {
    if (!TOKEN || loadingFollow) return;
    setLoadingFollow(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`${API}/api/follow/${userId}`, {
        method,
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (res.ok) {
        setIsFollowing(!isFollowing);
        setFollowers((prev) =>
          isFollowing
            ? prev.filter((f) => f.id !== userId)
            : [...prev, { id: user.id, username: user.username, avatar_url: user.avatar_url }]
        );
      }
    } catch (err) {
      console.error('Follow/unfollow failed:', err);
    } finally {
      setLoadingFollow(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString(undefined, options);
  };

  if (isLoadingProfile) {
    return <LoadingScreen isLoading={isLoadingProfile}/>;
  }

  return (
    <section className="w-full flex justify-center bg-lightBg dark:bg-darkBg text-black dark:text-white px-4 py-20">
      <div className="w-full max-w-[1300px]">
        <div className="grid md:grid-cols-[1fr_2.5fr_1.5fr] gap-10 text-center md:text-left items-start">
          {/* Avatar */}
          <div className="flex justify-center md:justify-start">
            <img
              src={user.avatar_url || getDefaultAvatar(user.username)}
              alt="Avatar"
              className="rounded-full w-48 h-48 object-cover border-4 border-accent"
            />
          </div>

          {/* User Info */}
          <div className="flex flex-col justify-center gap-3">
            <h2 className="text-3xl font-semibold capitalize">{user.username}</h2>
            {user.role === 'admin' && (
              <div className="flex items-center gap-1 justify-center md:justify-start text-accent">
                <Crown size={16} />
                <span className="text-sm font-semibold">Admin</span>
              </div>
            )}
            <p className="text-gray-700 dark:text-gray-300 max-w-xl mx-auto md:mx-0">
              {user.bio || 'This user has no bio yet.'}
            </p>
            <p>
              <span className="font-semibold">Average Rating:</span> {avgRating?.toFixed(1) || '0.0'} ★
            </p>
            <p><span className="font-semibold">Posts:</span> {posts.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Member since {formatDate(user.created_at)}
            </p>
          </div>

          {/* Follow Actions */}
          <div className="flex flex-col items-center md:items-end gap-4">
            {TOKEN && (
              <button
                onClick={handleFollowToggle}
                disabled={loadingFollow}
                className={`w-40 text-center px-5 py-2 rounded-full text-white transition disabled:opacity-50 ${
                  loadingFollow
                    ? ''
                    : isFollowing
                    ? 'bg-gray-500 hover:bg-gray-700'
                    : 'bg-accent hover:opacity-90'
                }`}
              >
                {loadingFollow ? 'Please wait' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}

            <div className="flex gap-4 text-sm text-accent">
              <button onClick={() => setShowPopup('followers')}>
                {followers.length} followers
              </button>
              <button onClick={() => setShowPopup('following')}>
                {following.length} following
              </button>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="my-20">
          <SectionHeading>User's Posts</SectionHeading>
          <div className="mt-10 space-y-6">
            {isLoadingPosts
              ? Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
              : posts.map((post) => <Post key={post.id} post={post} />)}
          </div>
        </div>

        {/* Follower/Following Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div
              ref={popupRef}
              className="bg-lightCard dark:bg-darkCard text-black dark:text-white w-[90%] max-w-md rounded-lg p-6 relative"
            >
              <div className="flex items-center justify-between border-b-2 border-accent pb-3 mb-4">
                <h3 className="text-xl font-semibold">
                  {showPopup === 'followers' ? 'Followers' : 'Following'}
                </h3>
                <button onClick={() => setShowPopup(null)}>
                  <X />
                </button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {(showPopup === 'followers' ? followers : following).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No users found.</p>
                ) : (
                  (showPopup === 'followers' ? followers : following).map((u) => (
                    <Link
                      key={u.id}
                      to={`/user/${u.id}`}
                      onClick={() => setShowPopup(null)}
                      className="flex items-center gap-3 p-2 rounded hover:bg-accent/10"
                    >
                      <img
                        src={u.avatar_url || getDefaultAvatar(u.username)}
                        alt={u.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <span>{u.username}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

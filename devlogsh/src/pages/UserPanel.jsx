import { useEffect, useState } from 'react';
import User from './userpanel/UserPanel';
import UserPost from './userpanel/UserPosts';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import  UserSkeleton  from "../components/skeletons/UserSkeleton";

const API = import.meta.env.VITE_API_BASE_URL;

export default function UserPanel() {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [opacityClass, setOpacityClass] = useState('opacity-100');

  const fetchAllData = async () => {
    const TOKEN = localStorage.getItem('token');
    try {
      const userRes = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!userRes.ok) throw new Error('Failed to fetch user');
      const user = await userRes.json();

      const [
        followersRes,
        followingRes,
        postsRes,
        ratingRes,
        myPostsRes
      ] = await Promise.all([
        fetch(`${API}/api/follow/${user.id}/followers`),
        fetch(`${API}/api/follow/${user.id}/following`),
        fetch(`${API}/api/posts/me`, { headers: { Authorization: `Bearer ${TOKEN}` } }),
        fetch(`${API}/api/feedback/user/${user.id}/average`),
        fetch(`${API}/api/posts/me`, { headers: { Authorization: `Bearer ${TOKEN}` } }),
      ]);

      const followers = await followersRes.json();
      const following = await followingRes.json();
      const allPosts = await postsRes.json();
      const rating = await ratingRes.json();
      const myPosts = await myPostsRes.json();

      setUserData({
        ...user,
        followers,
        following,
        postCount: allPosts.length,
        avgRating: rating?.average || 0,
      });
      setUserPosts(myPosts);
    } catch (err) {
      console.error('Error fetching all user data:', err);
    } finally {
      setOpacityClass('opacity-0');
      setTimeout(() => {
        setShowLoader(false);
        setLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <>
      {showLoader && (
        <section
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-lightBg dark:bg-darkBg text-black dark:text-white transition-opacity duration-300 ${opacityClass}`}
        >
          <DotLottieReact
            src="/animations/loading.lottie"
            loop
            autoplay
            style={{ width: 200, height: 200 }}
          />
        </section>
      )}

      {!loading ? (
        <>
          <User user={userData} refresh={fetchAllData} />
          <UserPost posts={userPosts} />
        </>
      ) : (
        <UserSkeleton/>
      )}

    </>
  );
}

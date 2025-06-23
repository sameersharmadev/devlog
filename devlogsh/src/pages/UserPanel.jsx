// src/pages/UserPanel.jsx
import { useEffect, useState } from 'react';
import User from './userpanel/UserPanel';
import UserPost from './userpanel/UserPosts';

const API = import.meta.env.VITE_API_BASE_URL;

export default function UserPanel() {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen bg-lightBg dark:bg-darkBg text-black dark:text-white flex items-center justify-center pt-20 md:pt-8">
        <p className="text-xl">Loading...</p>
      </section>
    );
  }

  return (
    <div className="pt-8 md:pt-8">
      <User user={userData} refresh={fetchAllData} />
      <UserPost posts={userPosts} />
    </div>
  );
}

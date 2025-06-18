import { useEffect, useRef, useState } from 'react';
import { Pencil, X, Sun, Moon } from 'lucide-react';

export default function User({ user, refresh }) {
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar_url || `https://api.dicebear.com/8.x/shapes/svg?seed=${user.username}`);
  const [email, setEmail] = useState(user.email || '');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showPopup, setShowPopup] = useState(null);
  const [postCount, setPostCount] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const fileInputRef = useRef();
  const popupRef = useRef();

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const token = import.meta.env.VITE_TOKEN;
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchExtraData = async () => {
      try {
        const [followersRes, followingRes, postsRes, ratingRes] = await Promise.all([
          fetch(`${API}/api/follow/${user.id}/followers`),
          fetch(`${API}/api/follow/${user.id}/following`),
          fetch(`${API}/api/posts/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/feedback/user/${user.id}/average`)
        ]);

        setFollowers(await followersRes.json());
        setFollowing(await followingRes.json());
        const posts = await postsRes.json();
        setPostCount(posts.length);

        const ratingData = await ratingRes.json();
        setAvgRating(ratingData.average || 0);
      } catch (err) {
        console.error('Error fetching extras:', err);
      }
    };

    if (user?.id) fetchExtraData();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPopup(null);
      }
    };
    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopup]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar_url: avatar, bio, username, email }),
      });

      if (!res.ok) throw new Error('Failed to update profile');
      await refresh();
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      setIsDark(true);
    }
  };

  const inputClass = 'bg-lightCard dark:bg-darkCard text-gray-800 dark:text-gray-300 w-full px-3 py-2 rounded outline-none focus:text-black dark:focus:text-white';

  return (
    <section className="min-h-screen bg-lightBg dark:bg-darkBg text-black dark:text-white flex justify-center px-4 py-10">
      <div className="w-full max-w-[1300px]">
        <div className="mb-6 -mt-6 flex justify-end md:hidden">
          <button onClick={toggleTheme} className="hover:text-accent">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center">
          Welcome, {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Avatar & stats */}
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="relative w-64 h-64 group">
              <img src={avatar} alt="Avatar" className="rounded-full w-64 h-64 object-cover border-4 border-accent" />
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-4 right-4 bg-lightCard dark:bg-darkCard p-2 rounded-full hover:opacity-90 transition"
              >
                <Pencil size={28} className="text-black dark:text-white" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="mt-4 space-x-4 flex justify-center w-64">
              <span
                className="cursor-pointer hover:text-accent"
                onClick={() => setShowPopup('followers')}
              >
                {followers.length} followers
              </span>
              <span
                className="cursor-pointer hover:text-accent"
                onClick={() => setShowPopup('following')}
              >
                {following.length} following
              </span>
            </div>

            <div className="mt-3 flex justify-center gap-4 w-64">
              <p><span className="font-semibold">{postCount}</span> posts</p>
              <p>
                Avg. Rating: <span className="font-semibold">{avgRating?.toFixed(1) || '0.0'}</span> ★
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="text-sm block mb-1">Username</label>
              <input
                type="text"
                className={inputClass}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm block mb-1">Email</label>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  disabled
                  value="********"
                  className="bg-lightCard dark:bg-darkCard text-gray-500 w-full px-3 py-2 rounded pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-accent cursor-pointer hover:underline">
                  Change
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm block mb-1">Bio</label>
              <textarea
                className="bg-lightCard dark:bg-darkCard text-gray-800 dark:text-gray-300 w-full px-3 py-2 rounded resize-none outline-none focus:text-black dark:focus:text-white"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us something..."
              />
            </div>

            <button
              onClick={handleSave}
              className="bg-lightCard dark:bg-darkCard text-black dark:text-white hover:opacity-90 transition px-5 py-2 rounded"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Popup */}
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
                  <p className="text-gray-500 dark:text-gray-400">
                    No {showPopup === 'followers' ? 'followers' : 'following'} yet.
                  </p>
                ) : (
                  (showPopup === 'followers' ? followers : following).map((user) => (
                    <div key={user.id} className="flex items-center gap-3 bg-lightBg dark:bg-darkBg p-2 rounded">
                      <img
                        src={user.avatar_url || `https://api.dicebear.com/8.x/shapes/svg?seed=${user.username}`}
                        alt={user.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="text-sm">{user.username}</span>
                    </div>
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

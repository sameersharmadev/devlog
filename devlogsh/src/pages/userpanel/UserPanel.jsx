import { useEffect, useRef, useState } from 'react';
import { Pencil, X, Sun, Moon, Loader2, Check, Crown } from 'lucide-react';
import { supabase, uploadAvatar } from '../../utilities/supabase';

export default function User({ user, refresh }) {
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar_url || getDefaultAvatar(user.username));
  const [email, setEmail] = useState(user.email || '');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showPopup, setShowPopup] = useState(null);
  const [postCount, setPostCount] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAvatarDefault, setIsAvatarDefault] = useState(!user.avatar_url);
  const fileInputRef = useRef();
  const popupRef = useRef();
  const avatarMenuRef = useRef();

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const TOKEN = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_BASE_URL;

  function getDefaultAvatar(username) {
    return `https://api.dicebear.com/8.x/shapes/svg?seed=${username}`;
  }

  useEffect(() => {
    const fetchExtraData = async () => {
      try {
        const [followersRes, followingRes, postsRes, ratingRes] = await Promise.all([
          fetch(`${API}/api/follow/${user.id}/followers`),
          fetch(`${API}/api/follow/${user.id}/following`),
          fetch(`${API}/api/posts/me`, { headers: { Authorization: `Bearer ${TOKEN}` } }),
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
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setShowAvatarOptions(false);
      }
    };
    if (showPopup || showAvatarOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopup, showAvatarOptions]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const publicUrl = await uploadAvatar(file, user.id);
      await fetch(`${API}/api/users/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ avatar_url: publicUrl }),
      });

      setAvatar(publicUrl);
      setIsAvatarDefault(false);
    } catch (err) {
      console.error('Avatar upload failed:', err.message);
    }
  };

  const removeAvatar = async () => {
    const defaultAvatar = getDefaultAvatar(user.username);
    try {
      await fetch(`${API}/api/users/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ avatar_url: null }),
      });

      setAvatar(defaultAvatar);
      setIsAvatarDefault(true);
    } catch (err) {
      console.error('Failed to remove avatar:', err.message);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError('');
      const res = await fetch(`${API}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ avatar_url: isAvatarDefault ? null : avatar, bio, username, email }),
      });

      const result = await res.json();

      if (!res.ok) {
        setSaveError(result.error || 'Failed to update profile');
        return;
      }

      await refresh();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      setSaveError('Something went wrong. Please try again.');
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString(undefined, options);
  };

  const inputClass = 'bg-lightCard dark:bg-darkCard text-gray-800 dark:text-gray-300 w-full px-3 py-2 rounded outline-none focus:text-black dark:focus:text-white';

  return (
    <section className="bg-lightBg dark:bg-darkBg text-black dark:text-white flex justify-center px-4 py-10">
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
              <div ref={avatarMenuRef}>
                <button
                  onClick={() => {
                    if (isAvatarDefault) {
                      fileInputRef.current.click();
                    } else {
                      setShowAvatarOptions((prev) => !prev);
                    }
                  }}
                  className="absolute bottom-4 right-4 bg-lightCard dark:bg-darkCard p-2 rounded-full hover:opacity-90 transition"
                >
                  <Pencil size={28} className="text-black dark:text-white" />
                </button>

                {showAvatarOptions && (
                  <div className="absolute z-10 bottom-16 right-0 bg-lightCard dark:bg-darkCard border border-accent rounded shadow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setShowAvatarOptions(false);
                        fileInputRef.current.click();
                      }}
                      className="block px-4 py-2 text-sm hover:bg-accent hover:text-white w-full text-left"
                    >
                      Change Avatar
                    </button>
                    <button
                      onClick={() => {
                        setShowAvatarOptions(false);
                        removeAvatar();
                      }}
                      className="block px-4 py-2 text-sm hover:bg-accent hover:text-white w-full text-left"
                    >
                      Remove Avatar
                    </button>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="mt-4 space-x-4 flex justify-center w-64">
              <span className="cursor-pointer hover:text-accent" onClick={() => setShowPopup('followers')}>
                {followers.length} followers
              </span>
              <span className="cursor-pointer hover:text-accent" onClick={() => setShowPopup('following')}>
                {following.length} following
              </span>
            </div>

            <div className="mt-3 flex justify-center gap-4 w-64">
              <p><span className="font-semibold">{postCount}</span> posts</p>
              <p>
                Avg. Rating: <span className="font-semibold">{avgRating?.toFixed(1) || '0.0'}</span> ★
              </p>
            </div>

            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
              <p>Member since {formatDate(user.created_at)}</p>
              {user.role === 'admin' && (
                <div className="flex items-center justify-center gap-1 mt-4 text-accent">
                  <Crown size={16} />
                  <span className="text-sm font-semibold">Admin</span>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="text-sm block mb-1">Username</label>
              <input type="text" className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div>
              <label className="text-sm block mb-1">Email</label>
              <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
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
              disabled={isSaving}
              className="bg-lightCard dark:bg-darkCard text-black dark:text-white hover:opacity-90 transition px-5 py-2 rounded flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="text-green-500" size={18} />
                  Changes saved!
                </>
              ) : (
                'Save Changes'
              )}
            </button>

            {saveError && <p className="text-red-500 mt-2 text-sm">{saveError}</p>}
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
                        src={user.avatar_url || getDefaultAvatar(user.username)}
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

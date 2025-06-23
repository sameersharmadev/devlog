import { useState, useEffect, useRef, cloneElement } from 'react';
import { Home, Flame, Star, Pencil, User, Sun, Moon, LogOut, Clock } from 'lucide-react';
import { NavLink } from 'react-router';
import SignupPopup from '../pages/Signup';
import LoginPopup from '../pages/Login';
import { jwtDecode } from 'jwt-decode';
import SearchBar from './SearchBar';

export default function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRefDesktop = useRef(null);
  const userMenuRefMobile = useRef(null);

  const [user, setUser] = useState(null);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
      localStorage.theme = theme;
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    setUserMenuOpen(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const { userId } = decoded;

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            setUser({
              id: data.id,
              username: data.username,
              avatar_url: data.avatar_url,
            });
          })
          .catch((err) => {
            console.error('Failed to fetch user', err);
            setUser(null);
          });
      } catch (err) {
        console.error('Invalid token', err);
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (userMenuRefDesktop.current && userMenuRefDesktop.current.contains(e.target)) ||
        (userMenuRefMobile.current && userMenuRefMobile.current.contains(e.target))
      ) {
        return;
      }
      setUserMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Home', icon: <Home />, path: '/' },
    { label: 'Trending', icon: <Flame />, path: '/trending' },
    { label: 'Latest', icon: <Clock />, path: '/latest' },
    ...(user ? [{ label: 'For you', icon: <Star />, path: '/for-you' }] : []),
  ];

  return (
    <div className="cursor-default">
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 px-4 bg-lightBg dark:bg-darkBg flex items-center justify-between z-50 ">
        <div className="text-lg font-bold w-3/4"><SearchBar /></div>
        <button onClick={toggleTheme} className="text-muted-foreground hover:text-accent">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex justify-center">
        <div className="w-full max-w-[1300px] border-b border-accent flex items-center justify-between px-4 py-3 md:py-4">
          <ul className="flex gap-8 items-center">
            {navItems.map(({ label, icon, path }) => (
              <li key={label}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 hover:text-accent ${isActive ? 'text-accent' : ''}`
                  }
                >
                  {cloneElement(icon, { size: 16 })}
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-6">
            <SearchBar />
            {user ? (
              <>
                <button onClick={toggleTheme} className="hover:text-accent">
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <NavLink
                  to="/write"
                  className={({ isActive }) =>
                    `flex items-center gap-2 border rounded-full px-3 py-2 text-sm transition-colors ${isActive ? 'border-accent text-accent' : 'dark:border-white hover:bg-white hover:text-[#1d3439] transition'}`
                  }
                >
                  <Pencil size={16} />
                  Write a blog
                </NavLink>

                <div className="relative" ref={userMenuRefDesktop}>
                  <button onClick={() => setUserMenuOpen((prev) => !prev)}>
                    <img
                      src={user.avatar_url}
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-10 bg-lightBg dark:bg-darkBg rounded shadow-md py-2 w-40 z-50">
                      <div className="px-4 py-2 text-sm font-semibold">
                        {user.username.length > 12
                          ? user.username.slice(0, 12) + '…'
                          : user.username}
                      </div>
                      <NavLink
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-muted text-sm"
                      >
                        View Profile
                      </NavLink>
                      <button
                        onClick={toggleTheme}
                        className="flex items-center gap-2 px-4 py-2 hover:text-accent text-sm"
                      >
                        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />} Theme
                      </button>
                      <button
                        onClick={() => {
                          localStorage.removeItem('token');
                          setUser(null);
                          window.location.href = '/';
                        }}
                        className="flex items-center gap-2 px-4 py-2 hover:text-accent text-sm"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button onClick={toggleTheme} className="hover:text-accent">
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button onClick={() => setShowLogin(true)} className="hover:text-accent">
                  Login
                </button>
                <button onClick={() => setShowSignup(true)} className="hover:text-accent">
                  Signup
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-lightBg dark:bg-darkBg">
        <div className="flex justify-around items-center py-2 text-xs relative">
          {navItems.map(({ label, icon, path }) => {
            if (user && label === 'For you') {
              return (
                <>
                  <NavLink
                    key="Write"
                    to="/write"
                    className={({ isActive }) =>
                      `flex flex-col items-center ${isActive ? 'text-accent' : ''}`
                    }
                  >
                    <Pencil size={20} />
                    <span>Write</span>
                  </NavLink>
                  <NavLink
                    key={label}
                    to={path}
                    className={({ isActive }) =>
                      `flex flex-col items-center ${isActive ? 'text-accent' : ''}`
                    }
                  >
                    {cloneElement(icon, { size: 20 })}
                    <span>{label}</span>
                  </NavLink>
                </>
              );
            }

            return (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) =>
                  `flex flex-col items-center ${isActive ? 'text-accent' : ''}`
                }
              >
                {cloneElement(icon, { size: 20 })}
                <span>{label}</span>
              </NavLink>
            );
          })}

          <div className="relative" ref={userMenuRefMobile}>
            {user ? (
              <NavLink to="/profile" className="flex flex-col items-center">
                <img
                  src={user.avatar_url}
                  className="w-6 h-6 rounded-full"
                  alt="avatar"
                />
                <span>Account</span>
              </NavLink>
            ) : (
              <>
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setUserMenuOpen(false);
                  }}
                  className="flex flex-col items-center"
                >
                  <User size={20} />
                  <span>Account</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showSignup && (
        <SignupPopup
          onClose={() => setShowSignup(false)}
          onLogin={setUser}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}

      {showLogin && (
        <LoginPopup
          onClose={() => setShowLogin(false)}
          onLogin={setUser}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

    </div>
  );
}

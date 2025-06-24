import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router';
import Header from './components/Header';
import Home from './pages/Home';
import UserPanel from './pages/UserPanel';
import SignUp from './pages/Signup';
import Login from './pages/Login';
import OAuthSuccess from './pages/OAuthSuccess';
import NotFound from './pages/NotFound';
import Write from './pages/Write';
import Trending from './pages/Trending';
import Latest from './pages/Latest';
import PostDetail from './components/PostDetail';
import ScrollToTop from './utilities/ScrollToTop';
import UserProfile from './pages/UserProfile';
import FollowingFeed from './pages/FollowingFeed';
import LoadingScreen from './components/LoadingScreen'; 

function App() {
  const [loading, setLoading] = useState(true);
  const [delayPassed, setDelayPassed] = useState(false);

  useEffect(() => {
    // Small timeout to prevent showing app before fade-in loader
    const timeout = setTimeout(() => {
      setDelayPassed(true);
    }, 50); // 50ms ensures fade-in runs

    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 1200); // your loading duration

    return () => {
      clearTimeout(timeout);
      clearTimeout(loadingTimeout);
    };
  }, []);

  return (
    <>
      <LoadingScreen isLoading={loading} />
      {delayPassed && (
        <div className="bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText min-h-screen">
          <Header />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<UserPanel />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/write" element={<Write />} />
            <Route path="/write/:slug" element={<Write />} />
            <Route path="/post/:slug" element={<PostDetail />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/latest" element={<Latest />} />
            <Route path="/for-you" element={<FollowingFeed />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <div style={{ height: '40px' }} />
        </div>
      )}
    </>
  );
}

export default App;

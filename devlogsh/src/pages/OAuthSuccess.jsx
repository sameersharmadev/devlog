import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';

export default function OAuthSuccess() {
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    const from = params.get('from') || '/';

    if (token) {
      localStorage.setItem('token', token);

      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            window.location.href = from; 
          } else {
            console.error('Invalid response', data);
            window.location.href = '/login';
          }
        })
        .catch(err => {
          console.error('OAuth fetch failed:', err);
          window.location.href = '/login';
        });
    } else {
      window.location.href = '/login';
    }
  }, [params]);

  return (
    <div className="flex justify-center items-center h-screen">
      <LoadingScreen />
    </div>
  );
}

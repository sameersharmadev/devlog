import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthSuccess() {
  const navigate = useNavigate();
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
            navigate(from);
          } else {
            console.error('Invalid response', data);
            navigate('/login');
          }
        })
        .catch(err => {
          console.error('OAuth fetch failed:', err);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [navigate, params]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-muted-foreground text-sm">Logging you in...</p>
    </div>
  );
}

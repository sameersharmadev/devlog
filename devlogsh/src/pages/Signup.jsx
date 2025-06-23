import { useState, useRef, useEffect } from 'react';

export default function SignupPopup({ onClose, onLogin, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    user: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const modalRef = useRef();

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const avatar_url = `https://api.dicebear.com/8.x/shapes/svg?seed=${encodeURIComponent(formData.user)}`;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: formData.user,
          email: formData.email,
          password: formData.password,
          avatar_url,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to signup');

      // Auto-login
      const loginRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error || 'Failed to login after signup');

      localStorage.setItem('token', loginData.token);
      onLogin?.(loginData.user);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const fields = [
    { name: 'user', label: 'Username', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-md bg-lightBg dark:bg-darkBg rounded-xl shadow-xl px-6 py-8 relative mx-2 sm:mx-4 sm:scale-100 scale-95 sm:rounded-2xl"
      >
        <h2 className="text-2xl font-semibold mb-6 border-b border-accent pb-4">Sign up</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map(({ name, label, type }) => (
            <div key={name} className="relative">
              <input
                id={name}
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                required
                placeholder=" "
                className="peer w-full px-4 pt-5 pb-2 text-sm text-foreground bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-md outline-none focus:border-accent transition"
              />
              <label
                htmlFor={name}
                className={`absolute left-3 top-1.5 text-xs px-1 transition-all duration-150 pointer-events-none
                  text-muted-foreground
                  peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2
                  peer-placeholder-shown:text-sm
                  peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-accent peer-focus:-translate-y-0
                  ${formData[name] ? 'text-accent' : ''}`}
              >
                {label}
              </label>
            </div>
          ))}

          {error && <p className="text-sm text-red-500 -mt-2">{error}</p>}

          <button
            type="submit"
            className="mt-4 px-6 py-2 border rounded-full w-full hover:bg-white hover:text-[#1d3439] transition"
          >
            Signup
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Already registered?{' '}
          <button
            type="button"
            className="text-accent underline underline-offset-2"
            onClick={() => {
              onClose();
              onSwitchToLogin?.();
            }}
          >
            Login
          </button>
        </p>

        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

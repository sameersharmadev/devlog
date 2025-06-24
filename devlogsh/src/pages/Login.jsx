import { useState, useRef, useEffect } from 'react';

export default function LoginPopup({ onClose, onLogin, onSwitchToSignup }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const modalRef = useRef();

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      onLogin?.(data.user);
      window.location.reload();
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
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-md bg-lightBg dark:bg-darkBg rounded-xl shadow-xl px-6 py-8 relative mx-2 sm:mx-4 sm:scale-100 scale-95 sm:rounded-2xl"
      >
        <h2 className="text-2xl font-semibold mb-6 border-b border-accent pb-4">Login</h2>

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
            className="mt-4 px-6 py-2 rounded-full w-full bg-accent text-white hover:bg-white hover:text-[#1d3439] transition"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-300 dark:border-zinc-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-lightBg dark:bg-darkBg px-2 text-muted-foreground">OR</span>
          </div>
        </div>

        {/* Google OAuth button */}
        <div>
          <button
            type="button"
            onClick={() => {
              const from = window.location.pathname;
              window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google?from=${encodeURIComponent(from)}`;
            }}
            className="flex items-center justify-center w-full gap-3 border rounded-full px-4 py-2 bg-white text-[#1d3439] hover:bg-zinc-100 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M533.5 278.4c0-18.6-1.5-37.4-4.8-55.4H272.1v104.9h146.5c-6.4 34.1-26.2 62.9-55.9 82.1v68h90.1c52.6-48.4 81.1-119.6 81.1-199.6z"
                fill="#4285F4"
              />
              <path
                d="M272.1 544.3c74.3 0 136.6-24.5 182-66.4l-90.1-68c-25.1 17-57.3 27.1-91.9 27.1-70.5 0-130.3-47.7-151.7-111.8h-92.6v69.8c45.1 89.4 138.2 149.3 244.4 149.3z"
                fill="#34A853"
              />
              <path
                d="M120.4 325.2c-10.3-30.5-10.3-63.7 0-94.2v-69.8h-92.6c-39.1 76.4-39.1 166.7 0 243.1l92.6-69.1z"
                fill="#FBBC05"
              />
              <path
                d="M272.1 107.7c39.2-.6 76.8 13.3 105.6 39.6l79.2-79.2C408.6 23.5 341.6-1.2 272.1 0 165.9 0 72.9 59.9 27.8 149.3l92.6 69.8c21.3-64 81.1-111.4 151.7-111.4z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-medium">Continue with Google</span>
          </button>
        </div>

        <p className="text-center text-sm mt-6">
          Don’t have an account?{' '}
          <button
            type="button"
            className="text-accent underline underline-offset-2"
            onClick={() => {
              onClose();
              onSwitchToSignup?.();
            }}
          >
            Sign up
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

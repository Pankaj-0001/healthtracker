import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/UI';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(form);
      toast(`Welcome back, ${data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    }
    setLoading(false);
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError('');
    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      if (!data.profileComplete) {
        toast(`Welcome, ${data.name}! Let's complete your health profile.`);
        navigate('/complete-profile');
      } else {
        toast(`Welcome back, ${data.name}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(145deg, #f8faf8 0%, #e6f4ef 60%, #c7eae1 100%)' }}>

      <div className="absolute top-0 right-0 w-96 h-96 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8bd6b7 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #004532 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-10 animate-slide-up">
          <div className="text-sm font-black tracking-[0.2em] uppercase text-primary mb-3">HEALTHTRACKER</div>
          <h1 className="font-serif text-4xl text-on-surface mb-2">Welcome back.</h1>
          <p className="text-sm text-outline">Sign in to your wellness dashboard</p>
        </div>

        <div className="card animate-slide-up delay-100 p-8">
          {/* Google Sign In */}
          <div className="flex flex-col items-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in failed. Please try again.')}
              width="368"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-emerald-900/10" />
            <span className="text-xs font-semibold text-outline">or sign in with email</span>
            <div className="flex-1 h-px bg-emerald-900/10" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="input-label">Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error-container text-sm font-medium" style={{ color: '#93000a' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                {error}
              </div>
            )}

            <button className="btn-primary w-full py-3.5 text-base mt-1" type="submit" disabled={loading}>
              {loading ? <Spinner size={20} /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-outline mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

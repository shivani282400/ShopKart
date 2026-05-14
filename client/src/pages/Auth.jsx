import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Auth({ mode = 'login' }) {
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const errs = {};
    if (!isLogin && !form.name.trim()) errs.name = 'Name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Enter a valid email';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!isLogin && form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate(redirect);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Something went wrong';
      setErrors({ general: msg });
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-mark">SK</span>
            <span>ShopKart</span>
          </Link>
          <h2 className="auth-tagline">Your premium shopping destination</h2>
          <p className="auth-sub">Discover thousands of curated products from top brands. Fast shipping, easy returns, and unbeatable prices.</p>
          <div className="auth-features">
            {['🚚 Free delivery above ₹999', '✅ 7-day easy returns', '🔒 Secure payments', '⭐ 50,000+ happy customers'].map(f => (
              <div key={f} className="auth-feature">{f}</div>
            ))}
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80" alt="Shopping" className="auth-bg-img" />
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
            <p>{isLogin ? 'Sign in to your ShopKart account' : 'Join thousands of happy shoppers'}</p>
          </div>

          {errors.general && (
            <div className="auth-error-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {!isLogin && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input className={'input' + (errors.name ? ' error' : '')} type="text" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} autoComplete="name" />
                {errors.name && <span className="input-error">{errors.name}</span>}
              </div>
            )}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className={'input' + (errors.email ? ' error' : '')} type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
              {errors.email && <span className="input-error">{errors.email}</span>}
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className={'input' + (errors.password ? ' error' : '')} type="password" placeholder={isLogin ? '••••••••' : 'Min. 6 characters'} value={form.password} onChange={e => set('password', e.target.value)} autoComplete={isLogin ? 'current-password' : 'new-password'} />
              {errors.password && <span className="input-error">{errors.password}</span>}
            </div>
            {!isLogin && (
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <input className={'input' + (errors.confirmPassword ? ' error' : '')} type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                {errors.confirmPassword && <span className="input-error">{errors.confirmPassword}</span>}
              </div>
            )}

            <button type="submit" className="btn btn-accent btn-lg auth-submit" disabled={loading}>
              {loading ? <><span className="spinner" /> {isLogin ? 'Signing in...' : 'Creating account...'}</> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'} className="auth-switch-link">
              {isLogin ? 'Create one' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: "Men's", path: '/products?category=mens-fashion' },
  { label: "Women's", path: '/products?category=womens-fashion' },
  { label: 'Electronics', path: '/products?category=electronics' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [location]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/products?search=' + encodeURIComponent(searchQuery.trim()));
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className={'navbar' + (scrolled ? ' scrolled' : '')}>
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">
            <span className="logo-mark">SK</span>
            <span className="logo-wordmark">ShopKart</span>
          </Link>

          <ul className="navbar-links">
            {navLinks.map(link => (
              <li key={link.path}>
                <Link to={link.path} className={'navbar-link' + (location.pathname + location.search === link.path ? ' active' : '')}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            <button className="nav-icon-btn" onClick={() => setSearchOpen(true)} title="Search">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>

            <Link to="/cart" className="nav-icon-btn cart-btn" title="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>

            {user ? (
              <div className="user-menu" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                <button className="user-avatar-btn">
                  <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
                </button>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                    <Link to="/profile" className="dropdown-item">My Profile</Link>
                    <Link to="/orders" className="dropdown-item">My Orders</Link>
                    {isAdmin && <Link to="/admin" className="dropdown-item admin-item">Admin Panel</Link>}
                    <button onClick={logout} className="dropdown-item logout-item">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
            )}

            <button className="nav-icon-btn mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mobile-menu">
            <div className="container">
              {navLinks.map(link => <Link key={link.path} to={link.path} className="mobile-link">{link.label}</Link>)}
              <hr className="mobile-divider" />
              {user ? (
                <>
                  <Link to="/profile" className="mobile-link">My Profile</Link>
                  <Link to="/orders" className="mobile-link">My Orders</Link>
                  {isAdmin && <Link to="/admin" className="mobile-link">Admin Panel</Link>}
                  <button onClick={logout} className="mobile-link mobile-logout">Sign Out</button>
                </>
              ) : (
                <Link to="/login" className="mobile-link mobile-login">Login / Register</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <p className="search-label">What are you looking for?</p>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text" autoFocus
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-submit">Search</button>
            </form>
            <p className="search-hint">Press <kbd>ESC</kbd> to close</p>
          </div>
        </div>
      )}

      <div className="navbar-spacer" />
    </>
  );
}

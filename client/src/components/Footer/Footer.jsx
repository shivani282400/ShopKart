import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-mark">SK</span>
              <span>ShopKart</span>
            </div>
            <p className="footer-tagline">Your premium destination for curated fashion, electronics & lifestyle products.</p>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?category=mens-fashion">Men's Fashion</Link>
            <Link to="/products?category=womens-fashion">Women's Fashion</Link>
            <Link to="/products?category=electronics">Electronics</Link>
            <Link to="/products?category=home-living">Home & Living</Link>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/cart">My Cart</Link>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <Link to="/orders">Track Orders</Link>
            <Link to="/profile">Manage Account</Link>
            <Link to="/cart">Cart Support</Link>
            <Link to="/products">Browse Catalog</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 ShopKart. All rights reserved.</p>
          <div className="payment-icons">
            {['Visa', 'Mastercard', 'UPI', 'PayTM', 'COD'].map(p => (
              <span key={p} className="payment-chip">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import api from '../utils/api';
import './Home.css';

const categories = [
  { name: "Men's Fashion", slug: 'mens-fashion', emoji: '👔', color: '#E8EAF6' },
  { name: "Women's Fashion", slug: 'womens-fashion', emoji: '👗', color: '#FCE4EC' },
  { name: 'Electronics', slug: 'electronics', emoji: '📱', color: '#E3F2FD' },
  { name: 'Home & Living', slug: 'home-living', emoji: '🏠', color: '#F3E5F5' },
  { name: 'Sports & Fitness', slug: 'sports-fitness', emoji: '🏃', color: '#E8F5E9' },
  { name: 'Books', slug: 'books', emoji: '📚', color: '#FFF8E1' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products/featured')
      .then(res => setFeatured(res.data.products))
      .catch(() => setError('Featured products are unavailable right now.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge">New Collection</div>
            <h1 className="hero-title">
              Discover Your<br />
              <span className="hero-title-accent">Perfect Style</span>
            </h1>
            <p className="hero-subtitle">
              Premium fashion, electronics & lifestyle products curated just for you.
              Free shipping on orders above ₹999.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-accent btn-lg">Shop Now</Link>
              <Link to="/products?featured=true" className="btn btn-outline btn-lg">View Trending</Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><strong>10K+</strong><span>Products</span></div>
              <div className="stat-divider" />
              <div className="stat"><strong>50K+</strong><span>Happy Customers</span></div>
              <div className="stat-divider" />
              <div className="stat"><strong>4.8★</strong><span>Avg Rating</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-img-wrap">
              <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80" alt="Fashion" className="hero-img" />
              <div className="hero-float-card">
                <div className="float-icon">🚚</div>
                <div>
                  <p className="float-title">Free Delivery</p>
                  <p className="float-sub">Orders above ₹999</p>
                </div>
              </div>
              <div className="hero-float-card hero-float-card-2">
                <div className="float-icon">✅</div>
                <div>
                  <p className="float-title">Easy Returns</p>
                  <p className="float-sub">7-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">Browse by Category</p>
            <h2 className="section-title">Shop by Department</h2>
          </div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <Link
                key={cat.slug}
                to={'/products?category=' + cat.slug}
                className="category-card"
                style={{ '--cat-color': cat.color, animationDelay: `${i * 0.08}s` }}
              >
                <div className="cat-icon">{cat.emoji}</div>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="promo-banner">
        <div className="container">
          <div className="promo-grid">
            <div className="promo-card promo-large">
              <div className="promo-text">
                <span className="promo-tag">Limited Time</span>
                <h3>Up to 50% Off<br/>on Electronics</h3>
                <Link to="/products?category=electronics" className="btn btn-primary btn-sm">Shop Electronics</Link>
              </div>
              <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80" alt="Electronics" />
            </div>
            <div className="promo-small-grid">
              <div className="promo-card promo-small promo-fashion">
                <div className="promo-text">
                  <span className="promo-tag">New Arrivals</span>
                  <h3>Fashion Sale</h3>
                  <Link to="/products?category=womens-fashion" className="btn btn-outline btn-sm">Explore</Link>
                </div>
              </div>
              <div className="promo-card promo-small promo-home">
                <div className="promo-text">
                  <span className="promo-tag">Bestsellers</span>
                  <h3>Home Decor</h3>
                  <Link to="/products?category=home-living" className="btn btn-outline btn-sm">Shop Now</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">Handpicked for You</p>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Our top picks this season</p>
          </div>
          {loading ? (
            <div className="products-grid">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 380 }} />
              ))}
            </div>
          ) : error ? (
            <div className="empty-state">
              <h3>Could not load featured products</h3>
              <p>{error}</p>
            </div>
          ) : (
            <div className="products-grid">
              {featured.map((product, i) => (
                <div key={product._id} style={{ animationDelay: `${i * 0.07}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
          <div className="section-cta">
            <Link to="/products" className="btn btn-primary btn-lg">View All Products</Link>
          </div>
        </div>
      </section>

      {/* USP Strip */}
      <section className="usp-strip">
        <div className="container">
          <div className="usp-grid">
            {[
              { icon: '🚚', title: 'Free Delivery', sub: 'On orders above ₹999' },
              { icon: '↩️', title: 'Easy Returns', sub: '7-day hassle-free returns' },
              { icon: '🔒', title: 'Secure Payment', sub: '100% safe & encrypted' },
              { icon: '⭐', title: 'Premium Quality', sub: 'Curated products only' },
            ].map(u => (
              <div key={u.title} className="usp-item">
                <div className="usp-icon">{u.icon}</div>
                <div>
                  <p className="usp-title">{u.title}</p>
                  <p className="usp-sub">{u.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

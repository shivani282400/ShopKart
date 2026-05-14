import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductCard.css';

const StarIcon = ({ filled }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "#C8956C" : "none"} stroke="#C8956C" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login first'); return; }
    await addToCart(product._id, 1, product.sizes?.[0], product.colors?.[0]);
  };

  const discountPct = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : product.discount || 0;

  return (
    <Link to={'/products/' + product.slug} className="product-card">
      <div className="product-image-wrap">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
          alt={product.name}
          className="product-img"
          loading="lazy"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'; }}
        />
        {discountPct > 0 && <span className="product-discount-badge">-{discountPct}%</span>}
        {product.stock === 0 && <div className="out-of-stock-overlay"><span>Out of Stock</span></div>}

        <button
          className="quick-add-btn"
          onClick={handleAddToCart}
          disabled={loading || product.stock === 0}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
        </button>
      </div>

      <div className="product-info">
        <p className="product-brand">{product.brand || product.category?.name}</p>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          {[1, 2, 3, 4, 5].map(n => (
            <StarIcon key={n} filled={n <= Math.round(product.ratings?.average || 0)} />
          ))}
          <span className="rating-count">({product.ratings?.count || 0})</span>
        </div>
        <div className="product-price-row">
          <span className="product-price">₹{product.price?.toLocaleString()}</span>
          {discountPct > 0 && (
            <span className="product-original-price">₹{product.originalPrice?.toLocaleString()}</span>
          )}
        </div>
        {product.sizes?.length > 0 && (
          <div className="product-sizes">
            {product.sizes.slice(0, 4).map(s => <span key={s} className="size-chip">{s}</span>)}
            {product.sizes.length > 4 && <span className="size-more">+{product.sizes.length - 4}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}

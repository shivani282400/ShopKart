import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const StarIcon = ({ filled, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#C8956C" : "none"} stroke="#C8956C" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [error, setError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/products/' + slug)
      .then(res => {
        setProduct(res.data.product);
        setSelectedSize(res.data.product.sizes?.[0] || '');
        setSelectedColor(res.data.product.colors?.[0] || '');
        return api.get('/reviews/' + res.data.product._id);
      })
      .then(res => setReviews(res.data.reviews))
      .catch(() => setError('Product details could not be loaded.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add to cart'); return; }
    if (product.sizes?.length > 0 && !selectedSize) { toast.error('Please select a size'); return; }
    setAddingCart(true);
    await addToCart(product._id, quantity, selectedSize, selectedColor);
    setAddingCart(false);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', { productId: product._id, ...reviewForm });
      setReviews(prev => [res.data.review, ...prev]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div className="detail-grid">
        <div className="skeleton" style={{ height: 540, borderRadius: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 24 - i * 2 }} />)}
        </div>
      </div>
    </div>
  );

  if (error) return <div className="container" style={{ padding: 60, textAlign: 'center' }}><h2>Unable to load product</h2><p style={{ marginTop: 12 }}>{error}</p><Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Products</Link></div>;
  if (!product) return <div className="container" style={{ padding: 60, textAlign: 'center' }}><h2>Product not found</h2><Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Products</Link></div>;

  const discount = product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div className="product-detail">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/products">Products</Link> / <span>{product.name}</span>
        </div>

        <div className="detail-grid">
          {/* Images */}
          <div className="detail-images">
            <div className="main-image-wrap">
              <img src={product.images?.[selectedImage] || ''} alt={product.name} className="main-image" />
              {discount > 0 && <span className="detail-badge">-{discount}% OFF</span>}
            </div>
            {product.images?.length > 1 && (
              <div className="thumbnails">
                {product.images.map((img, i) => (
                  <button key={i} className={'thumb' + (selectedImage === i ? ' active' : '')} onClick={() => setSelectedImage(i)}>
                    <img src={img} alt={product.name + ' ' + (i + 1)} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <div className="detail-brand">{product.brand}</div>
            <h1 className="detail-title">{product.name}</h1>

            <div className="detail-rating">
              {[1,2,3,4,5].map(n => <StarIcon key={n} filled={n <= Math.round(product.ratings?.average || 0)} />)}
              <span className="rating-num">{product.ratings?.average?.toFixed(1)}</span>
              <span className="rating-count">({product.ratings?.count} reviews)</span>
            </div>

            <div className="detail-price-row">
              <span className="detail-price">₹{product.price?.toLocaleString()}</span>
              {discount > 0 && <>
                <span className="detail-original">₹{product.originalPrice?.toLocaleString()}</span>
                <span className="detail-save">Save ₹{(product.originalPrice - product.price)?.toLocaleString()}</span>
              </>}
            </div>

            <p className="detail-desc">{product.shortDescription || product.description}</p>

            {product.colors?.length > 0 && (
              <div className="option-group">
                <p className="option-label">Color: <strong>{selectedColor}</strong></p>
                <div className="color-options">
                  {product.colors.map(c => (
                    <button key={c} className={'color-chip' + (selectedColor === c ? ' active' : '')} onClick={() => setSelectedColor(c)}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div className="option-group">
                <p className="option-label">Size: <strong>{selectedSize || 'Select'}</strong></p>
                <div className="size-options">
                  {product.sizes.map(s => (
                    <button key={s} className={'size-btn' + (selectedSize === s ? ' active' : '')} onClick={() => setSelectedSize(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="quantity-row">
              <div className="qty-control">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <span className="stock-info">{product.stock > 0 ? (product.stock < 10 ? `Only ${product.stock} left!` : 'In Stock') : 'Out of Stock'}</span>
            </div>

            <div className="detail-actions">
              <button className="btn btn-accent btn-lg" style={{ flex: 1 }} onClick={handleAddToCart} disabled={addingCart || product.stock === 0}>
                {addingCart ? <span className="spinner" /> : (product.stock === 0 ? 'Out of Stock' : 'Add to Cart')}
              </button>
              <Link to="/cart" className="btn btn-primary btn-lg">Buy Now</Link>
            </div>

            <div className="detail-perks">
              {['🚚 Free delivery above ₹999', '↩️ 7-day easy returns', '🔒 Secure checkout'].map(p => (
                <span key={p} className="perk-item">{p}</span>
              ))}
            </div>

            {product.specifications?.length > 0 && (
              <div className="specifications">
                <h3>Specifications</h3>
                <table className="spec-table">
                  <tbody>
                    {product.specifications.map(s => (
                      <tr key={s.key}>
                        <td className="spec-key">{s.key}</td>
                        <td className="spec-val">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="detail-description">
          <h2>About this Product</h2>
          <p>{product.description}</p>
        </div>

        {/* Reviews */}
        <div className="reviews-section">
          <h2>Customer Reviews</h2>
          <div className="reviews-layout">
            <div className="reviews-list">
              {reviews.length === 0 ? (
                <div className="no-reviews">
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              ) : reviews.map(review => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-avatar">{review.user?.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <p className="reviewer-name">{review.user?.name}</p>
                      <div className="review-stars">{[1,2,3,4,5].map(n => <StarIcon key={n} filled={n <= review.rating} size={12} />)}</div>
                    </div>
                    {review.isVerifiedPurchase && <span className="verified-badge">✓ Verified Purchase</span>}
                  </div>
                  <h4 className="review-title">{review.title}</h4>
                  <p className="review-comment">{review.comment}</p>
                  <p className="review-date">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              ))}
            </div>

            {user && (
              <div className="review-form-wrap">
                <h3>Write a Review</h3>
                <form onSubmit={submitReview} className="review-form">
                  <div className="rating-select">
                    <p>Your Rating</p>
                    <div className="rating-stars">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>
                          <StarIcon filled={n <= reviewForm.rating} size={24} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input className="input" placeholder="Review Title" value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} required />
                  <textarea className="input" placeholder="Share your experience..." rows={4} value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} required style={{ resize: 'vertical' }} />
                  <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                    {submittingReview ? <span className="spinner" /> : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

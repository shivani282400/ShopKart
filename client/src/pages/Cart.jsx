import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

export default function Cart() {
  const { cart, updateItem, removeItem, clearCart, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const items = cart?.items || [];
  const shipping = cartTotal >= 999 ? 0 : 99;
  const total = cartTotal + shipping;

  if (!user) return (
    <div className="cart-empty-page">
      <div className="container">
        <div className="empty-cart-box">
          <div className="empty-cart-icon">🛒</div>
          <h2>Please login to view your cart</h2>
          <p>You need to be logged in to manage your cart.</p>
          <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
        </div>
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div className="cart-empty-page">
      <div className="container">
        <div className="empty-cart-box">
          <div className="empty-cart-icon">🛍️</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet. Start shopping!</p>
          <Link to="/products" className="btn btn-accent btn-lg">Browse Products</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <span className="cart-item-count">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            <div className="cart-items-header">
              <button className="clear-cart-btn" onClick={clearCart}>Clear All</button>
            </div>
            {items.map(item => {
              if (!item.product) return null;
              const { product } = item;
              return (
                <div key={item._id} className="cart-item">
                  <Link to={'/products/' + product.slug} className="cart-item-img-wrap">
                    <img src={product.images?.[0] || ''} alt={product.name} className="cart-item-img" />
                  </Link>
                  <div className="cart-item-info">
                    <Link to={'/products/' + product.slug} className="cart-item-name">{product.name}</Link>
                    <div className="cart-item-meta">
                      {item.size && <span className="cart-meta-chip">Size: {item.size}</span>}
                      {item.color && <span className="cart-meta-chip">Color: {item.color}</span>}
                    </div>
                    <div className="cart-item-row">
                      <div className="qty-control">
                        <button onClick={() => item.quantity > 1 ? updateItem(item._id, item.quantity - 1) : removeItem(item._id)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateItem(item._id, item.quantity + 1)} disabled={item.quantity >= product.stock}>+</button>
                      </div>
                      <div className="cart-item-price-col">
                        <span className="cart-item-price">₹{(product.price * item.quantity).toLocaleString()}</span>
                        <span className="cart-item-unit">₹{product.price?.toLocaleString()} each</span>
                      </div>
                    </div>
                  </div>
                  <button className="cart-remove-btn" onClick={() => removeItem(item._id)} title="Remove item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-rows">
              <div className="summary-row"><span>Subtotal ({cartCount} items)</span><span>₹{cartTotal.toLocaleString()}</span></div>
              <div className="summary-row"><span>Shipping</span><span className={shipping === 0 ? 'free-shipping' : ''}>{shipping === 0 ? 'FREE' : '₹' + shipping}</span></div>
              {shipping > 0 && <p className="shipping-note">Add ₹{(999 - cartTotal).toLocaleString()} more for free shipping</p>}
            </div>
            <div className="summary-total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            <button className="btn btn-accent btn-lg" style={{ width: '100%', marginTop: 20 }} onClick={() => navigate('/checkout')}>
              Proceed to Checkout →
            </button>
            <Link to="/products" className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 10, justifyContent: 'center' }}>
              ← Continue Shopping
            </Link>
            <div className="secure-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Secure & Encrypted Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

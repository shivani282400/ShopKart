import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './OrderDetail.css';

const STATUS_STEPS = ['placed','confirmed','processing','shipped','delivered'];
const STATUS_META = {
  placed:     { label: 'Order Placed',  icon: '📋' },
  confirmed:  { label: 'Confirmed',     icon: '✅' },
  processing: { label: 'Processing',    icon: '⚙️' },
  shipped:    { label: 'Shipped',       icon: '🚚' },
  delivered:  { label: 'Delivered',     icon: '📦' },
  cancelled:  { label: 'Cancelled',     icon: '❌' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    setError('');
    api.get('/orders/' + id)
      .then(r => setOrder(r.data.order))
      .catch(() => setError('Order details could not be loaded.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (!user) return <div className="container" style={{padding:'80px 24px',textAlign:'center'}}><Link to="/login" className="btn btn-primary">Login</Link></div>;
  if (loading) return <div className="container" style={{padding:'80px 24px',textAlign:'center'}}><div className="spinner spinner-dark" style={{width:36,height:36}} /></div>;
  if (error) return <div className="container" style={{padding:'80px 24px',textAlign:'center'}}><h2>Unable to load order</h2><p style={{marginTop:12}}>{error}</p><Link to="/orders" className="btn btn-primary" style={{marginTop:20}}>My Orders</Link></div>;
  if (!order) return <div className="container" style={{padding:'80px 24px',textAlign:'center'}}><h2>Order not found</h2><Link to="/orders" className="btn btn-primary" style={{marginTop:20}}>My Orders</Link></div>;

  const stepIdx = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="order-detail-page">
      <div className="container">
        <div className="order-detail-header">
          <div>
            <Link to="/orders" className="back-link">← My Orders</Link>
            <h1>Order Details</h1>
            <p className="order-detail-num">{order.orderNumber}</p>
          </div>
          <div className="order-detail-date">
            <p>Placed on</p>
            <strong>{new Date(order.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</strong>
          </div>
        </div>

        {/* Progress Tracker */}
        {!isCancelled && (
          <div className="order-tracker">
            {STATUS_STEPS.map((s, i) => {
              const meta = STATUS_META[s];
              const done = i <= stepIdx;
              const active = i === stepIdx;
              return (
                <div key={s} className={'tracker-step' + (done ? ' done' : '') + (active ? ' active' : '')}>
                  <div className="tracker-icon">{meta.icon}</div>
                  <p className="tracker-label">{meta.label}</p>
                  {i < STATUS_STEPS.length - 1 && <div className={'tracker-line' + (i < stepIdx ? ' filled' : '')} />}
                </div>
              );
            })}
          </div>
        )}

        {isCancelled && (
          <div className="cancelled-banner">❌ This order has been cancelled</div>
        )}

        <div className="order-detail-grid">
          {/* Items */}
          <div className="order-detail-items">
            <h2>Items Ordered</h2>
            {order.items?.map((item, i) => (
              <div key={i} className="detail-order-item">
                <img src={item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100'} alt={item.name} />
                <div className="detail-order-item-info">
                  <p className="detail-item-name">{item.name}</p>
                  <div className="detail-item-meta">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <p className="detail-item-unit">₹{item.price?.toLocaleString()} each</p>
                </div>
                <p className="detail-item-total">₹{(item.price * item.quantity)?.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="order-detail-aside">
            {/* Shipping Address */}
            <div className="aside-card">
              <h3>Delivery Address</h3>
              <p><strong>{order.shippingAddress?.name}</strong></p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p>{order.shippingAddress?.pincode}</p>
              {order.shippingAddress?.phone && <p>📞 {order.shippingAddress.phone}</p>}
            </div>

            {/* Payment */}
            <div className="aside-card">
              <h3>Payment Info</h3>
              <div className="payment-info-row"><span>Method</span><strong>{order.paymentMethod?.toUpperCase()}</strong></div>
              <div className="payment-info-row"><span>Status</span><strong className={'payment-status ' + order.paymentStatus}>{order.paymentStatus}</strong></div>
            </div>

            {/* Price Summary */}
            <div className="aside-card">
              <h3>Price Summary</h3>
              <div className="price-summary-rows">
                <div className="price-row"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
                <div className="price-row"><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : '₹' + order.shippingCost}</span></div>
                {order.discount > 0 && <div className="price-row discount"><span>Discount</span><span>−₹{order.discount?.toLocaleString()}</span></div>}
                <div className="price-row total"><span>Total</span><span>₹{order.total?.toLocaleString()}</span></div>
              </div>
            </div>

            {order.estimatedDelivery && order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
              <div className="aside-card delivery-estimate">
                <p className="est-label">Estimated Delivery</p>
                <p className="est-date">{new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {weekday:'long',day:'numeric',month:'long'})}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

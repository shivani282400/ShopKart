import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Orders.css';

const STATUS_META = {
  placed:      { label: 'Order Placed',  color: '#3B82F6', bg: '#EFF6FF', icon: '📋' },
  confirmed:   { label: 'Confirmed',     color: '#8B5CF6', bg: '#F5F3FF', icon: '✅' },
  processing:  { label: 'Processing',    color: '#F59E0B', bg: '#FFFBEB', icon: '⚙️' },
  shipped:     { label: 'Shipped',       color: '#0EA5E9', bg: '#F0F9FF', icon: '🚚' },
  delivered:   { label: 'Delivered',     color: '#10B981', bg: '#ECFDF5', icon: '📦' },
  cancelled:   { label: 'Cancelled',     color: '#EF4444', bg: '#FEF2F2', icon: '❌' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    setError('');
    api.get('/orders/my')
      .then(r => setOrders(r.data.orders))
      .catch(() => setError('Orders could not be loaded. Please try again.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="container" style={{padding:'80px 24px',textAlign:'center'}}><h2>Please login to view orders</h2><Link to="/login" className="btn btn-primary" style={{marginTop:20}}>Login</Link></div>;

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>

        {loading ? (
          <div className="orders-list">{Array(3).fill(0).map((_,i) => <div key={i} className="skeleton" style={{height:140,borderRadius:12}} />)}</div>
        ) : error ? (
          <div className="orders-empty">
            <div className="empty-icon">!</div>
            <h2>Unable to load orders</h2>
            <p>{error}</p>
            <button className="btn btn-primary btn-lg" onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>When you place an order, it'll show up here.</p>
            <Link to="/products" className="btn btn-accent btn-lg">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const meta = STATUS_META[order.orderStatus] || STATUS_META.placed;
              return (
                <div key={order._id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-id-block">
                      <p className="order-number">{order.orderNumber}</p>
                      <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
                    </div>
                    <span className="order-status-badge" style={{ color: meta.color, background: meta.bg }}>
                      {meta.icon} {meta.label}
                    </span>
                    <div className="order-total-block">
                      <p className="order-total-label">Total</p>
                      <p className="order-total-amount">₹{order.total?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="order-items-preview">
                    {order.items?.slice(0, 4).map((item, i) => (
                      <div key={i} className="order-item-preview">
                        <img src={item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100'} alt={item.name} />
                        {i === 3 && order.items.length > 4 && (
                          <div className="more-items-overlay">+{order.items.length - 4}</div>
                        )}
                      </div>
                    ))}
                    <div className="order-items-info">
                      <p className="order-items-names">
                        {order.items?.slice(0, 2).map(i => i.name).join(', ')}
                        {order.items?.length > 2 && ` + ${order.items.length - 2} more`}
                      </p>
                      <p className="order-items-count">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <div className="order-payment-info">
                      <span className="payment-chip">{order.paymentMethod?.toUpperCase()}</span>
                      <span className={'payment-status ' + order.paymentStatus}>{order.paymentStatus}</span>
                    </div>
                    <Link to={'/orders/' + order._id} className="btn btn-outline btn-sm">View Details →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

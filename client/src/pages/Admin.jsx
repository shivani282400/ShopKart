import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Admin.css';

const TABS = ['Dashboard', 'Products', 'Orders', 'Users'];
const CATEGORIES_SLUGS = ['mens-fashion','womens-fashion','electronics','home-living','sports-fitness','books'];

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="stat-card" style={{'--stat-color': color}}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name:'', description:'', price:'', originalPrice:'', category:'', brand:'', stock:'', images:'', isFeatured:false });

  useEffect(() => {
    if (!user || !isAdmin) { navigate('/'); return; }
    fetchAll();
  }, [user, isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pr, or, ur, cr] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/orders'),
        api.get('/users'),
        api.get('/categories'),
      ]);
      setProducts(pr.data.products);
      setOrders(or.data.orders);
      setUsers(ur.data.users);
      setCategories(cr.data.categories);
    } catch (err) {
      toast.error('Failed to load data');
    } finally { setLoading(false); }
  };

  const totalRevenue = orders.filter(o => o.orderStatus !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => ['placed','confirmed','processing'].includes(o.orderStatus)).length;

  const openAddProduct = () => {
    setEditProduct(null);
    setProductForm({ name:'', description:'', price:'', originalPrice:'', category: categories[0]?._id || '', brand:'', stock:'', images:'', isFeatured:false });
    setShowProductModal(true);
  };
  const openEditProduct = (p) => {
    setEditProduct(p);
    setProductForm({ name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice, category: p.category?._id || p.category, brand: p.brand, stock: p.stock, images: p.images?.join(', '), isFeatured: p.isFeatured });
    setShowProductModal(true);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...productForm, price: Number(productForm.price), originalPrice: Number(productForm.originalPrice), stock: Number(productForm.stock), images: productForm.images.split(',').map(s => s.trim()).filter(Boolean) };
      if (editProduct) {
        await api.put('/products/' + editProduct._id, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      setShowProductModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete('/products/' + id);
      toast.success('Product deleted');
      fetchAll();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put('/orders/' + orderId + '/status', { orderStatus: status });
      toast.success('Order status updated');
      fetchAll();
    } catch (err) { toast.error('Failed to update'); }
  };

  if (!isAdmin) return null;

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-mark">SK</span>
          <span>Admin</span>
        </div>
        {TABS.map(tab => (
          <button key={tab} className={'admin-nav-item' + (activeTab === tab ? ' active' : '')} onClick={() => setActiveTab(tab)}>
            {tab === 'Dashboard' && '📊'} {tab === 'Products' && '📦'} {tab === 'Orders' && '🛒'} {tab === 'Users' && '👥'} {tab}
          </button>
        ))}
        <Link to="/" className="admin-nav-item back-to-site">← Back to Site</Link>
      </div>

      <div className="admin-content">
        <div className="admin-topbar">
          <h1 className="admin-page-title">{activeTab}</h1>
          <div className="admin-user">
            <div className="admin-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <span>{user?.name}</span>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="spinner spinner-dark" style={{width:40,height:40}} />
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            {/* Dashboard */}
            {activeTab === 'Dashboard' && (
              <div className="fade-up">
                <div className="stats-grid">
                  <StatCard icon="💰" label="Total Revenue" value={'₹' + totalRevenue.toLocaleString()} sub="All time" color="#10B981" />
                  <StatCard icon="🛒" label="Total Orders" value={orders.length} sub={`${pendingOrders} pending`} color="#3B82F6" />
                  <StatCard icon="📦" label="Products" value={products.length} sub="Active listings" color="#8B5CF6" />
                  <StatCard icon="👥" label="Customers" value={users.filter(u => u.role === 'user').length} sub="Registered users" color="#F59E0B" />
                </div>

                <div className="dashboard-grid">
                  <div className="admin-card">
                    <div className="admin-card-header"><h3>Recent Orders</h3><Link to="#" onClick={() => setActiveTab('Orders')} className="view-all">View All</Link></div>
                    <table className="admin-table">
                      <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {orders.slice(0, 6).map(order => (
                          <tr key={order._id}>
                            <td><code className="order-code">{order.orderNumber?.slice(-8)}</code></td>
                            <td>{order.user?.name || 'Guest'}</td>
                            <td><strong>₹{order.total?.toLocaleString()}</strong></td>
                            <td><span className={'order-status-pill ' + order.orderStatus}>{order.orderStatus}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="admin-card">
                    <div className="admin-card-header"><h3>Order Status Breakdown</h3></div>
                    <div className="status-breakdown">
                      {['placed','confirmed','processing','shipped','delivered','cancelled'].map(status => {
                        const count = orders.filter(o => o.orderStatus === status).length;
                        const pct = orders.length ? Math.round(count / orders.length * 100) : 0;
                        return (
                          <div key={status} className="breakdown-row">
                            <span className="breakdown-label">{status}</span>
                            <div className="breakdown-bar-wrap"><div className="breakdown-bar" style={{width: pct + '%'}} /></div>
                            <span className="breakdown-count">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            {activeTab === 'Products' && (
              <div className="fade-up">
                <div className="admin-toolbar">
                  <p className="admin-count">{products.length} products</p>
                  <button className="btn btn-accent" onClick={openAddProduct}>+ Add Product</button>
                </div>
                <div className="admin-card">
                  <table className="admin-table">
                    <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr></thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p._id}>
                          <td>
                            <div className="product-cell">
                              <img src={p.images?.[0]} alt={p.name} className="product-cell-img" />
                              <span className="product-cell-name">{p.name}</span>
                            </div>
                          </td>
                          <td><span className="category-pill">{p.category?.name || '—'}</span></td>
                          <td><strong>₹{p.price?.toLocaleString()}</strong></td>
                          <td><span className={'stock-pill ' + (p.stock < 10 ? 'low' : 'ok')}>{p.stock}</span></td>
                          <td>{p.isFeatured ? '⭐' : '—'}</td>
                          <td>
                            <div className="action-btns">
                              <button className="btn btn-outline btn-sm" onClick={() => openEditProduct(p)}>Edit</button>
                              <button className="btn btn-sm delete-btn" onClick={() => deleteProduct(p._id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders */}
            {activeTab === 'Orders' && (
              <div className="fade-up">
                <div className="admin-toolbar">
                  <p className="admin-count">{orders.length} orders total</p>
                </div>
                <div className="admin-card">
                  <table className="admin-table">
                    <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Update</th></tr></thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td><code className="order-code">{order.orderNumber?.slice(-10)}</code></td>
                          <td>
                            <p style={{fontWeight:600}}>{order.user?.name || 'Guest'}</p>
                            <p style={{fontSize:11,color:'var(--warm-gray)'}}>{order.user?.email}</p>
                          </td>
                          <td>{order.items?.length} items</td>
                          <td><strong>₹{order.total?.toLocaleString()}</strong></td>
                          <td><span className={'payment-pill ' + order.paymentStatus}>{order.paymentStatus}</span></td>
                          <td><span className={'order-status-pill ' + order.orderStatus}>{order.orderStatus}</span></td>
                          <td>
                            <select className="status-select" value={order.orderStatus} onChange={e => updateOrderStatus(order._id, e.target.value)}>
                              {['placed','confirmed','processing','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === 'Users' && (
              <div className="fade-up">
                <div className="admin-toolbar">
                  <p className="admin-count">{users.length} users registered</p>
                </div>
                <div className="admin-card">
                  <table className="admin-table">
                    <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-cell-avatar">{u.name?.[0]?.toUpperCase()}</div>
                              <span>{u.name}</span>
                            </div>
                          </td>
                          <td style={{color:'var(--warm-gray)',fontSize:13}}>{u.email}</td>
                          <td><span className={'role-pill ' + u.role}>{u.role}</span></td>
                          <td style={{fontSize:12,color:'var(--warm-gray)'}}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                          <td><span className={'status-pill ' + (u.isActive ? 'active' : 'inactive')}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setShowProductModal(false)}>✕</button>
            </div>
            <form onSubmit={saveProduct} className="modal-form">
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Product Name *</label>
                  <input className="input" value={productForm.name} onChange={e => setProductForm(f => ({...f, name: e.target.value}))} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Brand</label>
                  <input className="input" value={productForm.brand} onChange={e => setProductForm(f => ({...f, brand: e.target.value}))} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Description *</label>
                <textarea className="input" rows={3} value={productForm.description} onChange={e => setProductForm(f => ({...f, description: e.target.value}))} required style={{resize:'vertical'}} />
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Price (₹) *</label>
                  <input type="number" className="input" value={productForm.price} onChange={e => setProductForm(f => ({...f, price: e.target.value}))} required min="0" />
                </div>
                <div className="input-group">
                  <label className="input-label">Original Price (₹)</label>
                  <input type="number" className="input" value={productForm.originalPrice} onChange={e => setProductForm(f => ({...f, originalPrice: e.target.value}))} min="0" />
                </div>
                <div className="input-group">
                  <label className="input-label">Stock *</label>
                  <input type="number" className="input" value={productForm.stock} onChange={e => setProductForm(f => ({...f, stock: e.target.value}))} required min="0" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Category *</label>
                <select className="input" value={productForm.category} onChange={e => setProductForm(f => ({...f, category: e.target.value}))} required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Image URLs (comma-separated)</label>
                <input className="input" value={productForm.images} onChange={e => setProductForm(f => ({...f, images: e.target.value}))} placeholder="https://..., https://..." />
              </div>
              <label className="featured-toggle">
                <input type="checkbox" checked={productForm.isFeatured} onChange={e => setProductForm(f => ({...f, isFeatured: e.target.checked}))} />
                Mark as Featured Product
              </label>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowProductModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent">{editProduct ? 'Update Product' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

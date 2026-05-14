import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Checkout.css';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
  { id: 'online', label: 'Online Payment', icon: '💳', desc: 'UPI, Net Banking, Cards' },
  { id: 'card', label: 'Credit / Debit Card', icon: '🏦', desc: 'Visa, Mastercard, Rupay' },
];

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const items = cart?.items || [];
  const shipping = cartTotal >= 999 ? 0 : 99;
  const total = cartTotal + shipping;

  const [form, setForm] = useState({
    name: user?.name || '', phone: '', street: '', city: '', state: '', pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState(1); // 1=address 2=payment 3=review

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validateAddress = () => {
    if (!form.name || !form.phone || !form.street || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all address fields'); return false;
    }
    if (!/^\d{10}$/.test(form.phone)) { toast.error('Enter valid 10-digit phone number'); return false; }
    if (!/^\d{6}$/.test(form.pincode)) { toast.error('Enter valid 6-digit pincode'); return false; }
    return true;
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const orderItems = items.map(item => ({
        product: item.product._id, quantity: item.quantity,
        size: item.size, color: item.color
      }));
      const res = await api.post('/orders', {
        items: orderItems,
        shippingAddress: { ...form },
        paymentMethod,
      });
      await clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders/' + res.data.order._id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  if (!user) return <div className="container" style={{padding:'80px 24px',textAlign:'center'}}><h2>Please login to checkout</h2><Link to="/login" className="btn btn-primary" style={{marginTop:20}}>Login</Link></div>;
  if (items.length === 0) return <div className="container" style={{padding:'80px 24px',textAlign:'center'}}><h2>Your cart is empty</h2><Link to="/products" className="btn btn-accent" style={{marginTop:20}}>Shop Now</Link></div>;

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        {/* Steps */}
        <div className="checkout-steps">
          {['Delivery Address', 'Payment', 'Review Order'].map((s, i) => (
            <div key={s} className={'checkout-step' + (step === i+1 ? ' active' : '') + (step > i+1 ? ' done' : '')} onClick={() => step > i+1 && setStep(i+1)}>
              <div className="step-num">{step > i+1 ? '✓' : i+1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">

            {/* Step 1: Address */}
            {step === 1 && (
              <div className="checkout-section fade-up">
                <h2>Delivery Address</h2>
                <div className="address-form">
                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label">Full Name *</label>
                      <input className="input" placeholder="John Doe" value={form.name} onChange={e => setField('name', e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Phone Number *</label>
                      <input className="input" placeholder="10-digit mobile number" value={form.phone} onChange={e => setField('phone', e.target.value)} maxLength={10} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Street Address *</label>
                    <input className="input" placeholder="House No, Street, Area" value={form.street} onChange={e => setField('street', e.target.value)} />
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label">City *</label>
                      <input className="input" placeholder="City" value={form.city} onChange={e => setField('city', e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">State *</label>
                      <input className="input" placeholder="State" value={form.state} onChange={e => setField('state', e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Pincode *</label>
                      <input className="input" placeholder="6-digit pincode" value={form.pincode} onChange={e => setField('pincode', e.target.value)} maxLength={6} />
                    </div>
                  </div>
                </div>
                <button className="btn btn-accent btn-lg" onClick={() => { if (validateAddress()) setStep(2); }}>Continue to Payment →</button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="checkout-section fade-up">
                <h2>Select Payment Method</h2>
                <div className="payment-options">
                  {PAYMENT_METHODS.map(pm => (
                    <label key={pm.id} className={'payment-option' + (paymentMethod === pm.id ? ' selected' : '')}>
                      <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} />
                      <span className="payment-icon">{pm.icon}</span>
                      <div className="payment-info">
                        <p className="payment-label">{pm.label}</p>
                        <p className="payment-desc">{pm.desc}</p>
                      </div>
                      <div className={'payment-radio' + (paymentMethod === pm.id ? ' checked' : '')} />
                    </label>
                  ))}
                </div>
                <div className="checkout-nav-btns">
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-accent btn-lg" onClick={() => setStep(3)}>Review Order →</button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="checkout-section fade-up">
                <h2>Review Your Order</h2>
                <div className="review-address">
                  <div className="review-section-head">
                    <span>Delivery To</span>
                    <button className="edit-btn" onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <p><strong>{form.name}</strong> · {form.phone}</p>
                  <p>{form.street}, {form.city}, {form.state} — {form.pincode}</p>
                </div>
                <div className="review-address" style={{marginTop:14}}>
                  <div className="review-section-head">
                    <span>Payment</span>
                    <button className="edit-btn" onClick={() => setStep(2)}>Edit</button>
                  </div>
                  <p>{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.icon} {PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</p>
                </div>
                <div className="review-items">
                  {items.map(item => item.product && (
                    <div key={item._id} className="review-item">
                      <img src={item.product.images?.[0]} alt={item.product.name} />
                      <div>
                        <p className="review-item-name">{item.product.name}</p>
                        <p className="review-item-meta">{item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`} · Qty: {item.quantity}</p>
                      </div>
                      <span className="review-item-price">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="checkout-nav-btns">
                  <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-accent btn-lg" onClick={placeOrder} disabled={placing}>
                    {placing ? <><span className="spinner" /> Placing Order...</> : `Place Order · ₹${total.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="checkout-summary">
            <h3>Order Summary</h3>
            <div className="checkout-items-list">
              {items.map(item => item.product && (
                <div key={item._id} className="checkout-item">
                  <div className="checkout-item-img-wrap">
                    <img src={item.product.images?.[0]} alt={item.product.name} />
                    <span className="checkout-item-qty">{item.quantity}</span>
                  </div>
                  <div className="checkout-item-info">
                    <p>{item.product.name}</p>
                    {item.size && <span>Size: {item.size}</span>}
                  </div>
                  <span className="checkout-item-price">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="checkout-totals">
              <div className="checkout-total-row"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
              <div className="checkout-total-row"><span>Shipping</span><span className={shipping===0?'free':''}>{shipping===0?'FREE':'₹'+shipping}</span></div>
              <div className="checkout-total-row grand"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

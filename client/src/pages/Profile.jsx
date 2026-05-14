import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Profile.css';

const TABS = ['Profile', 'Security', 'Addresses'];

export default function Profile() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  if (!user) return <div className="container" style={{padding:'80px 24px',textAlign:'center'}}><h2>Please login</h2><Link to="/login" className="btn btn-primary" style={{marginTop:20}}>Login</Link></div>;

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile', profileForm);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwdForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally { setSaving(false); }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="profile-big-avatar">{user.name?.[0]?.toUpperCase()}</div>
              <p className="profile-sidebar-name">{user.name}</p>
              <p className="profile-sidebar-email">{user.email}</p>
              {user.role === 'admin' && <span className="admin-badge">Admin</span>}
            </div>
            <nav className="profile-nav">
              {TABS.map(tab => (
                <button key={tab} className={'profile-nav-item' + (activeTab === tab ? ' active' : '')} onClick={() => setActiveTab(tab)}>{tab}</button>
              ))}
              <Link to="/orders" className="profile-nav-item">My Orders</Link>
              {user.role === 'admin' && <Link to="/admin" className="profile-nav-item admin">Admin Panel</Link>}
            </nav>
          </aside>

          {/* Main */}
          <main className="profile-main">
            {activeTab === 'Profile' && (
              <div className="profile-section fade-up">
                <h2>Personal Information</h2>
                <form onSubmit={saveProfile} className="profile-form">
                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label">Full Name</label>
                      <input className="input" value={profileForm.name} onChange={e => setProfileForm(f => ({...f, name: e.target.value}))} placeholder="Your name" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Phone Number</label>
                      <input className="input" value={profileForm.phone} onChange={e => setProfileForm(f => ({...f, phone: e.target.value}))} placeholder="10-digit number" maxLength={10} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input className="input" value={user.email} disabled style={{opacity:0.6,cursor:'not-allowed'}} />
                    <span className="input-hint">Email cannot be changed</span>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Account Type</label>
                    <input className="input" value={user.role === 'admin' ? 'Administrator' : 'Customer'} disabled style={{opacity:0.6,cursor:'not-allowed'}} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="profile-section fade-up">
                <h2>Change Password</h2>
                <form onSubmit={changePassword} className="profile-form">
                  <div className="input-group">
                    <label className="input-label">Current Password</label>
                    <input type="password" className="input" value={pwdForm.currentPassword} onChange={e => setPwdForm(f => ({...f, currentPassword: e.target.value}))} placeholder="Enter current password" required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">New Password</label>
                    <input type="password" className="input" value={pwdForm.newPassword} onChange={e => setPwdForm(f => ({...f, newPassword: e.target.value}))} placeholder="Min. 6 characters" required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Confirm New Password</label>
                    <input type="password" className="input" value={pwdForm.confirmPassword} onChange={e => setPwdForm(f => ({...f, confirmPassword: e.target.value}))} placeholder="Repeat new password" required />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner" /> Updating...</> : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'Addresses' && (
              <div className="profile-section fade-up">
                <h2>Saved Addresses</h2>
                {user.addresses?.length === 0 || !user.addresses ? (
                  <div className="no-addresses">
                    <div style={{fontSize:40,marginBottom:16}}>📍</div>
                    <p>No saved addresses yet.</p>
                    <p className="sub">Your shipping addresses from orders will appear here.</p>
                  </div>
                ) : (
                  <div className="addresses-list">
                    {user.addresses?.map((addr, i) => (
                      <div key={i} className={'address-card' + (addr.isDefault ? ' default' : '')}>
                        {addr.isDefault && <span className="default-tag">Default</span>}
                        <p><strong>{addr.label || 'Home'}</strong></p>
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} — {addr.pincode}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

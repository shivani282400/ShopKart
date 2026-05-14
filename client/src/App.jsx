import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}><div className="spinner spinner-dark" style={{width:36,height:36}}/></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Admin — full page, no navbar/footer */}
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

        {/* Auth — full page layout */}
        <Route path="/login" element={<AuthPageWrapper><Auth mode="login" /></AuthPageWrapper>} />
        <Route path="/register" element={<AuthPageWrapper><Auth mode="register" /></AuthPageWrapper>} />

        {/* Main site with navbar/footer */}
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </>
  );
}

function AuthPageWrapper({ children }) {
  return <>{children}</>;
}

function MainLayout() {
  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <Navbar />
      <main style={{flex:1}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div style={{textAlign:'center',padding:'100px 24px'}}>
      <div style={{fontSize:72,marginBottom:24}}>🔍</div>
      <h1 style={{fontFamily:'var(--font-display)',fontSize:48,marginBottom:12}}>404</h1>
      <p style={{color:'var(--warm-gray)',fontSize:16,marginBottom:28}}>Page not found. It may have moved or doesn't exist.</p>
      <a href="/" className="btn btn-accent btn-lg">Back to Home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: 'var(--font-body)', fontSize: 14, borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
              success: { iconTheme: { primary: '#10B981', secondary: 'white' } },
              error: { iconTheme: { primary: '#EF4444', secondary: 'white' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

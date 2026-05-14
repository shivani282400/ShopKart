import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchCart();
    else setCart({ items: [] });
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data.cart);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not load your cart');
    }
  };

  const addToCart = async (productId, quantity = 1, size = '', color = '') => {
    if (!user) { toast.error('Please login to add items to cart'); return; }
    setLoading(true);
    try {
      const res = await api.post('/cart/add', { productId, quantity, size, color });
      setCart(res.data.cart);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    } finally { setLoading(false); }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/item/${itemId}`, { quantity });
      setCart(res.data.cart);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await api.delete(`/cart/item/${itemId}`);
      setCart(res.data.cart);
      toast.success('Item removed');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCart({ items: [] });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not clear cart');
    }
  };

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart.items?.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeItem, clearCart, cartCount, cartTotal, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price images stock slug');
    res.json({ cart: cart || { items: [] } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    if (!productId || quantity < 1) return res.status(400).json({ error: 'Valid product and quantity are required' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Insufficient stock' });
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });
    const existingIndex = cart.items.findIndex(item => item.product.toString() === productId && item.size === size && item.color === color);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = Math.min(cart.items[existingIndex].quantity + quantity, product.stock);
    } else {
      cart.items.push({ product: productId, quantity, size, color });
    }
    await cart.save();
    await cart.populate('items.product', 'name price images stock slug');
    res.json({ cart, message: 'Added to cart!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!Number.isFinite(Number(quantity))) return res.status(400).json({ error: 'Valid quantity is required' });
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (quantity <= 0) { item.remove(); } else { item.quantity = quantity; }
    await cart.save();
    await cart.populate('items.product', 'name price images stock slug');
    res.json({ cart, message: 'Cart updated!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();
    await cart.populate('items.product', 'name price images stock slug');
    res.json({ cart, message: 'Item removed!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ message: 'Cart cleared!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

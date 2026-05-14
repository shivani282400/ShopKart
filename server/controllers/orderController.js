const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, notes } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must include at least one item' });
    }
    if (!shippingAddress?.name || !shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.phone) {
      return res.status(400).json({ error: 'Complete shipping address is required' });
    }
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      if (!item.product || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
        return res.status(400).json({ error: 'Each order item needs a valid product and quantity' });
      }
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ error: `Product not found: ${item.product}` });
      if (product.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      orderItems.push({ product: product._id, name: product.name, image: product.images[0] || '', price: product.price, quantity: item.quantity, size: item.size, color: item.color });
      subtotal += product.price * item.quantity;
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }
    const shippingCost = subtotal >= 999 ? 0 : 99;
    const total = subtotal + shippingCost;
    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const order = await Order.create({ user: req.user._id, items: orderItems, shippingAddress, paymentMethod, subtotal, shippingCost, total, couponCode, notes, estimatedDelivery });
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    await order.populate('user', 'name email');
    res.status(201).json({ order, message: 'Order placed successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('items.product', 'name images slug');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { orderStatus: status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    if (!orderStatus && !paymentStatus) {
      return res.status(400).json({ error: 'Provide orderStatus or paymentStatus to update' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus, paymentStatus }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order, message: 'Order updated!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

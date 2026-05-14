const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar').sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    if (!productId || !rating || !title?.trim() || !comment?.trim()) {
      return res.status(400).json({ error: 'Product, rating, title, and comment are required' });
    }
    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return res.status(400).json({ error: 'You already reviewed this product' });
    const hasPurchased = await Order.findOne({ user: req.user._id, 'items.product': productId, orderStatus: 'delivered' });
    const review = await Review.create({ product: productId, user: req.user._id, rating, title, comment, isVerifiedPurchase: !!hasPurchased });
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { 'ratings.average': Math.round(avgRating * 10) / 10, 'ratings.count': reviews.length });
    await review.populate('user', 'name avatar');
    res.status(201).json({ review, message: 'Review submitted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    await review.deleteOne();
    res.json({ message: 'Review deleted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

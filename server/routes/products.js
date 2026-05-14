const express = require('express');
const { body } = require('express-validator');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeatured } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/:slug', getProduct);
router.post('/', protect, adminOnly, [
  body('name').notEmpty().withMessage('Name required'),
  body('price').isNumeric().withMessage('Valid price required'),
  body('category').notEmpty().withMessage('Category required')
], createProduct);
router.put('/:id', protect, adminOnly, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('price').optional().isNumeric().withMessage('Valid price required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be zero or greater')
], updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;

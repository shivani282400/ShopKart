const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

const categories = [
  { name: "Men's Fashion", slug: 'mens-fashion', description: 'Trendy clothing for men', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', sortOrder: 1 },
  { name: "Women's Fashion", slug: 'womens-fashion', description: 'Stylish clothing for women', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', sortOrder: 2 },
  { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and devices', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', sortOrder: 3 },
  { name: 'Home & Living', slug: 'home-living', description: 'Beautiful home decor', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', sortOrder: 4 },
  { name: 'Sports & Fitness', slug: 'sports-fitness', description: 'Equipment for active lifestyle', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', sortOrder: 5 },
  { name: 'Books', slug: 'books', description: 'Explore knowledge', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', sortOrder: 6 },
];

const getProducts = (categoryMap) => [
  { name: 'Premium Slim Fit Chinos', slug: 'premium-slim-fit-chinos', description: 'Classic slim-fit chinos made from 98% cotton for maximum comfort. Perfect for casual and semi-formal occasions.', shortDescription: 'Perfect slim-fit chinos for everyday wear', price: 1299, originalPrice: 1999, discount: 35, images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600', 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600'], category: categoryMap['mens-fashion'], brand: 'StyleCraft', stock: 45, isFeatured: true, tags: ['chinos', 'men', 'casual'], sizes: ['28', '30', '32', '34', '36'], colors: ['Beige', 'Navy', 'Olive'], ratings: { average: 4.5, count: 128 } },
  { name: 'Floral Wrap Dress', slug: 'floral-wrap-dress', description: 'Beautiful floral wrap dress perfect for summer outings. Made from lightweight viscose fabric with adjustable tie waist.', shortDescription: 'Elegant floral wrap dress for summer', price: 1599, originalPrice: 2499, discount: 36, images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600'], category: categoryMap['womens-fashion'], brand: 'BloomWear', stock: 32, isFeatured: true, tags: ['dress', 'women', 'floral', 'summer'], sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Blue Floral', 'Pink Floral', 'Yellow'], ratings: { average: 4.7, count: 89 } },
  { name: 'Wireless Noise Cancelling Headphones', slug: 'wireless-noise-cancelling-headphones', description: 'Industry-leading noise cancellation with up to 30 hours battery life. Premium sound quality with deep bass and crystal clear highs.', shortDescription: 'Pro-grade wireless headphones with ANC', price: 8999, originalPrice: 14999, discount: 40, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600'], category: categoryMap['electronics'], brand: 'SoundElite', stock: 18, isFeatured: true, tags: ['headphones', 'wireless', 'noise-cancelling'], colors: ['Midnight Black', 'Pearl White', 'Space Grey'], specifications: [{ key: 'Battery Life', value: '30 hours' }, { key: 'Connectivity', value: 'Bluetooth 5.0' }, { key: 'Driver Size', value: '40mm' }], ratings: { average: 4.8, count: 342 } },
  { name: 'Minimalist Wall Clock', slug: 'minimalist-wall-clock', description: 'Scandinavian-style minimalist wall clock with silent quartz movement. Adds a touch of elegance to any room.', shortDescription: 'Silent Scandinavian-style wall clock', price: 1299, originalPrice: 1799, discount: 28, images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600'], category: categoryMap['home-living'], brand: 'NordHome', stock: 60, isFeatured: true, tags: ['clock', 'decor', 'minimalist'], colors: ['White', 'Black', 'Gold'], specifications: [{ key: 'Movement', value: 'Silent Quartz' }, { key: 'Diameter', value: '30cm' }], ratings: { average: 4.4, count: 67 } },
  { name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', description: 'Eco-friendly non-slip yoga mat with alignment lines. 6mm thickness for joint protection. Comes with carrying strap.', shortDescription: 'Eco-friendly non-slip premium yoga mat', price: 1499, originalPrice: 2199, discount: 32, images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600'], category: categoryMap['sports-fitness'], brand: 'ZenFit', stock: 75, isFeatured: true, tags: ['yoga', 'fitness', 'mat'], colors: ['Purple', 'Teal', 'Coral', 'Black'], ratings: { average: 4.6, count: 203 } },
  { name: 'Oxford Cotton Shirt', slug: 'oxford-cotton-shirt', description: 'Classic Oxford shirt in 100% pure cotton. Versatile enough for office or casual settings. Available in multiple colours.', shortDescription: 'Versatile 100% cotton Oxford shirt', price: 999, originalPrice: 1599, discount: 38, images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'], category: categoryMap['mens-fashion'], brand: 'StyleCraft', stock: 90, tags: ['shirt', 'men', 'cotton', 'oxford'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['White', 'Light Blue', 'Pink', 'Grey'], ratings: { average: 4.3, count: 156 } },
  { name: 'High-Rise Skinny Jeans', slug: 'high-rise-skinny-jeans', description: 'Flattering high-rise skinny jeans with 4-way stretch fabric. Comfortable all-day wear with contour fit technology.', shortDescription: 'Flattering high-rise skinny jeans', price: 1799, originalPrice: 2799, discount: 36, images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600'], category: categoryMap['womens-fashion'], brand: 'DenimDiva', stock: 55, tags: ['jeans', 'women', 'denim', 'skinny'], sizes: ['26', '28', '30', '32', '34'], colors: ['Dark Wash', 'Black', 'Light Wash'], ratings: { average: 4.5, count: 234 } },
  { name: 'Smart Watch Series 5', slug: 'smart-watch-series-5', description: 'Advanced smartwatch with health monitoring, GPS, and 7-day battery life. Water resistant up to 50m. Compatible with Android and iOS.', shortDescription: 'Feature-packed smartwatch with health tracking', price: 12999, originalPrice: 18999, discount: 32, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'], category: categoryMap['electronics'], brand: 'TechPulse', stock: 22, isFeatured: true, tags: ['smartwatch', 'wearable', 'fitness'], colors: ['Black', 'Silver', 'Rose Gold'], specifications: [{ key: 'Battery', value: '7 days' }, { key: 'Water Resistance', value: '50m' }, { key: 'Display', value: 'AMOLED 1.4"' }], ratings: { average: 4.6, count: 178 } },
  { name: 'Aesthetic Desk Lamp', slug: 'aesthetic-desk-lamp', description: 'Touch-sensitive LED desk lamp with 3 colour temperatures and 5 brightness levels. USB charging port included. Eye-care technology.', shortDescription: 'Touch LED desk lamp with USB charging', price: 1899, originalPrice: 2799, discount: 32, images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'], category: categoryMap['home-living'], brand: 'LumiSpace', stock: 40, tags: ['lamp', 'desk', 'LED', 'home-office'], colors: ['White', 'Black'], specifications: [{ key: 'Power', value: '10W LED' }, { key: 'Colour Temp', value: '3 modes' }], ratings: { average: 4.4, count: 92 } },
  { name: 'Running Shoes Pro', slug: 'running-shoes-pro', description: 'Lightweight running shoes with advanced cushioning technology. Breathable mesh upper and anti-slip rubber outsole. Perfect for long runs.', shortDescription: 'Cushioned lightweight running shoes', price: 3499, originalPrice: 5499, discount: 36, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'], category: categoryMap['sports-fitness'], brand: 'SpeedForce', stock: 38, isFeatured: true, tags: ['shoes', 'running', 'sports'], sizes: ['6', '7', '8', '9', '10', '11', '12'], colors: ['Black/Red', 'Blue/White', 'Grey/Yellow'], ratings: { average: 4.7, count: 421 } },
  { name: 'Atomic Habits - James Clear', slug: 'atomic-habits-james-clear', description: 'The #1 New York Times bestseller. Tiny changes, remarkable results. Learn how to build good habits and break bad ones.', shortDescription: 'Build good habits, break bad ones', price: 399, originalPrice: 799, discount: 50, images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600'], category: categoryMap['books'], brand: 'Penguin', stock: 200, tags: ['book', 'self-help', 'habits', 'bestseller'], ratings: { average: 4.9, count: 892 } },
  { name: 'Leather Crossbody Bag', slug: 'leather-crossbody-bag', description: 'Genuine leather crossbody bag with adjustable strap. Multiple compartments for organization. Timeless design that pairs with any outfit.', shortDescription: 'Genuine leather crossbody bag', price: 2499, originalPrice: 3999, discount: 38, images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600'], category: categoryMap['womens-fashion'], brand: 'LeatherLux', stock: 25, isFeatured: true, tags: ['bag', 'leather', 'women', 'crossbody'], colors: ['Tan', 'Black', 'Burgundy'], ratings: { average: 4.6, count: 145 } },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach(cat => { categoryMap[cat.slug] = cat._id; });
    console.log(`✅ ${createdCategories.length} categories seeded`);

    const products = getProducts(categoryMap).map((p, i) => ({ ...p, sku: `SKU-${String(i + 1).padStart(4, '0')}` }));
    await Product.insertMany(products);
    console.log(`✅ ${products.length} products seeded`);

    await User.create({ name: 'Admin User', email: 'admin@shopkart.com', password: 'admin123', role: 'admin' });
    await User.create({ name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'user' });
    console.log('✅ Users seeded (admin@shopkart.com / admin123)');

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();

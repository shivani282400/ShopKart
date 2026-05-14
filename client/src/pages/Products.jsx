import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import api from '../utils/api';
import './Products.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice });

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    if (page > 1) params.set('page', page);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    api.get('/products?' + params.toString())
      .then(res => {
        setProducts(res.data.products);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
        setPages(1);
        setError('Products could not be loaded. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [category, search, sort, page, minPrice, maxPrice]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const applyPriceFilter = () => {
    const p = new URLSearchParams(searchParams);
    if (priceRange.min) p.set('minPrice', priceRange.min); else p.delete('minPrice');
    if (priceRange.max) p.set('maxPrice', priceRange.max); else p.delete('maxPrice');
    p.delete('page');
    setSearchParams(p);
    setSidebarOpen(false);
  };

  const clearAll = () => {
    setSearchParams({});
    setPriceRange({ min: '', max: '' });
  };

  const hasFilters = category || search || minPrice || maxPrice;

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="products-header">
          <div>
            <h1 className="products-title">
              {search ? `Results for "${search}"` : category ? categories.find(c => c.slug === category)?.name || 'Products' : 'All Products'}
            </h1>
            <p className="products-count">{loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}</p>
          </div>
          <div className="products-controls">
            {hasFilters && <button className="btn btn-ghost btn-sm" onClick={clearAll}>Clear All</button>}
            <button className="btn btn-outline btn-sm filter-toggle" onClick={() => setSidebarOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters
            </button>
            <select className="sort-select" value={sort} onChange={e => setParam('sort', e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="products-layout">
          {/* Sidebar */}
          <aside className={'products-sidebar' + (sidebarOpen ? ' open' : '')}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
            </div>

            <div className="filter-group">
              <h4 className="filter-title">Categories</h4>
              <div className="filter-options">
                <label className={'filter-option' + (!category ? ' checked' : '')}>
                  <input type="radio" name="cat" checked={!category} onChange={() => setParam('category', '')} /> All Categories
                </label>
                {categories.map(cat => (
                  <label key={cat._id} className={'filter-option' + (category === cat.slug ? ' checked' : '')}>
                    <input type="radio" name="cat" checked={category === cat.slug} onChange={() => setParam('category', cat.slug)} /> {cat.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4 className="filter-title">Price Range</h4>
              <div className="price-inputs">
                <input type="number" placeholder="Min ₹" value={priceRange.min} onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))} className="input" />
                <span>—</span>
                <input type="number" placeholder="Max ₹" value={priceRange.max} onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))} className="input" />
              </div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12, width: '100%' }} onClick={applyPriceFilter}>Apply</button>
            </div>

            <div className="filter-group">
              <h4 className="filter-title">Sort By</h4>
              {SORT_OPTIONS.map(o => (
                <label key={o.value} className={'filter-option' + (sort === o.value ? ' checked' : '')}>
                  <input type="radio" name="sort" checked={sort === o.value} onChange={() => setParam('sort', o.value)} /> {o.label}
                </label>
              ))}
            </div>
          </aside>

          {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

          {/* Products */}
          <div className="products-main">
            {loading ? (
              <div className="products-grid">
                {Array(12).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 380 }} />)}
              </div>
            ) : error ? (
              <div className="empty-state">
                <div className="empty-icon">!</div>
                <h3>Unable to load products</h3>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="btn btn-primary" onClick={clearAll}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((product, i) => (
                    <div key={product._id} style={{ animationDelay: `${i * 0.05}s` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {pages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" disabled={page <= 1} onClick={() => setParam('page', page - 1)}>← Prev</button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button key={p} className={'page-btn' + (p === page ? ' active' : '')} onClick={() => setParam('page', p)}>{p}</button>
                    ))}
                    <button className="page-btn" disabled={page >= pages} onClick={() => setParam('page', page + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

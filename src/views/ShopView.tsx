import React, { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Tag, Copy, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ResilientImage } from '../components/ResilientImage';

interface ShopViewProps {
  mode: 'all' | 'categories' | 'category-detail' | 'new-arrivals' | 'best-sellers' | 'offers';
  categorySlug?: string;
  navigate: (path: string) => void;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function deriveCategoryLabel(product: Product): string {
  const raw = (product.category || '').trim();
  if (raw && !/resin|jewellery|jewelry/i.test(raw)) {
    return raw;
  }
  const combined = `${product.name} ${(product.tags || []).join(' ')}`.toLowerCase();
  if (combined.includes('scrunchie') || combined.includes('bun') || combined.includes('hair')) {
    return 'Handmade Hair Accessories';
  }
  if (combined.includes('keychain') || combined.includes('keyring')) {
    return 'Handmade Keychains';
  }
  if (combined.includes('bangle') || combined.includes('bracelet')) {
    return 'Handmade Bangles & Wristwear';
  }
  if (combined.includes('crochet') || combined.includes('flower')) {
    return 'Crochet & Floral Accessories';
  }
  return raw || 'Handmade Accessories';
}

export const ShopView: React.FC<ShopViewProps> = ({ mode, categorySlug, navigate }) => {
  const { products, coupons, showToast } = useStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const publishedProducts = useMemo(
    () => products.filter((p) => p.status === 'published'),
    [products]
  );

  // Dynamic product-based category cards generated strictly from existing published products
  const dynamicProductCards = useMemo(
    () =>
      publishedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug || toSlug(product.name),
        image: product.images?.[0] || '',
        categoryLabel: deriveCategoryLabel(product),
        shortDescription: product.shortDescription || product.description,
        salePrice: product.salePrice,
        product,
      })),
    [publishedProducts]
  );

  // Unique derived category labels from actual existing products
  const derivedCategoryGroups = useMemo(() => {
    const set = new Set<string>();
    dynamicProductCards.forEach((item) => {
      if (item.categoryLabel) set.add(item.categoryLabel);
    });
    return Array.from(set);
  }, [dynamicProductCards]);

  // Reset local filter when route mode or categorySlug changes
  useEffect(() => {
    if (mode === 'category-detail' && categorySlug) {
      const matchedProduct = dynamicProductCards.find(
        (c) => c.slug === categorySlug || c.id === categorySlug
      );
      if (matchedProduct) {
        setSelectedFilter(`product:${matchedProduct.id}`);
        return;
      }
      const matchedGroup = derivedCategoryGroups.find((g) => toSlug(g) === categorySlug);
      if (matchedGroup) {
        setSelectedFilter(`group:${matchedGroup}`);
        return;
      }
    }
    setSelectedFilter('All');
  }, [mode, categorySlug, dynamicProductCards, derivedCategoryGroups]);

  const activeCategoryHeading = useMemo(() => {
    if (selectedFilter.startsWith('product:')) {
      const prodId = selectedFilter.replace('product:', '');
      const found = dynamicProductCards.find((c) => c.id === prodId);
      if (found) return found;
    }
    if (mode === 'category-detail' && categorySlug) {
      const found = dynamicProductCards.find(
        (c) => c.slug === categorySlug || c.id === categorySlug
      );
      if (found) return found;
    }
    return null;
  }, [selectedFilter, mode, categorySlug, dynamicProductCards]);

  const filteredProducts = useMemo(() => {
    let list = [...publishedProducts];

    if (mode === 'new-arrivals') {
      list = list.filter((p) => p.newArrival);
    } else if (mode === 'best-sellers') {
      const best = list.filter((p) => p.bestSeller);
      if (best.length > 0) list = best;
    } else if (mode === 'offers') {
      const discounted = list.filter((p) => p.discountPercent > 0);
      if (discounted.length > 0) list = discounted;
    }

    if (selectedFilter.startsWith('product:')) {
      const prodId = selectedFilter.replace('product:', '');
      list = list.filter((p) => p.id === prodId);
    } else if (selectedFilter.startsWith('group:')) {
      const groupName = selectedFilter.replace('group:', '');
      list = list.filter((p) => deriveCategoryLabel(p) === groupName);
    } else if (mode === 'category-detail' && categorySlug) {
      const bySlug = list.filter(
        (p) =>
          p.slug === categorySlug ||
          p.id === categorySlug ||
          toSlug(deriveCategoryLabel(p)) === categorySlug ||
          (p.tags || []).some((t) => toSlug(t) === categorySlug)
      );
      if (bySlug.length > 0) {
        list = bySlug;
      }
    }

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          deriveCategoryLabel(p).toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    list = list.filter((p) => p.salePrice <= maxPrice);
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    const sorted = [...list];
    if (sortBy === 'price-asc') sorted.sort((a, b) => a.salePrice - b.salePrice);
    else if (sortBy === 'price-desc') sorted.sort((a, b) => b.salePrice - a.salePrice);
    else if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    else sorted.sort((a, b) => Number(b.featured) - Number(a.featured));

    return sorted;
  }, [publishedProducts, mode, categorySlug, selectedFilter, searchTerm, maxPrice, inStockOnly, sortBy]);

  if (mode === 'categories') {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">Explore Collections</p>
          <h1 className="font-serif-display text-3xl sm:text-5xl text-[#2C221E]">
            Shop by Category
          </h1>
          <p className="text-xs sm:text-sm text-[#5A4A42]">
            Every piece is thoughtfully handcrafted in small batches with soft yarn, floral details,
            and artisan care.
          </p>
        </div>

        {dynamicProductCards.length === 0 ? (
          <div className="bg-white border border-[#E5D9D0] rounded-xl p-10 text-center space-y-3">
            <p className="font-serif-display text-2xl text-[#2C221E]">
              New handmade creations coming soon
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-5 py-2 bg-[#737765] text-white text-xs font-medium rounded-md"
            >
              Visit Shop
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {dynamicProductCards.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/category/${item.slug}`)}
                className="group cursor-pointer bg-white border border-[#E5D9D0] rounded-xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div className="aspect-square sm:aspect-[4/3] bg-[#F4EFEA] overflow-hidden">
                  <ResilientImage
                    src={item.image}
                    alt={`${item.name} — ${item.categoryLabel} by Mikkimama`}
                    width={600}
                    height={450}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1">
                    <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-[#737765] font-medium truncate">
                      {item.categoryLabel}
                    </span>
                    <h2 className="font-serif-display text-base sm:text-xl font-semibold text-[#2C221E] group-hover:text-[#9E584D] transition-colors line-clamp-2 leading-snug">
                      {item.name}
                    </h2>
                    <p className="hidden sm:block text-xs text-[#5A4A42] line-clamp-2 leading-relaxed pt-0.5">
                      {item.shortDescription}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#F0E6DE] flex items-center justify-between gap-2">
                    <span className="font-mono-tabular text-xs sm:text-sm font-semibold text-[#2C221E]">
                      ₹{item.salePrice}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#737765] group-hover:text-[#2C221E]">
                      Explore →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const pageHeading =
    mode === 'new-arrivals'
      ? 'New Arrivals'
      : mode === 'best-sellers'
      ? 'Most Loved Best Sellers'
      : mode === 'offers'
      ? 'Special Offers & Seasonal Sale'
      : activeCategoryHeading
      ? activeCategoryHeading.name
      : 'The Handmade Collection';

  const pageSubtext =
    mode === 'new-arrivals'
      ? 'Fresh from our studio—small-batch handmade pieces crafted this season.'
      : mode === 'best-sellers'
      ? 'Our community’s most-gifted and highest-rated handmade treasures.'
      : mode === 'offers'
      ? 'Enjoy special savings on handcrafted pieces plus exclusive studio coupon codes.'
      : activeCategoryHeading
      ? activeCategoryHeading.shortDescription
      : 'Thoughtfully handcrafted crochet creations, floral hair accessories, and artisan keepsakes made with love.';

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10">
      {/* Page Header */}
      <div className="bg-[#F4EFEA] border border-[#E5D9D0] rounded-xl p-5 sm:p-10 text-center space-y-2.5 sm:space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">
          Mikkimama · Handmade With Love
        </p>
        <h1 className="font-serif-display text-2xl sm:text-4xl lg:text-5xl text-[#2C221E] leading-tight max-w-3xl mx-auto">
          {pageHeading}
        </h1>
        <p className="text-xs sm:text-sm text-[#5A4A42] max-w-2xl mx-auto leading-relaxed">
          {pageSubtext}
        </p>
        {mode === 'category-detail' && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737765] hover:text-[#2C221E] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>View All Handmade Products</span>
            </button>
          </div>
        )}
      </div>

      {/* Product-Based Dynamic Categories Section */}
      {dynamicProductCards.length > 0 && (
        <section aria-label="Categories" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#737765] font-medium">
                Categories
              </p>
              <h2 className="font-serif-display text-xl sm:text-2xl text-[#2C221E]">
                Shop by Handmade Piece
              </h2>
            </div>
            {selectedFilter !== 'All' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFilter('All');
                  if (mode === 'category-detail') navigate('/shop');
                }}
                className="text-xs font-semibold text-[#737765] hover:text-[#2C221E] underline underline-offset-4 shrink-0"
              >
                Show All ({publishedProducts.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {dynamicProductCards.map((item) => {
              const isSelected = selectedFilter === `product:${item.id}`;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedFilter('All');
                      if (mode === 'category-detail') navigate('/shop');
                    } else {
                      setSelectedFilter(`product:${item.id}`);
                    }
                  }}
                  className={`group cursor-pointer rounded-xl overflow-hidden border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#F4EFEA] border-[#737765] ring-1 ring-[#737765] shadow-xs'
                      : 'bg-white border-[#E8DDD4] hover:border-[#C9B8AC] hover:shadow-xs'
                  }`}
                >
                  <div className="aspect-[4/3] bg-[#F4EFEA] overflow-hidden">
                    <ResilientImage
                      src={item.image}
                      alt={`${item.name} — ${item.categoryLabel} by Mikkimama`}
                      width={500}
                      height={375}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-[#737765] font-medium truncate">
                        {item.categoryLabel}
                      </span>
                      <h3 className="font-serif-display text-sm sm:text-base font-semibold text-[#2C221E] group-hover:text-[#9E584D] transition-colors line-clamp-2 leading-snug mt-0.5">
                        {item.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#F0E6DE] text-[11px]">
                      <span className="font-mono-tabular font-semibold text-[#2C221E]">
                        ₹{item.salePrice}
                      </span>
                      <span className="font-medium text-[#737765] group-hover:text-[#2C221E]">
                        {isSelected ? 'Selected ✓' : 'View →'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Active Coupons Strip on Offers Page */}
      {mode === 'offers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons
            .filter((c) => c.active)
            .map((coup) => (
              <div
                key={coup.id}
                className="bg-white border border-dashed border-[#B6766C] rounded-lg p-5 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9E584D]">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="font-mono-tabular">{coup.code}</span>
                  </div>
                  <p className="text-xs text-[#2C221E] font-medium">{coup.description}</p>
                  <p className="text-[11px] text-[#7D6B61] font-mono-tabular">
                    Min. Order: ₹{coup.minOrderAmount}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(coup.code);
                    showToast('Coupon Copied', `Copied ${coup.code} to clipboard!`);
                  }}
                  className="px-3 py-1.5 bg-[#F4EFEA] hover:bg-[#E5D9D0] text-[#2C221E] text-xs font-medium rounded flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Filter & Sort Controls */}
      <div className="bg-white border border-[#E8DDD4] rounded-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Dynamic Product-Based Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => {
                setSelectedFilter('All');
                if (mode === 'category-detail') navigate('/shop');
              }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedFilter === 'All'
                  ? 'bg-[#737765] text-white'
                  : 'bg-[#F4EFEA] text-[#5A4A42] hover:text-[#2C221E]'
              }`}
            >
              All ({publishedProducts.length})
            </button>

            {derivedCategoryGroups.map((groupName) => {
              const key = `group:${groupName}`;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedFilter(key)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    selectedFilter === key
                      ? 'bg-[#737765] text-white'
                      : 'bg-[#F4EFEA] text-[#5A4A42] hover:text-[#2C221E]'
                  }`}
                >
                  {groupName}
                </button>
              );
            })}
          </div>

          {/* Search & Sort Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by keyword..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#FAF7F2] border border-[#DECFC4] rounded-md text-xs text-[#2C221E] focus:outline-none focus:border-[#737765]"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort products"
              className="px-3 py-1.5 bg-[#FAF7F2] border border-[#DECFC4] rounded-md text-xs text-[#2C221E] focus:outline-none"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Secondary Price & Stock Bar */}
        <div className="pt-3 border-t border-[#F0E6DE] flex flex-wrap items-center justify-between gap-4 text-xs text-[#5A4A42]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#737765]" />
              <span>Max Price:</span>
              <span className="font-mono-tabular font-semibold text-[#2C221E]">₹{maxPrice}</span>
              <input
                type="range"
                min={50}
                max={2500}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-28 accent-[#737765]"
              />
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-[#737765]"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          <span className="font-mono-tabular text-[#7D6B61]">
            Showing {filteredProducts.length} handcrafted{' '}
            {filteredProducts.length === 1 ? 'piece' : 'pieces'}
          </span>
        </div>
      </div>

      {/* Products Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-[#E8DDD4] rounded-xl p-12 text-center space-y-4">
          <p className="font-serif-display text-2xl text-[#2C221E]">
            No handmade pieces match your current filter
          </p>
          <p className="text-xs text-[#6E5D55]">
            Try clearing your search keyword or raising the maximum price filter.
          </p>
          <button
            onClick={() => {
              setSelectedFilter('All');
              setSearchTerm('');
              setMaxPrice(2500);
              setInStockOnly(false);
            }}
            className="px-5 py-2 bg-[#737765] text-white text-xs font-medium rounded-md"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
};

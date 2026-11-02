import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Tag, Copy } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ResilientImage } from '../components/ResilientImage';

interface ShopViewProps {
  mode: 'all' | 'categories' | 'category-detail' | 'new-arrivals' | 'best-sellers' | 'offers';
  categorySlug?: string;
  navigate: (path: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ mode, categorySlug, navigate }) => {
  const { products, categories, coupons, showToast } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const activeCategoryObj = useMemo(() => {
    if (mode === 'category-detail' && categorySlug) {
      return categories.find((c) => c.slug === categorySlug) || null;
    }
    return null;
  }, [mode, categorySlug, categories]);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.status === 'published');

    if (mode === 'new-arrivals') {
      list = list.filter((p) => p.newArrival);
    } else if (mode === 'best-sellers') {
      list = list.filter((p) => p.bestSeller);
    } else if (mode === 'offers') {
      list = list.filter((p) => p.discountPercent >= 25);
    } else if (mode === 'category-detail' && activeCategoryObj) {
      list = list.filter((p) => p.category === activeCategoryObj.name);
    } else if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
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
  }, [products, mode, activeCategoryObj, selectedCategory, searchTerm, maxPrice, inStockOnly, sortBy]);

  if (mode === 'categories') {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">Explore Collections</p>
          <h1 className="font-serif-display text-4xl sm:text-5xl text-[#2C221E]">
            Shop by Category
          </h1>
          <p className="text-sm text-[#5A4A42]">
            Every collection is handcrafted in small batches using preserved real botanicals and
            tarnish-resistant precious metal finishes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/category/${cat.slug}`)}
              className="group cursor-pointer bg-white border border-[#E5D9D0] rounded-xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="aspect-[4/3] bg-[#F4EFEA] overflow-hidden">
                <ResilientImage
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
                    {cat.name}
                  </h2>
                  <span className="font-mono-tabular text-xs text-[#7D6B61]">
                    {cat.productCount} items
                  </span>
                </div>
                <p className="text-xs text-[#5A4A42] leading-relaxed">{cat.description}</p>
                <div className="pt-2">
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#737765] group-hover:text-[#2C221E]">
                    Explore Collection →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
      : mode === 'category-detail' && activeCategoryObj
      ? activeCategoryObj.name
      : 'The Handmade Collection';

  const pageSubtext =
    mode === 'new-arrivals'
      ? 'Fresh from our resin curing table—small-batch botanical pieces crafted this season.'
      : mode === 'best-sellers'
      ? 'Our community’s most-gifted and highest-rated handmade treasures.'
      : mode === 'offers'
      ? 'Enjoy up to 31% OFF handmade pieces plus exclusive atelier coupon codes.'
      : mode === 'category-detail' && activeCategoryObj
      ? activeCategoryObj.description
      : 'Thoughtfully handcrafted botanical jewellery, bracelets, hair accessories, and keepsake gifts.';

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="bg-[#F4EFEA] border border-[#E5D9D0] rounded-xl p-6 sm:p-10 text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">
          Mikkimama · Handmade With Love
        </p>
        <h1 className="font-serif-display text-3xl sm:text-5xl text-[#2C221E]">{pageHeading}</h1>
        <p className="text-sm text-[#5A4A42] max-w-2xl mx-auto">{pageSubtext}</p>
      </div>

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
          {/* Interactive Category Filter Buttons */}
          {mode !== 'category-detail' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', ...categories.map((c) => c.name)].map((catName) => (
                <button
                  key={catName}
                  onClick={() => setSelectedCategory(catName)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === catName
                      ? 'bg-[#737765] text-white'
                      : 'bg-[#F4EFEA] text-[#5A4A42] hover:text-[#2C221E]'
                  }`}
                >
                  {catName}
                </button>
              ))}
            </div>
          )}

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
                min={400}
                max={2500}
                step={100}
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
            Showing {filteredProducts.length} handcrafted pieces
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
              setSelectedCategory('All');
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

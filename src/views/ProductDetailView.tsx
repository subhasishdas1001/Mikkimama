import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Check,
  Heart,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  ZoomIn,
  X,
  Play,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ResilientImage } from '../components/ResilientImage';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailViewProps {
  slug: string;
  navigate: (path: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ slug, navigate }) => {
  const {
    products,
    reviews,
    wishlist,
    toggleWishlist,
    addToCart,
    submitReview,
    currentUser,
    settings,
    openManualOrderModal,
  } = useStore();

  const product = useMemo(
    () => products.find((p) => p.slug === slug || p.id === slug) || products[0],
    [products, slug]
  );

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [showVideoNote, setShowVideoNote] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');

  // Review Form State
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState(currentUser?.displayName || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState('');

  useEffect(() => {
    setSelectedImageIdx(0);
    setSelectedVariant(product?.variants[0] || 'Standard');
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  // Dynamic SEO title & Product JSON-LD
  useEffect(() => {
    if (!product) return;
    const prevTitle = document.title;
    document.title = product.seoTitle || `${product.name} | Mikkimama – Handmade With Love`;
    return () => {
      document.title = prevTitle;
    };
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif-display text-3xl text-[#2C221E]">Product Not Found</h1>
        <button
          onClick={() => navigate('/shop')}
          className="px-5 py-2.5 bg-[#737765] text-white text-xs rounded-md"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const activeVariant = selectedVariant || product.variants[0] || 'Standard';
  const isWishlisted = wishlist.includes(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  const approvedProductReviews = reviews.filter(
    (r) => r.productId === product.id && r.status === 'approved'
  );
  const filteredReviews =
    starFilter === 'all'
      ? approvedProductReviews
      : approvedProductReviews.filter((r) => Math.round(r.rating) === starFilter);

  const relatedProducts = products
    .filter((p) => p.status === 'published' && p.id !== product.id)
    .slice(0, 3);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReviewPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;
    await submitReview({
      productId: product.id,
      productName: product.name,
      customerName: reviewerName,
      rating: reviewRating,
      comment: reviewComment,
      photoUrl: reviewPhotoUrl,
    });
    setReviewerName('');
    setReviewComment('');
    setReviewPhotoUrl('');
    setReviewFormOpen(false);
  };

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Mikkimama',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.salePrice,
      availability: isOutOfStock
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* Breadcrumb Back Navigation */}
      <div className="flex items-center justify-between text-xs text-[#6E5D55]">
        <button
          onClick={() => navigate('/shop')}
          className="inline-flex items-center gap-1.5 hover:text-[#2C221E] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Handmade Collection</span>
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <span>Shop</span>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span className="text-[#2C221E] font-medium">{product.name}</span>
        </div>
      </div>

      {/* Main Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left: Product Image Gallery + Zoom + Video Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] bg-[#F4EFEA] border border-[#E5D9D0] rounded-xl overflow-hidden group">
            <ResilientImage
              src={product.images[selectedImageIdx] || product.images[0]}
              alt={`${product.name} view ${selectedImageIdx + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
              onClick={() => setZoomOpen(true)}
            />
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              aria-label="Zoom product image"
              className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur-xs rounded-md text-xs text-[#2C221E] flex items-center gap-1.5 shadow-xs hover:bg-white"
            >
              <ZoomIn className="w-3.5 h-3.5 text-[#737765]" />
              <span>Zoom View</span>
            </button>
          </div>

          {/* Thumbnail Strip + Artisan Video Preview Button */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {product.images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedImageIdx(idx);
                  setShowVideoNote(false);
                }}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                  selectedImageIdx === idx && !showVideoNote
                    ? 'border-[#737765] shadow-xs'
                    : 'border-[#E5D9D0] opacity-75 hover:opacity-100'
                }`}
              >
                <ResilientImage
                  src={imgUrl}
                  alt={`${product.name} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowVideoNote((prev) => !prev)}
              className={`h-20 px-4 rounded-lg border flex flex-col items-center justify-center gap-1 text-xs shrink-0 transition-colors ${
                showVideoNote
                  ? 'border-[#737765] bg-[#737765] text-white'
                  : 'border-[#E5D9D0] bg-[#F4EFEA] text-[#2C221E] hover:border-[#737765]'
              }`}
            >
              <Play className="w-4 h-4" />
              <span className="text-[11px] font-medium">Craft Process</span>
            </button>
          </div>

          {showVideoNote && (
            <div className="p-4 bg-[#F4EFEA] border border-[#E5D9D0] rounded-lg space-y-2 text-xs text-[#5A4A42]">
              <p className="font-semibold text-[#2C221E]">
                ✦ Studio Crafting Note — {product.name}
              </p>
              <p className="leading-relaxed">
                Each flower in this piece is pressed for 3 weeks between absorbent botanical sheets,
                then hand-set in 3 crystal resin layers to eliminate micro-bubbles and preserve
                natural petal hues for years.
              </p>
              {product.videoUrl && (
                <a
                  href={product.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block underline text-[#737765]"
                >
                  Watch Studio Video →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right: Purchase Module */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            {/* Unboxed Metadata */}
            <div className="flex items-center gap-2 text-xs text-[#7D6B61]">
              <span>{product.category}</span>
              <span>·</span>
              <span className="font-mono-tabular">SKU: {product.sku}</span>
              <span>·</span>
              <span>Handmade in India</span>
            </div>

            <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#2C221E]">
              {product.name}
            </h1>

            {/* Rating & Review Count */}
            <div className="flex items-center gap-2 text-xs pt-1">
              <div className="flex items-center gap-0.5 text-[#C5A059]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating) ? 'fill-[#C5A059]' : 'opacity-30'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono-tabular font-semibold text-[#2C221E]">
                {product.rating.toFixed(1)}
              </span>
              <a
                href="#product-reviews"
                className="text-[#6E5D55] underline underline-offset-4 hover:text-[#2C221E]"
              >
                ({product.reviewCount} verified reviews)
              </a>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="p-4 bg-[#F4EFEA] border border-[#E5D9D0] rounded-lg flex items-baseline justify-between">
            <div className="flex items-baseline gap-3 font-mono-tabular">
              <span className="text-3xl font-semibold text-[#2C221E]">₹{product.salePrice}</span>
              {product.originalPrice > product.salePrice && (
                <>
                  <span className="text-sm text-[#9B8B82] line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-xs font-semibold text-[#9E584D]">
                    {product.discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
            <span className="text-[11px] text-[#6E5D55]">Inclusive of all taxes</span>
          </div>

          {/* Description */}
          <div className="space-y-2 text-sm text-[#5A4A42] leading-relaxed">
            <p className="font-medium text-[#2C221E]">{product.shortDescription}</p>
            <p>{product.description}</p>
          </div>

          {/* Variants Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2C221E]">
                Finish / Option: <span className="font-normal text-[#6E5D55]">{activeVariant}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 text-xs font-medium rounded-md border transition-colors ${
                      activeVariant === variant
                        ? 'border-[#2C221E] bg-[#2C221E] text-white'
                        : 'border-[#D8C7BE] bg-white text-[#2C221E] hover:border-[#737765]'
                    }`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Stock Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2C221E]">
                Quantity
              </span>
              <div className="flex items-center border border-[#D8C7BE] rounded-md bg-white">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 text-sm text-[#2C221E] hover:bg-[#F4EFEA] disabled:opacity-40"
                >
                  −
                </button>
                <span className="px-4 py-1.5 font-mono-tabular text-xs font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
                  className="px-3.5 py-1.5 text-sm text-[#2C221E] hover:bg-[#F4EFEA] disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock Status Indicator */}
            <div className="text-xs font-medium">
              {isOutOfStock ? (
                <span className="text-[#B91C1C]">Out of Stock — Currently Unavailable</span>
              ) : isLowStock ? (
                <span className="text-[#B45309] font-mono-tabular">
                  Low Stock — Only {product.stock} left in studio
                </span>
              ) : (
                <span className="text-[#4D6A46] flex items-center gap-1 font-mono-tabular">
                  <Check className="w-3.5 h-3.5" />
                  In Stock ({product.stock} ready to ship)
                </span>
              )}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => addToCart(product.id, activeVariant, quantity)}
              className="sm:col-span-5 flex items-center justify-center gap-2 py-3.5 px-5 border border-[#737765] bg-white hover:bg-[#F4EFEA] text-[#2C221E] text-xs font-semibold uppercase tracking-wider rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4 text-[#737765]" />
              <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => {
                addToCart(product.id, activeVariant, quantity);
                navigate('/checkout');
              }}
              className="sm:col-span-5 py-3.5 px-5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label="Add to Wishlist"
              className="sm:col-span-2 flex items-center justify-center py-3.5 px-4 border border-[#D8C7BE] bg-white hover:border-[#B6766C] rounded-md transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted ? 'fill-[#B6766C] text-[#B6766C]' : 'text-[#2C221E]'
                }`}
              />
            </button>
          </div>

          {/* Conditional Manual Order / Order on WhatsApp Option */}
          {settings.manualWhatsappOrderEnabled !== false && (
            <div className="pt-1">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => openManualOrderModal(product, activeVariant, quantity)}
                className="w-full py-3.5 px-5 bg-[#EBF5EE] hover:bg-[#DCEFE2] border border-[#B7DFC2] text-[#1F7A3E] text-xs font-semibold uppercase tracking-wider rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  Manual Order / Order on WhatsApp — ₹{product.salePrice * quantity}
                </span>
              </button>
            </div>
          )}

          {/* Boutique Trust & Shipping Guarantees */}
          <div className="pt-4 border-t border-[#E5D9D0] grid grid-cols-2 gap-4 text-xs text-[#5A4A42]">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#737765] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#2C221E]">100% Handmade Piece</p>
                <p className="text-[11px] text-[#7D6B61]">Real pressed flowers & hypoallergenic metal</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#737765] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#2C221E]">Secure Checkout</p>
                <p className="text-[11px] text-[#7D6B61]">UPI, Cards, Net Banking & Cash on Delivery</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#737765] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#2C221E]">Insured Boutique Delivery</p>
                <p className="text-[11px] text-[#7D6B61]">
                  Free shipping above ₹{settings.freeShippingThreshold} (2–4 days)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#737765] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#2C221E]">Easy 7-Day Returns</p>
                <p className="text-[11px] text-[#7D6B61]">Hassle-free replacement or refund</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 9. CUSTOMER REVIEWS SECTION */}
      <section
        id="product-reviews"
        className="pt-12 border-t border-[#E5D9D0] space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">Customer Feedback</p>
            <h2 className="font-serif-display text-3xl text-[#2C221E] mt-1">
              Customer Reviews ({approvedProductReviews.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setReviewFormOpen((prev) => !prev)}
            className="px-5 py-2.5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium rounded-md transition-colors self-start sm:self-auto"
          >
            {reviewFormOpen ? 'Close Review Form' : 'Write a Review'}
          </button>
        </div>

        {/* Interactive Star Filtering Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 5, 4, 3, 2, 1] as const).map((starVal) => (
            <button
              key={String(starVal)}
              type="button"
              onClick={() => setStarFilter(starVal)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                starFilter === starVal
                  ? 'bg-[#2C221E] text-white'
                  : 'bg-white border border-[#E5D9D0] text-[#5A4A42] hover:border-[#2C221E]'
              }`}
            >
              {starVal === 'all' ? 'All Reviews' : `${starVal} ★`}
            </button>
          ))}
        </div>

        {/* Write a Review Form */}
        {reviewFormOpen && (
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white border border-[#E5D9D0] rounded-xl p-6 max-w-2xl space-y-4"
          >
            <h3 className="font-serif-display text-2xl text-[#2C221E]">
              Share Your Experience with {product.name}
            </h3>
            <p className="text-xs text-[#6E5D55]">
              All reviews go through our studio moderation queue to ensure authentic feedback.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#2C221E] mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g., Aditi Rao"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2C221E] mb-1">
                  Star Rating (1–5) *
                </label>
                <div className="flex items-center gap-1.5 py-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewRating(num)}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          num <= reviewRating
                            ? 'fill-[#C5A059] text-[#C5A059]'
                            : 'text-[#D8C7BE]'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-mono-tabular text-xs ml-1 text-[#5A4A42]">
                    {reviewRating} / 5
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#2C221E] mb-1">Your Review *</label>
              <textarea
                rows={3}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Tell us what you loved about the craftsmanship, packaging, or fit..."
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#F4EFEA] border border-[#D8C7BE] rounded-md text-xs text-[#2C221E] cursor-pointer hover:bg-[#EAE1D8]">
                <Camera className="w-3.5 h-3.5 text-[#737765]" />
                <span>{reviewPhotoUrl ? 'Photo Attached ✓' : 'Upload Customer Photo (Optional)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium rounded-md transition-colors"
              >
                Submit Review
              </button>
            </div>
          </form>
        )}

        {/* Reviews Grid */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white border border-[#E8DDD4] rounded-lg p-8 text-center space-y-2">
            <p className="text-sm font-medium text-[#2C221E]">
              No reviews found for this star filter yet.
            </p>
            <p className="text-xs text-[#6E5D55]">
              Be the first to share your thoughts on this handmade piece!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-[#E8DDD4] rounded-lg p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-[#C5A059]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-[#C5A059]' : 'opacity-30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-mono-tabular text-xs text-[#8C7A70]">
                      {rev.createdAt.slice(0, 10)}
                    </span>
                  </div>

                  <p className="text-sm text-[#2C221E] leading-relaxed">“{rev.comment}”</p>

                  {rev.photoUrl && (
                    <div className="w-20 h-20 rounded-md overflow-hidden border border-[#E5D9D0] bg-[#F4EFEA]">
                      <ResilientImage
                        src={rev.photoUrl}
                        alt={`Customer photo by ${rev.customerName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#F2EAE3] flex items-center justify-between text-xs text-[#6E5D55]">
                  <span className="font-semibold text-[#2C221E]">{rev.customerName}</span>
                  <span>Verified Mikkimama Patron</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Handmade Pieces */}
      <section className="pt-8 border-t border-[#E5D9D0] space-y-6">
        <h2 className="font-serif-display text-3xl text-[#2C221E]">You May Also Cherish</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedProducts.map((rel) => (
            <ProductCard key={rel.id} product={rel} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* Lightbox Image Zoom Modal */}
      {zoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <button
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white text-[#2C221E] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-3xl w-full aspect-[4/3] bg-[#F4EFEA] rounded-xl overflow-hidden">
            <ResilientImage
              src={product.images[selectedImageIdx] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

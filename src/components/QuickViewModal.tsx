import React, { useState } from 'react';
import { Heart, MessageCircle, ShoppingBag, Star, X, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ResilientImage } from './ResilientImage';

interface QuickViewModalProps {
  navigate: (path: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ navigate }) => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    wishlist,
    toggleWishlist,
    settings,
    openManualOrderModal,
  } = useStore();
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [qty, setQty] = useState<number>(1);

  if (!quickViewProduct) return null;

  const activeVariant = selectedVariant || quickViewProduct.variants[0] || 'Standard';
  const isWishlisted = wishlist.includes(quickViewProduct.id);
  const isOutOfStock = quickViewProduct.stock <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs"
        onClick={() => setQuickViewProduct(null)}
      />
      <div className="relative z-10 bg-[#FAF7F2] border border-[#E5D9D0] rounded-lg max-w-3xl w-full overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-2">
        <button
          onClick={() => setQuickViewProduct(null)}
          aria-label="Close quick view"
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-[#2C221E] hover:text-[#9E584D]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image Preview */}
        <div className="bg-[#F4EFEA] aspect-square md:aspect-auto md:h-full">
          <ResilientImage
            src={quickViewProduct.images[0]}
            alt={quickViewProduct.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-[#7D6B61]">
              <span>{quickViewProduct.category}</span>
              <span>·</span>
              <span className="font-mono-tabular">SKU: {quickViewProduct.sku}</span>
            </div>

            <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2C221E]">
              {quickViewProduct.name}
            </h2>

            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-0.5 text-[#C5A059]">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-3.5 h-3.5 ${
                      idx < Math.round(quickViewProduct.rating) ? 'fill-[#C5A059]' : 'opacity-30'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono-tabular font-medium text-[#2C221E]">
                {quickViewProduct.rating.toFixed(1)}
              </span>
              <span className="text-[#7D6B61]">({quickViewProduct.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 font-mono-tabular pt-1">
              <span className="text-2xl font-semibold text-[#2C221E]">
                ₹{quickViewProduct.salePrice}
              </span>
              {quickViewProduct.originalPrice > quickViewProduct.salePrice && (
                <>
                  <span className="text-sm text-[#9B8B82] line-through">
                    ₹{quickViewProduct.originalPrice}
                  </span>
                  <span className="text-xs font-semibold text-[#9E584D]">
                    {quickViewProduct.discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-[#5A4A42] leading-relaxed">
              {quickViewProduct.shortDescription}
            </p>

            {/* Variants */}
            {quickViewProduct.variants.length > 0 && (
              <div className="pt-2">
                <label className="block text-xs font-medium text-[#2C221E] mb-1.5">
                  Select Variant
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.variants.map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                        activeVariant === variant
                          ? 'border-[#2C221E] bg-[#2C221E] text-white'
                          : 'border-[#D8C7BE] bg-white text-[#5A4A42] hover:border-[#2C221E]'
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Stock */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center border border-[#D8C7BE] rounded-md bg-white">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-sm text-[#2C221E] hover:bg-[#F4EFEA]"
                >
                  −
                </button>
                <span className="px-3 py-1 font-mono-tabular text-xs font-semibold">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(quickViewProduct.stock || 1, q + 1))}
                  className="px-3 py-1 text-sm text-[#2C221E] hover:bg-[#F4EFEA]"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-[#6E5D55] flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#737765]" />
                {isOutOfStock
                  ? 'Out of Stock'
                  : `${quickViewProduct.stock} handcrafted pieces available`}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-[#E5D9D0]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => {
                  addToCart(quickViewProduct.id, activeVariant, qty);
                  setQuickViewProduct(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium rounded-md transition-colors disabled:opacity-40"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(quickViewProduct.id)}
                className="p-2.5 border border-[#D8C7BE] rounded-md bg-white hover:border-[#B6766C] transition-colors"
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? 'fill-[#B6766C] text-[#B6766C]' : 'text-[#2C221E]'
                  }`}
                />
              </button>
            </div>
            {settings.manualWhatsappOrderEnabled !== false && (
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => {
                  const targetProd = quickViewProduct;
                  setQuickViewProduct(null);
                  openManualOrderModal(targetProd, activeVariant, qty);
                }}
                className="w-full py-2.5 px-4 bg-[#EBF5EE] hover:bg-[#DCEFE2] border border-[#B7DFC2] text-[#1F7A3E] text-xs font-medium rounded-md transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Manual Order / Order on WhatsApp</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const slug = quickViewProduct.slug;
                setQuickViewProduct(null);
                navigate(`/product/${slug}`);
              }}
              className="w-full text-center text-xs text-[#6E5D55] hover:text-[#2C221E] underline underline-offset-4 py-1"
            >
              View Full Product Details & Customer Reviews →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

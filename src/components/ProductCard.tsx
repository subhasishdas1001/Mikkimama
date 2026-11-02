import React from 'react';
import { Eye, Heart, MessageCircle, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, navigate }) => {
  const {
    wishlist,
    toggleWishlist,
    addToCart,
    setQuickViewProduct,
    settings,
    openManualOrderModal,
  } = useStore();
  const isWishlisted = wishlist.includes(product.id);
  const isOutOfStock = product.stock <= 0;
  const isManualWhatsAppEnabled = settings.manualWhatsappOrderEnabled !== false;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product.id, product.variants[0], 1);
    navigate('/checkout');
  };

  return (
    <article className="group bg-white border border-[#E8DDD4] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Product Image Area */}
      <div
        onClick={() => navigate(`/product/${product.slug}`)}
        className="relative aspect-[4/3] bg-[#F4EFEA] overflow-hidden cursor-pointer"
      >
        <ResilientImage
          src={product.images[0]}
          alt={product.name}
          fallbackLabel={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Top-Right Wishlist & Quick View Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#2C221E] hover:text-[#B6766C] shadow-xs transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? 'fill-[#B6766C] text-[#B6766C]' : 'text-[#2C221E]'
              }`}
            />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            aria-label={`Quick view ${product.name}`}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#2C221E] hover:text-[#737765] shadow-xs transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Subtle Single Text Status Indicator if Out of Stock */}
        {isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 bg-[#2C221E]/80 text-[#FAF7F2] text-center py-1.5 text-xs font-medium tracking-wider uppercase">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Details Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Unboxed Metadata Row (Zero-Pill Discipline) */}
          <div className="flex items-center justify-between text-xs text-[#7D6B61]">
            <span className="truncate">{product.category}</span>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
              <span className="font-mono-tabular font-medium text-[#2C221E]">
                {product.rating.toFixed(1)}
              </span>
              <span className="font-mono-tabular text-[#8C7A70]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => navigate(`/product/${product.slug}`)}
            className="font-serif-display text-xl font-semibold text-[#2C221E] hover:text-[#9E6258] cursor-pointer mt-1 line-clamp-1"
          >
            {product.name}
          </h3>

          {/* Pricing with Tabular Numerals */}
          <div className="mt-2 flex items-baseline gap-2.5 font-mono-tabular">
            <span className="text-base font-semibold text-[#2C221E]">₹{product.salePrice}</span>
            {product.originalPrice > product.salePrice && (
              <>
                <span className="text-xs text-[#9B8B82] line-through">
                  ₹{product.originalPrice}
                </span>
                <span className="text-xs font-medium text-[#9E584D]">
                  {product.discountPercent}% OFF
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons: Add to Cart, Buy Now & Conditional Manual Order on WhatsApp */}
        <div className="pt-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => addToCart(product.id, product.variants[0], 1)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 border border-[#737765] text-[#2C221E] hover:bg-[#F4EFEA] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#737765]" />
              <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="py-2 px-3 bg-[#737765] hover:bg-[#5E6252] text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              Buy Now
            </button>
          </div>

          {isManualWhatsAppEnabled && (
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                openManualOrderModal(product, product.variants[0], 1);
              }}
              className="w-full py-2 px-3 bg-[#FAF7F2] hover:bg-[#EBF5EE] border border-[#B7DFC2] text-[#1F7A3E] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Manual Order / Order on WhatsApp</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

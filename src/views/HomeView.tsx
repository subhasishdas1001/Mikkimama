import React from 'react';
import { ArrowRight, Gift, Heart, Sparkles, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ResilientImage } from '../components/ResilientImage';

interface HomeViewProps {
  navigate: (path: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ navigate }) => {
  const { products, categories, reviews, settings, showToast } = useStore();

  const publishedProducts = products.filter((p) => p.status === 'published');
  const featuredProducts = publishedProducts.filter((p) => p.featured).slice(0, 6);
  const featuredReviews = reviews
    .filter((r) => r.status === 'approved' && r.featured)
    .slice(0, 3);

  const stylingGallery = [
    { src: '/assets/products/layered-necklaces.png', alt: 'Layered botanical necklaces' },
    { src: '/assets/products/botanical-rings.png', alt: 'Delicate gold botanical rings' },
    { src: '/assets/products/ceramic-dish-earrings.png', alt: 'Pressed flower drop earrings in dish' },
    { src: '/assets/products/worn-gold-pendant.png', alt: 'Worn gold floral medallion pendant' },
    { src: '/assets/products/silk-stud-earrings.png', alt: 'Pressed flower stud earrings on silk' },
  ];

  const customPreviewImages = [
    { src: '/assets/products/heart-coaster-set.png', alt: 'Split heart pressed rose coaster' },
    { src: '/assets/products/initial-keyrings-duo.png', alt: 'Personalised floral letter keyrings' },
    { src: '/assets/products/gold-rim-tray.png', alt: 'Gold-rimmed botanical keepsake tray' },
  ];

  return (
    <div className="space-y-20">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#F4EFEA] border-b border-[#E5D9D0] overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-5 sm:py-8 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-10 items-center">
          {/* Left Editorial Copy (Second on Mobile, First on Desktop) */}
          <div className="order-2 lg:order-1 lg:col-span-6 space-y-3.5 sm:space-y-5 lg:space-y-6">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#737765] font-medium">
              Mikkimama · Botanical Resin & Artisan Jewellery
            </p>
            <h1
              style={{ textWrap: 'balance' }}
              className="font-serif-display text-3xl sm:text-5xl lg:text-6xl font-normal text-[#2C221E] leading-[1.1]"
            >
              {settings.heroHeading}
            </h1>
            <p className="text-sm sm:text-lg text-[#5A4A42] leading-relaxed max-w-xl">
              {settings.heroSubtext}
            </p>
            <div className="pt-1 lg:pt-2 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-4">
              <button
                onClick={() => navigate('/shop')}
                className="px-6 py-3 bg-[#737765] hover:bg-[#5E6252] text-white text-xs sm:text-sm font-medium tracking-wider uppercase rounded-md transition-colors whitespace-nowrap shrink-0 text-center"
              >
                {settings.heroPrimaryBtn}
              </button>
              <button
                onClick={() => navigate('/new-arrivals')}
                className="px-6 py-3 bg-transparent border border-[#2C221E] hover:bg-[#2C221E] hover:text-white text-[#2C221E] text-xs sm:text-sm font-medium tracking-wider uppercase rounded-md transition-colors whitespace-nowrap shrink-0 text-center"
              >
                {settings.heroSecondaryBtn}
              </button>
            </div>
            <div className="pt-2 lg:pt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 sm:gap-3 text-xs text-[#6E5D55]">
              <span>Real Pressed Flowers</span>
              <span>·</span>
              <span>Hypoallergenic 18k Gold Plating</span>
              <span>·</span>
              <span>Small-Batch Handcrafted</span>
            </div>
          </div>

          {/* Right Studio Photography (First on Mobile, Second on Desktop) */}
          <div className="order-1 lg:order-2 lg:col-span-6">
            <div className="relative rounded-xl overflow-hidden border border-[#E2D4C8] bg-[#FAF7F2] shadow-sm aspect-[4/3] sm:aspect-[16/11]">
              <ResilientImage
                src={settings.heroImage}
                alt="Mikkimama Handmade Botanical Resin Jewellery"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. BRAND STORY SECTION: Made by Hand. Made With Love. */}
      <section className="max-w-[1140px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5">
            <div className="rounded-lg overflow-hidden border border-[#E5D9D0] bg-[#F4EFEA] aspect-[4/3]">
              <ResilientImage
                src={settings.storyImage}
                alt="Thoughtful handmade botanical pendant necklace"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#737765] font-medium">
              Made With Love ♡
            </p>
            <h2
              style={{ textWrap: 'balance' }}
              className="font-serif-display text-3xl sm:text-4xl text-[#2C221E] font-normal leading-tight"
            >
              {settings.storyHeading}
            </h2>
            <p className="text-sm sm:text-base text-[#5A4A42] leading-relaxed">
              {settings.storyBody}
            </p>
            <p className="text-sm text-[#6E5D55] leading-relaxed">
              Inspired by nature, warm morning light, and sentiment, our designs are made to be
              worn, gifted, and treasured for years to come.
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-[#E8DDD4]">
              <span className="font-serif-display italic text-xl text-[#7D6B61]">
                Handcrafted with love at Mikkimama Studio ♡
              </span>
              <button
                onClick={() => navigate('/about')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2C221E] hover:text-[#9E584D] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Read Our Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PIECES */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">Curated Selection</p>
          <h2 className="font-serif-display text-3xl sm:text-4xl text-[#2C221E]">
            Featured Handmade Pieces
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} navigate={navigate} />
          ))}
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/shop')}
            className="px-8 py-3 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium uppercase tracking-widest rounded-md transition-colors"
          >
            View Full Collection
          </button>
        </div>
      </section>

      {/* 4. ARTISAN PILLARS STRIP */}
      <section className="bg-[#F4EFEA] border-y border-[#E5D9D0] py-12">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#DFD2C7]">
          <div className="flex items-start gap-4 pt-4 md:pt-0 md:px-6 first:pt-0">
            <Heart className="w-7 h-7 text-[#9E6258] shrink-0 stroke-[1.5]" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C221E]">
                Truly Handmade
              </h3>
              <p className="text-xs text-[#5A4A42] mt-1 leading-relaxed">
                Every petal is pressed by hand and poured in small batches with crystal jeweller’s
                resin.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 pt-4 md:pt-0 md:px-6">
            <Sparkles className="w-7 h-7 text-[#9E6258] shrink-0 stroke-[1.5]" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C221E]">
                One of a Kind
              </h3>
              <p className="text-xs text-[#5A4A42] mt-1 leading-relaxed">
                Because we work with real botanical blooms, no two Mikkimama pieces are ever
                identical.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 pt-4 md:pt-0 md:px-6">
            <Gift className="w-7 h-7 text-[#9E6258] shrink-0 stroke-[1.5]" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C221E]">
                Perfect for Gifting
              </h3>
              <p className="text-xs text-[#5A4A42] mt-1 leading-relaxed">
                Thoughtful, personal, and presented in reusable cotton keepsake pouches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SHOP BY CATEGORY */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">Explore by Craft</p>
            <h2 className="font-serif-display text-3xl sm:text-4xl text-[#2C221E] mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="text-xs font-semibold uppercase tracking-wider text-[#2C221E] hover:text-[#9E584D] flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/category/${cat.slug}`)}
              className="group cursor-pointer bg-white border border-[#E8DDD4] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className="aspect-square bg-[#F4EFEA] overflow-hidden">
                <ResilientImage
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-serif-display text-lg font-semibold text-[#2C221E] group-hover:text-[#9E584D] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#7D6B61] font-mono-tabular">
                    {cat.productCount} pieces
                  </p>
                </div>
                <span className="text-xs font-medium text-[#737765] group-hover:translate-x-0.5 transition-transform">
                  Explore →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SEE HOW YOU STYLE YOUR PIECES + CUSTOM ORDERS */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2C221E]">
              See How You Style Your Pieces
            </h2>
            <p className="text-xs text-[#6E5D55]">
              Follow us on Instagram <span className="underline">{settings.instagramHandle}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {stylingGallery.map((img, i) => (
              <div
                key={i}
                onClick={() => navigate('/shop')}
                className="aspect-square rounded-lg overflow-hidden border border-[#E5D9D0] bg-[#F4EFEA] cursor-pointer group"
              >
                <ResilientImage
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Custom Keepsake Banner */}
        <div className="bg-[#EFE9E2] border border-[#DFD3C8] rounded-xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-serif-display text-3xl text-[#2C221E]">
              Looking for something personal?
            </h3>
            <p className="text-sm text-[#5A4A42] leading-relaxed">
              We craft custom botanical resin pieces—from preserving your wedding bouquet petals to
              monogrammed floral keyrings and bridesmaid gift boxes.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => navigate('/contact')}
                className="px-5 py-2.5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium uppercase tracking-wider rounded-md transition-colors"
              >
                Request a Custom Order
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(settings.promoBannerCode);
                  showToast(
                    'Code Copied',
                    `Use code ${settings.promoBannerCode} at checkout for special savings!`
                  );
                }}
                className="px-4 py-2.5 bg-white border border-[#D8C7BE] text-xs font-mono-tabular text-[#2C221E] rounded-md hover:border-[#737765] transition-colors"
              >
                Use Code: {settings.promoBannerCode}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-3 gap-3 sm:gap-4">
            {customPreviewImages.map((item, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-lg overflow-hidden border border-[#DFD2C7] bg-white"
              >
                <ResilientImage
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. KIND WORDS (CUSTOMER TESTIMONIALS) */}
      <section className="max-w-[1140px] mx-auto px-4 sm:px-8 space-y-8">
        <div className="text-center space-y-1">
          <p className="text-xs uppercase tracking-[0.22em] text-[#737765]">Kind Words</p>
          <h2 className="font-serif-display text-3xl text-[#2C221E]">
            Loved by Our Community
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-[#E8DDD4] rounded-lg p-6 flex flex-col justify-between space-y-4"
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
                  <span className="text-xs text-[#8C7A70]">{rev.productName}</span>
                </div>
                <p className="text-sm text-[#2C221E] italic leading-relaxed">
                  “{rev.comment}”
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#F2EAE3] text-xs text-[#6E5D55]">
                <span className="font-semibold text-[#2C221E]">{rev.customerName}</span>
                <span>Verified Buyer</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/reviews')}
            className="text-xs font-semibold uppercase tracking-wider text-[#2C221E] hover:text-[#9E584D] underline underline-offset-4"
          >
            Read All Verified Customer Reviews →
          </button>
        </div>
      </section>
    </div>
  );
};

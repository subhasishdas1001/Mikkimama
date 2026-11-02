import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { QuickViewModal } from './components/QuickViewModal';
import { ManualWhatsAppOrderModal } from './components/ManualWhatsAppOrderModal';
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import {
  CartView,
  CheckoutView,
  CustomerAccountView,
  OrderConfirmationView,
  WishlistView,
} from './views/CartCheckoutViews';
import {
  AboutView,
  ContactView,
  CustomerReviewsView,
  FaqView,
  PolicyView,
} from './views/InfoPolicyViews';
import { AdminDashboardView, AdminLoginView } from './views/AdminPortalView';

const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-[#231C18] text-[#FAF7F2] border border-[#4A3B33] rounded-lg p-3.5 shadow-lg flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            {t.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />
            ) : t.type === 'info' ? (
              <Info className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#86EFAC] shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-semibold">{t.title}</p>
              {t.description && (
                <p className="text-[11px] text-[#D8C7BE] mt-0.5 leading-snug">{t.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
            className="text-[#D8C7BE] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

function setMetaTag(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

const RouterContent: React.FC = () => {
  const { products, categories, settings } = useStore();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Route-level SEO metadata updater (title, description, canonical, Open Graph, Twitter)
  useEffect(() => {
    const origin = window.location.origin;
    const cleanPath = currentPath === '' ? '/' : currentPath;
    const canonicalUrl = `${origin}${cleanPath}`;

    let title = `${settings.heroHeading || 'Handmade With Love'} | Mikkimama — Handmade With Love`;
    let description =
      settings.heroSubtext ||
      'Shop Mikkimama for handmade crochet hair accessories, floral scrunchies, pearl hair bun holders, and artisan gifts made with love.';
    let ogImage = settings.heroImage || '/assets/uploads/mkm-a316612059f72840.webp';

    if (cleanPath === '/shop') {
      title = 'Shop All Handmade Accessories & Gifts | Mikkimama';
      description =
        'Explore the complete collection of Mikkimama handmade crochet hair accessories, floral scrunchies, pearl bun holders, and handcrafted keepsakes.';
    } else if (cleanPath === '/categories') {
      title = 'Shop by Category — Handmade Collections | Mikkimama';
      description =
        'Browse Mikkimama handmade collections by category: crochet hair accessories, floral scrunchies, bun holders, and curated gift sets.';
    } else if (cleanPath.startsWith('/category/')) {
      const slug = cleanPath.replace('/category/', '');
      const cat = categories.find((c) => c.slug === slug);
      if (cat) {
        title = `${cat.name} — Handmade Collection | Mikkimama`;
        description = cat.description || `Shop handmade ${cat.name} crafted with love at Mikkimama.`;
        if (cat.image) ogImage = cat.image;
      }
    } else if (cleanPath === '/new-arrivals') {
      title = 'New Arrivals — Latest Handmade Creations | Mikkimama';
      description =
        'Discover our newest small-batch handmade crochet hair accessories, floral scrunchies, and pearl hair bun holders at Mikkimama.';
    } else if (cleanPath === '/best-sellers') {
      title = 'Best Sellers — Most Loved Handmade Pieces | Mikkimama';
      description =
        'Shop our most-loved handmade hair accessories and customer favourites crafted with care at Mikkimama.';
    } else if (cleanPath === '/offers') {
      title = 'Special Offers & Boutique Coupons | Mikkimama';
      description =
        'Enjoy special savings and studio coupon codes on Mikkimama handmade hair accessories and gift sets.';
    } else if (cleanPath.startsWith('/product/')) {
      const slug = cleanPath.replace('/product/', '');
      const prod = products.find((p) => p.slug === slug || p.id === slug);
      if (prod) {
        title = prod.seoTitle || `${prod.name} | Mikkimama`;
        description = prod.seoDescription || prod.shortDescription || prod.description.slice(0, 160);
        if (prod.images[0]) ogImage = prod.images[0];
      }
    } else if (cleanPath === '/about') {
      title = 'Our Story — Handmade With Love | Mikkimama';
      description = settings.storyBody.slice(0, 160);
    } else if (cleanPath === '/reviews') {
      title = 'Verified Customer Reviews | Mikkimama';
      description =
        'Read verified customer reviews and kind words from Mikkimama patrons across India.';
    } else if (cleanPath === '/contact') {
      title = 'Contact Us & Custom Handmade Orders | Mikkimama';
      description =
        'Get in touch with Mikkimama for custom handmade hair accessories, bridal orders, and customer care.';
    } else if (cleanPath === '/faq') {
      title = 'Frequently Asked Questions | Mikkimama';
      description =
        'Find answers about Mikkimama handmade crafting, India-wide shipping, gift packaging, and care instructions.';
    } else if (cleanPath === '/shipping-policy') {
      title = 'Shipping Policy | Mikkimama';
      description = 'Learn about Mikkimama shipping timelines, packaging, and delivery across India.';
    } else if (cleanPath === '/refund-policy') {
      title = 'Refund & Return Policy | Mikkimama';
      description = 'Read the Mikkimama 7-day return and replacement policy for handmade orders.';
    } else if (cleanPath === '/privacy-policy') {
      title = 'Privacy Policy | Mikkimama';
      description = 'How Mikkimama protects your personal data and privacy when you shop with us.';
    } else if (cleanPath === '/terms') {
      title = 'Terms & Conditions | Mikkimama';
      description = 'Terms and conditions for shopping at Mikkimama Handmade Boutique.';
    }

    document.title = title;
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);
  }, [currentPath, products, categories, settings]);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isAdminRoute = currentPath.startsWith('/admin');

  const renderPage = () => {
    if (currentPath === '/admin/login') {
      return <AdminLoginView navigate={navigate} />;
    }
    if (currentPath.startsWith('/admin')) {
      return <AdminDashboardView navigate={navigate} />;
    }
    if (currentPath === '/' || currentPath === '') {
      return <HomeView navigate={navigate} />;
    }
    if (currentPath === '/shop') {
      return <ShopView mode="all" navigate={navigate} />;
    }
    if (currentPath === '/categories') {
      return <ShopView mode="categories" navigate={navigate} />;
    }
    if (currentPath.startsWith('/category/')) {
      const slug = currentPath.replace('/category/', '');
      return <ShopView mode="category-detail" categorySlug={slug} navigate={navigate} />;
    }
    if (currentPath === '/new-arrivals') {
      return <ShopView mode="new-arrivals" navigate={navigate} />;
    }
    if (currentPath === '/best-sellers') {
      return <ShopView mode="best-sellers" navigate={navigate} />;
    }
    if (currentPath === '/offers') {
      return <ShopView mode="offers" navigate={navigate} />;
    }
    if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '');
      return <ProductDetailView slug={slug} navigate={navigate} />;
    }
    if (currentPath === '/cart') {
      return <CartView navigate={navigate} />;
    }
    if (currentPath === '/checkout') {
      return <CheckoutView navigate={navigate} />;
    }
    if (currentPath.startsWith('/order-confirmation/')) {
      const orderId = currentPath.replace('/order-confirmation/', '');
      return <OrderConfirmationView orderId={orderId} navigate={navigate} />;
    }
    if (currentPath === '/account') {
      return <CustomerAccountView navigate={navigate} />;
    }
    if (currentPath === '/wishlist') {
      return <WishlistView navigate={navigate} />;
    }
    if (currentPath === '/about') {
      return <AboutView navigate={navigate} />;
    }
    if (currentPath === '/reviews') {
      return <CustomerReviewsView navigate={navigate} />;
    }
    if (currentPath === '/contact') {
      return <ContactView />;
    }
    if (currentPath === '/faq') {
      return <FaqView />;
    }
    if (currentPath === '/privacy-policy') {
      return <PolicyView type="privacy" />;
    }
    if (currentPath === '/terms') {
      return <PolicyView type="terms" />;
    }
    if (currentPath === '/shipping-policy') {
      return <PolicyView type="shipping" />;
    }
    if (currentPath === '/refund-policy') {
      return <PolicyView type="refund" />;
    }

    return <HomeView navigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2C221E]">
      {!isAdminRoute && <Navbar currentPath={currentPath} navigate={navigate} />}
      <div className="flex-1">{renderPage()}</div>
      {!isAdminRoute && <Footer navigate={navigate} />}
      <QuickViewModal navigate={navigate} />
      <ManualWhatsAppOrderModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <RouterContent />
    </StoreProvider>
  );
}

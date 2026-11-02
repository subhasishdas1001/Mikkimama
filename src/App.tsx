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

const RouterContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

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

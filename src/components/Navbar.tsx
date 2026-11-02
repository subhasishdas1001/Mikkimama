import React, { useState } from 'react';
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ResilientImage } from './ResilientImage';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { cart, wishlist, settings, products, isAdmin } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const searchResults =
    searchQuery.trim().length > 1
      ? products
          .filter(
            (p) =>
              p.status === 'published' &&
              (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))
          )
          .slice(0, 5)
      : [];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setSearchOpen(false);
  };

  return (
    <>
      {/* Slim Dismissible Top Announcement Bar (<= 36px height) */}
      {!bannerDismissed && settings.announcementText && (
        <div className="bg-[#737765] text-[#FAF7F2] text-xs px-4 h-9 flex items-center justify-between">
          <div className="w-6 hidden sm:block" />
          <p className="tracking-wide text-center truncate font-medium">
            ✦ {settings.announcementText} ✦
          </p>
          <button
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss announcement"
            className="text-[#FAF7F2]/80 hover:text-white p-1 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sticky 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5D9D0]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 -ml-2 text-[#2C221E] hover:text-[#B6766C] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleNav('/')}
              aria-label="Mikkimama Home"
              className="flex items-center bg-transparent border-0 p-0 focus:outline-none shrink-0 transition-opacity duration-200 hover:opacity-95"
            >
              <img
                src="/assets/aistudio/Mikkimama_Handmade_With_Love_Badge_3e964103.png"
                alt="Mikkimama — Handmade With Love"
                loading="eager"
                decoding="async"
                className="h-12 sm:h-16 w-auto object-contain bg-transparent select-none"
              />
            </button>
          </div>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#5A4A42]"
          >
            {[
              { label: 'Home', path: '/' },
              { label: 'Shop', path: '/shop' },
              { label: 'New Arrivals', path: '/new-arrivals' },
              { label: 'Best Sellers', path: '/best-sellers' },
              { label: 'About', path: '/about' },
              { label: 'Contact', path: '/contact' },
            ].map((item) => {
              const active =
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors duration-150 ${
                    active
                      ? 'border-[#2C221E] text-[#2C221E] font-semibold'
                      : 'border-transparent hover:border-[#B6766C] hover:text-[#2C221E]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Storefront Utility Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Search handmade collection"
              className="p-2.5 text-[#2C221E] hover:text-[#B6766C] transition-colors rounded-full"
            >
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            <button
              onClick={() => handleNav('/wishlist')}
              aria-label={`Wishlist (${wishlist.length} items)`}
              className="relative p-2.5 text-[#2C221E] hover:text-[#B6766C] transition-colors rounded-full"
            >
              <Heart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              {wishlist.length > 0 && (
                <span className=" -top-0.5 -right-0.5 font-mono-tabular text-[11px] font-semibold text-[#9E584D]">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNav('/account')}
              aria-label="Customer account and orders"
              className="p-2.5 text-[#2C221E] hover:text-[#B6766C] transition-colors rounded-full"
            >
              <User className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            <button
              onClick={() => handleNav('/cart')}
              aria-label={`Shopping bag (${totalCartItems} items)`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2C221E] bg-[#EFE6DF] hover:bg-[#E5D5CA] rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4 text-[#737765]" />
              <span className="hidden sm:inline">Bag</span>
              <span className="font-mono-tabular font-semibold">({totalCartItems})</span>
            </button>

            <button
              onClick={() => handleNav(isAdmin ? '/admin/dashboard' : '/admin/login')}
              title="Store Admin Portal"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#5A4A42] hover:text-[#2C221E] border border-[#E5D9D0] rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#737765]" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Instant Search Dropdown Bar */}
        {searchOpen && (
          <div className="border-t border-[#E5D9D0] bg-[#FAF7F2] px-4 sm:px-8 py-4 shadow-sm">
            <div className="max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#8C7A70] absolute left-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rose bracelets, daisy necklaces, hair barrettes, gift sets..."
                  autoFocus
                  className="w-full pl-10 pr-20 py-2.5 bg-white border border-[#DECFC4] rounded-md text-sm text-[#2C221E] placeholder-[#9B8B82] focus:outline-none focus:border-[#737765]"
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-3 text-xs text-[#6E5D55] hover:text-[#2C221E]"
                >
                  Close
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-3 bg-white border border-[#E5D9D0] rounded-md divide-y divide-[#F0E6DE]">
                  {searchResults.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => {
                        setSearchQuery('');
                        handleNav(`/product/${prod.slug}`);
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-[#FAF7F2] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <ResilientImage
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-11 h-11 object-cover rounded bg-[#F4EFEA]"
                        />
                        <div>
                          <p className="text-sm font-medium text-[#2C221E]">{prod.name}</p>
                          <p className="text-xs text-[#7D6B61]">{prod.category}</p>
                        </div>
                      </div>
                      <span className="font-mono-tabular text-sm font-semibold text-[#2C221E]">
                        ₹{prod.salePrice}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-[#FAF7F2] h-full shadow-xl flex flex-col justify-between p-6 overflow-y-auto z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E5D9D0]">
                <button
                  type="button"
                  onClick={() => handleNav('/')}
                  aria-label="Mikkimama Home"
                  className="flex items-center bg-transparent border-0 p-0 focus:outline-none"
                >
                  <img
                    src="/assets/aistudio/Mikkimama_Handmade_With_Love_Badge_3e964103.png"
                    alt="Mikkimama — Handmade With Love"
                    loading="eager"
                    decoding="async"
                    className="h-14 w-auto object-contain bg-transparent select-none"
                  />
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 text-[#5A4A42] hover:text-[#2C221E]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 space-y-1">
                {[
                  { label: 'Home', path: '/' },
                  { label: 'Shop All Products', path: '/shop' },
                  { label: 'Shop by Categories', path: '/categories' },
                  { label: 'New Arrivals', path: '/new-arrivals' },
                  { label: 'Best Sellers', path: '/best-sellers' },
                  { label: 'Offers & Coupons', path: '/offers' },
                  { label: 'Customer Reviews', path: '/reviews' },
                  { label: 'About Mikkimama', path: '/about' },
                  { label: 'Contact & Custom Orders', path: '/contact' },
                  { label: 'FAQ', path: '/faq' },
                  { label: `My Wishlist (${wishlist.length})`, path: '/wishlist' },
                  { label: 'My Account & Orders', path: '/account' },
                ].map((link) => (
                  <button
                    key={link.path}
                    onClick={() => handleNav(link.path)}
                    className="w-full text-left py-2.5 px-3 rounded-md text-sm font-medium text-[#2C221E] hover:bg-[#EFE6DF] transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E5D9D0] space-y-3">
              <button
                onClick={() => handleNav(isAdmin ? '/admin/dashboard' : '/admin/login')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#737765] text-white text-xs font-medium rounded-md hover:bg-[#5F6352] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAdmin ? 'Open Admin Dashboard' : 'Admin Portal Login'}</span>
              </button>
              <p className="text-[11px] text-center text-[#8C7A70]">
                Handcrafted in small batches with real pressed flowers.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

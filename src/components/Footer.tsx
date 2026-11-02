import React, { useState } from 'react';
import { Heart, Mail, Phone, MessageCircle, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings, showToast, isAdmin } = useStore();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Valid Email Required', 'Please enter a valid email address.', 'error');
      return;
    }
    showToast(
      'Welcome to the Mikkimama Family',
      'You are subscribed for early access to small-batch drops & studio offers.'
    );
    setEmail('');
  };

  return (
    <footer className="bg-[#EAE3DC] border-t border-[#DCD0C5] text-[#2C221E] mt-20">
      {/* Upper Artisanal Promise Strip */}
      <div className="border-b border-[#DCD0C5] bg-[#F4EFEA]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2C221E]">
              Handmade With Love
            </p>
            <p className="text-xs text-[#6E5D55] mt-1">
              Every piece individually crafted in small batches
            </p>
          </div>
          <div className="px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2C221E]">
              Insured India Shipping
            </p>
            <p className="text-xs text-[#6E5D55] mt-1">
              Free delivery on orders above ₹{settings.freeShippingThreshold}
            </p>
          </div>
          <div className="px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2C221E]">
              Keepsake Gift Packaging
            </p>
            <p className="text-xs text-[#6E5D55] mt-1">
              Reusable cotton pouches & handwritten notes
            </p>
          </div>
          <div className="px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2C221E]">
              Easy 7-Day Returns
            </p>
            <p className="text-xs text-[#6E5D55] mt-1">
              100% secure payments & buyer protection
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-4 space-y-4">
          <button onClick={() => navigate('/')} className="text-left focus:outline-none">
            <span className="font-serif-display text-3xl font-semibold tracking-tight text-[#2C221E]">
              Mikkimama
            </span>
            <p className="text-xs uppercase tracking-[0.2em] text-[#737765] mt-0.5">
              Handmade With Love
            </p>
          </button>
          <p className="text-sm text-[#5A4A42] leading-relaxed max-w-sm">
            Unique handcrafted botanical resin jewellery, bracelets, hair accessories, and bespoke
            keepsakes—thoughtfully made to add a little more beauty to everyday moments.
          </p>

          <div className="pt-2 space-y-1.5 text-xs text-[#5A4A42]">
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#737765]" />
              <span>{settings.supportEmail}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#737765]" />
              <span className="font-mono-tabular">{settings.supportPhone}</span>
            </p>
            <p className="flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-[#737765]" />
              <span>WhatsApp Care: {settings.supportWhatsapp}</span>
            </p>
          </div>
        </div>

        {/* Shop Column */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C221E]">
            Shop Boutique
          </h3>
          <ul className="space-y-2 text-sm text-[#5A4A42]">
            {[
              { label: 'All Products', path: '/shop' },
              { label: 'Shop by Category', path: '/categories' },
              { label: 'New Arrivals', path: '/new-arrivals' },
              { label: 'Best Sellers', path: '/best-sellers' },
              { label: 'Offers & Sale', path: '/offers' },
              { label: 'Customer Reviews', path: '/reviews' },
            ].map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className="hover:text-[#2C221E] hover:underline transition-colors"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Information & Policies Column */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C221E]">
            Customer Care & Policies
          </h3>
          <ul className="space-y-2 text-sm text-[#5A4A42]">
            {[
              { label: 'About Mikkimama', path: '/about' },
              { label: 'Contact & Custom Orders', path: '/contact' },
              { label: 'Frequently Asked Questions', path: '/faq' },
              { label: 'Shipping Policy', path: '/shipping-policy' },
              { label: 'Refund & Return Policy', path: '/refund-policy' },
              { label: 'Privacy Policy', path: '/privacy-policy' },
              { label: 'Terms & Conditions', path: '/terms' },
            ].map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className="hover:text-[#2C221E] hover:underline transition-colors"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter & Social Column */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C221E]">
            Join the Mikkimama Family
          </h3>
          <p className="text-xs text-[#5A4A42] leading-relaxed">
            Be the first to hear about new botanical pours, limited seasonal pieces, and private
            studio offers.
          </p>
          <form onSubmit={handleSubscribe} className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full px-3.5 py-2.5 bg-white border border-[#D5C7BC] rounded-md text-xs text-[#2C221E] placeholder-[#9B8B82] focus:outline-none focus:border-[#737765]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              Subscribe
            </button>
          </form>

          <div className="pt-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#2C221E] mb-2">
              Connect With Us
            </p>
            <div className="flex items-center gap-4 text-xs font-medium text-[#5A4A42]">
              <a
                href="#instagram"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Instagram', `Follow ${settings.instagramHandle} on Instagram!`, 'info');
                }}
                className="hover:text-[#2C221E] underline-offset-4 hover:underline"
              >
                Instagram
              </a>
              <span>·</span>
              <a
                href="#pinterest"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Pinterest', 'Explore our Mikkimama lookboards on Pinterest.', 'info');
                }}
                className="hover:text-[#2C221E] underline-offset-4 hover:underline"
              >
                Pinterest
              </a>
              <span>·</span>
              <a
                href="#facebook"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Facebook', 'Visit Mikkimama Handmade Boutique on Facebook.', 'info');
                }}
                className="hover:text-[#2C221E] underline-offset-4 hover:underline"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-[#DCD0C5] py-5 px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6E5D55]">
          <p className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} Mikkimama. Handcrafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#B6766C] fill-[#B6766C]" />
            <span>in India. All rights reserved.</span>
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/admin/login')}
              className="flex items-center gap-1 text-[#5A4A42] hover:text-[#2C221E] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#737765]" />
              <span>{isAdmin ? 'Admin Dashboard' : 'Admin Login'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

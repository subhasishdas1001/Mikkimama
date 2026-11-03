import React, { useState } from 'react';
import {
  Camera,
  ChevronDown,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ResilientImage } from '../components/ResilientImage';

/* ============================================================================
 * 8. ABOUT MIKKIMAMA
 * ==========================================================================*/
export const AboutView: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { settings } = useStore();

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-8 py-12 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-[#737765]">Our Story</p>
        <h1 className="font-serif-display text-4xl sm:text-5xl text-[#2C221E]">
          Made by Hand. Made With Love.
        </h1>
        <p className="text-sm text-[#5A4A42] leading-relaxed">
          Mikkimama began at a sunlit studio table with a simple wish: to preserve the fleeting
          delicacy of real wildflowers and rose petals into wearable heirlooms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 rounded-xl overflow-hidden border border-[#E5D9D0] bg-[#F4EFEA] aspect-[4/3]">
          <ResilientImage
            src={settings.storyImage}
            alt="Mikkimama studio botanical resin craft"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="lg:col-span-6 space-y-4 text-sm text-[#5A4A42] leading-relaxed">
          <h2 className="font-serif-display text-3xl text-[#2C221E]">{settings.storyHeading}</h2>
          <p>{settings.storyBody}</p>
          <p>
            Unlike mass-produced fashion jewellery, each Mikkimama piece goes through a 4-stage
            artisan process: botanical harvesting and pressing, delicate tweezers arrangement inside
            18k gold-plated bezels, multi-layer UV-resistant resin curing, and hand-buffing to a
            glass-like finish.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium uppercase tracking-wider rounded-md"
            >
              Explore Our Handmade Pieces
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            step: '01. Botanical Pressing',
            desc: 'Real roses, meadow daisies, and lavender florets are pressed for 21 days to retain their natural pigments.',
            img: '/assets/products/daisy-necklace.png',
          },
          {
            step: '02. Small-Batch Pouring',
            desc: 'Each bezel is poured in three crystal layers over 72 hours for a bubble-free, luminous finish.',
            img: '/assets/products/rose-necklace.png',
          },
          {
            step: '03. Keepsake Packaging',
            desc: 'Wrapped in reusable organic cotton pouches with a handwritten note ready for gifting.',
            img: '/assets/products/heart-coaster-set.png',
          },
        ].map((item) => (
          <div
            key={item.step}
            className="bg-white border border-[#E8DDD4] rounded-xl overflow-hidden flex flex-col justify-between"
          >
            <div className="aspect-[4/3] bg-[#F4EFEA]">
              <ResilientImage src={item.img} alt={item.step} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 space-y-2">
              <h3 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
                {item.step}
              </h3>
              <p className="text-xs text-[#5A4A42] leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 9. CUSTOMER REVIEWS PAGE
 * ==========================================================================*/
export const CustomerReviewsView: React.FC<{ navigate: (path: string) => void }> = ({
  navigate,
}) => {
  const { reviews, products, submitReview } = useStore();
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const displayedReviews =
    starFilter === 'all'
      ? approvedReviews
      : approvedReviews.filter((r) => Math.round(r.rating) === starFilter);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProdId) || products[0];
    if (!prod || !customerName.trim() || !comment.trim()) return;
    await submitReview({
      productId: prod.id,
      productName: prod.name,
      customerName,
      rating,
      comment,
      photoUrl,
    });
    setCustomerName('');
    setComment('');
    setPhotoUrl('');
    setShowForm(false);
  };

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-8 py-12 space-y-10">
      <div className="bg-[#F4EFEA] border border-[#E5D9D0] rounded-xl p-8 text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">Kind Words & Photos</p>
        <h1 className="font-serif-display text-4xl sm:text-5xl text-[#2C221E]">
          Customer Love ({approvedReviews.length} Verified Reviews)
        </h1>
        <p className="text-sm text-[#5A4A42] max-w-xl mx-auto">
          Every review below comes from a patron who wears or gifted a Mikkimama handmade piece.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="px-6 py-2.5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium rounded-md"
          >
            {showForm ? 'Close Review Form' : 'Write a Customer Review'}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E5D9D0] rounded-xl p-6 max-w-2xl mx-auto space-y-4"
        >
          <h2 className="font-serif-display text-2xl text-[#2C221E]">Share Your Mikkimama Story</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#2C221E] mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2C221E] mb-1">
                Select Product *
              </label>
              <select
                value={selectedProdId}
                onChange={(e) => setSelectedProdId(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2C221E] mb-1">Rating *</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} className="p-1">
                  <Star
                    className={`w-5 h-5 ${
                      n <= rating ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#D8C7BE]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2C221E] mb-1">Your Review *</label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did your handmade piece look and feel?"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#F4EFEA] border border-[#D8C7BE] rounded text-xs cursor-pointer">
              <Camera className="w-3.5 h-3.5 text-[#737765]" />
              <span>{photoUrl ? 'Photo Attached ✓' : 'Upload Photo'}</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            <button
              type="submit"
              className="px-6 py-2 bg-[#737765] text-white text-xs font-medium rounded-md"
            >
              Submit for Approval
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {(['all', 5, 4, 3, 2, 1] as const).map((st) => (
          <button
            key={String(st)}
            onClick={() => setStarFilter(st)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              starFilter === st
                ? 'bg-[#2C221E] text-white'
                : 'bg-white border border-[#E5D9D0] text-[#5A4A42]'
            }`}
          >
            {st === 'all' ? 'All Reviews' : `${st} Star`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white border border-[#E8DDD4] rounded-xl p-6 flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 text-[#C5A059]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rev.rating ? 'fill-[#C5A059]' : 'opacity-30'}`}
                    />
                  ))}
                </div>
                <span className="font-mono-tabular text-xs text-[#8C7A70]">
                  {rev.createdAt.slice(0, 10)}
                </span>
              </div>
              <p className="text-sm text-[#2C221E] italic leading-relaxed">“{rev.comment}”</p>
              {rev.photoUrl && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#E5D9D0]">
                  <ResilientImage
                    src={rev.photoUrl}
                    alt={rev.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-[#F2EAE3] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#2C221E]">{rev.customerName}</span>
              <button
                onClick={() => navigate('/shop')}
                className="text-[#737765] hover:underline"
              >
                {rev.productName} →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 10. CONTACT & CUSTOM ORDERS PAGE
 * ==========================================================================*/
export const ContactView: React.FC = () => {
  const { settings, showToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [requestType, setRequestType] = useState('Custom Keepsake / Bridal Flower Preservation');
  const [message, setMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      'Message Received',
      `Thank you, ${name}! Our studio team will reply to ${email} within 24 hours.`
    );
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-5 space-y-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">Get in Touch</p>
        <h1 className="font-serif-display text-4xl text-[#2C221E]">
          Contact & Custom Keepsake Orders
        </h1>
        <p className="text-sm text-[#5A4A42] leading-relaxed">
          Whether you have a question about an order, want to preserve flowers from a special
          occasion, or need bespoke bridesmaid gift boxes, we would love to hear from you.
        </p>

        <div className="space-y-4 pt-2 text-xs text-[#5A4A42]">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-[#737765] mt-0.5" />
            <div>
              <p className="font-semibold text-[#2C221E]">Studio Email</p>
              <p>{settings.supportEmail}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-[#737765] mt-0.5" />
            <div>
              <p className="font-semibold text-[#2C221E]">Phone Support (Mon–Sat, 10am–6pm IST)</p>
              <p className="font-mono-tabular">
                {settings.supportPhone ||
                  (settings.manualWhatsappNumber
                    ? `+91 ${settings.manualWhatsappNumber}`
                    : '+91 87100 78213')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageCircle className="w-4 h-4 text-[#737765] mt-0.5" />
            <div>
              <p className="font-semibold text-[#2C221E]">WhatsApp Concierge</p>
              <p className="font-mono-tabular">
                {settings.supportWhatsapp ||
                  (settings.manualWhatsappNumber
                    ? `+91 ${settings.manualWhatsappNumber}`
                    : '+91 87100 78213')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#737765] mt-0.5" />
            <div>
              <p className="font-semibold text-[#2C221E]">Mikkimama Atelier</p>
              <p>Kala Ghoda Design District, Fort, Mumbai — 400001</p>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleContactSubmit}
        className="lg:col-span-7 bg-white border border-[#E8DDD4] rounded-xl p-6 sm:p-8 space-y-4"
      >
        <h2 className="font-serif-display text-2xl text-[#2C221E]">Send a Note to Our Studio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#2C221E] mb-1">Your Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meera Nair"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2C221E] mb-1">Your Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2C221E] mb-1">Inquiry Type</label>
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs"
          >
            <option>Custom Keepsake / Bridal Flower Preservation</option>
            <option>Personalised Initial Keyring / Gift Box</option>
            <option>Existing Order Status Inquiry</option>
            <option>Bulk / Bridesmaid Gifting</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2C221E] mb-1">Your Message *</label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your custom floral idea, preferred metal finish, or order reference..."
            className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium uppercase tracking-wider rounded-md"
        >
          Send Studio Inquiry
        </button>
      </form>
    </div>
  );
};

/* ============================================================================
 * 11. FAQ PAGE
 * ==========================================================================*/
export const FaqView: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number>(0);

  const faqs = [
    {
      q: 'Are real flowers used inside Mikkimama jewellery?',
      a: 'Yes! Every flower—from blush rose petals to meadow daisies and baby’s breath—is a real botanical bloom that we press for 2–3 weeks before preserving in UV-stabilised jeweller’s resin.',
    },
    {
      q: 'Will two pieces of the same product look identical?',
      a: 'Because nature never repeats a petal and every piece is arranged by hand in our studio, each necklace, bracelet, or pair of earrings has its own subtle, one-of-a-kind character.',
    },
    {
      q: 'How should I care for my botanical resin jewellery?',
      a: 'Store your piece in the complimentary Mikkimama cotton pouch away from prolonged harsh direct afternoon sunlight. Avoid spraying perfume directly onto the resin and wipe gently with a soft dry cloth.',
    },
    {
      q: 'How long does shipping take across India?',
      a: 'Ready-to-ship pieces dispatch within 24–48 hours and arrive in 3–5 working days via insured courier. Express Air Delivery arrives in 1–2 working days.',
    },
    {
      q: 'Can I send flowers from my wedding bouquet for custom preservation?',
      a: 'Absolutely! Visit our Contact & Custom Orders page to request a bridal bouquet preservation kit and instructions.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">Helpful Answers</p>
        <h1 className="font-serif-display text-4xl text-[#2C221E]">Frequently Asked Questions</h1>
      </div>

      <div className="space-y-3">
        {faqs.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-[#E8DDD4] rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4"
              >
                <span className="font-serif-display text-xl font-semibold text-[#2C221E]">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#737765] transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-[#5A4A42] leading-relaxed border-t border-[#F4EFEA] pt-3">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * 17–20. POLICY PAGES (PRIVACY, TERMS, SHIPPING, REFUND)
 * ==========================================================================*/
export const PolicyView: React.FC<{
  type: 'privacy' | 'terms' | 'shipping' | 'refund';
}> = ({ type }) => {
  const { settings } = useStore();

  const contentMap = {
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'How Mikkimama protects your personal data and privacy',
      sections: [
        {
          h: '1. Information We Collect',
          p: 'When you place an order or sign in with Google at Mikkimama, we collect your name, email address, phone number, and shipping address strictly for order fulfillment and customer care.',
        },
        {
          h: '2. Payment Security & PII Isolation',
          p: 'All card, UPI, and net banking transactions are processed via encrypted payment gateways with server-side signature verification. We never store raw credit card numbers or secret keys on client devices.',
        },
        {
          h: '3. Your Data Rights',
          p: `You may request access to, correction of, or deletion of your customer profile at any time by writing to ${settings.supportEmail}.`,
        },
      ],
    },
    terms: {
      title: 'Terms & Conditions',
      subtitle: 'Terms governing purchases from Mikkimama Handmade Boutique',
      sections: [
        {
          h: '1. Handcrafted Nature of Goods',
          p: 'Every Mikkimama item is handmade using real pressed flowers. Slight natural variations in flower size, petal shade, and placement are a hallmark of authentic handmade craftsmanship.',
        },
        {
          h: '2. Pricing & Taxes',
          p: 'All prices are listed in Indian Rupees (INR) and are subject to 3% GST as applicable to fine and artisan jewellery.',
        },
        {
          h: '3. Intellectual Property',
          p: 'All Mikkimama designs, photography, and brand marks are the exclusive property of Mikkimama.',
        },
      ],
    },
    shipping: {
      title: 'Shipping Policy',
      subtitle: 'Carefully packaged and insured delivery across India',
      sections: [
        {
          h: '1. Processing & Dispatch Time',
          p: 'In-stock handmade pieces are packaged in our studio and dispatched within 24–48 business hours. Custom monogram or bridal preservation orders take 5–7 working days to cure.',
        },
        {
          h: '2. Shipping Rates & Free Delivery',
          p: `We offer complimentary insured standard shipping on all orders above ₹${settings.freeShippingThreshold}. Orders below this threshold carry a flat ₹${settings.standardShippingRate} shipping fee.`,
        },
        {
          h: '3. Eco-Friendly Keepsake Packaging',
          p: 'Every order arrives in a reusable Mikkimama cotton drawstring pouch nestled inside a recyclable crush-proof gift box.',
        },
      ],
    },
    refund: {
      title: 'Refund & Return Policy',
      subtitle: 'Our 7-day satisfaction and replacement guarantee',
      sections: [
        {
          h: '1. 7-Day Easy Returns',
          p: 'If your piece arrives damaged in transit or does not meet expectations, you may initiate a return or replacement within 7 days of delivery for all non-custom items.',
        },
        {
          h: '2. Custom & Monogrammed Pieces',
          p: 'Personalised initial keyrings and custom wedding flower preservations are crafted specifically for you and are eligible for replacement only in case of transit damage.',
        },
        {
          h: '3. Refund Timeline',
          p: 'Approved refunds are credited back to your original payment method (UPI, Card, Net Banking, or Bank Transfer for COD) within 3–5 business days.',
        },
      ],
    },
  };

  const doc = contentMap[type];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      <div className="bg-[#F4EFEA] border border-[#E5D9D0] rounded-xl p-8 space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-[#737765] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mikkimama Boutique Policies</span>
        </p>
        <h1 className="font-serif-display text-4xl text-[#2C221E]">{doc.title}</h1>
        <p className="text-xs text-[#5A4A42]">{doc.subtitle}</p>
      </div>

      <div className="bg-white border border-[#E8DDD4] rounded-xl p-6 sm:p-8 space-y-6">
        {doc.sections.map((s) => (
          <div key={s.h} className="space-y-2">
            <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">{s.h}</h2>
            <p className="text-xs sm:text-sm text-[#5A4A42] leading-relaxed">{s.p}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

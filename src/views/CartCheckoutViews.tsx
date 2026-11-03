import React, { useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  CreditCard,
  Heart,
  LogOut,
  Package,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Trash2,
  Truck,
  User,
  Wallet,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ResilientImage } from '../components/ResilientImage';
import { ProductCard } from '../components/ProductCard';
import { OrderItem, PaymentStatus } from '../types';

interface CartViewProps {
  navigate: (path: string) => void;
}

export const CartView: React.FC<CartViewProps> = ({ navigate }) => {
  const {
    cart,
    savedForLater,
    products,
    settings,
    appliedCoupon,
    updateCartQuantity,
    removeFromCart,
    saveForLater,
    moveToCartFromSaved,
    removeSavedForLater,
    applyCouponCode,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState(appliedCoupon?.code || '');
  const [couponFeedback, setCouponFeedback] = useState<string>('');

  const detailedCart = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        ...item,
        product,
        lineOriginal: product.originalPrice * item.quantity,
        lineSale: product.salePrice * item.quantity,
        lineSavings: Math.max(0, (product.originalPrice - product.salePrice) * item.quantity),
      };
    })
    .filter(Boolean) as Array<{
    productId: string;
    variant: string;
    quantity: number;
    product: (typeof products)[0];
    lineOriginal: number;
    lineSale: number;
    lineSavings: number;
  }>;

  const subtotal = detailedCart.reduce((acc, item) => acc + item.lineSale, 0);
  const productDiscountSavings = detailedCart.reduce((acc, item) => acc + item.lineSavings, 0);

  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderAmount) {
    if (appliedCoupon.discountType === 'fixed') {
      couponDiscount = Math.min(subtotal, appliedCoupon.discountValue);
    } else {
      const raw = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      couponDiscount =
        appliedCoupon.maxDiscountAmount > 0
          ? Math.min(raw, appliedCoupon.maxDiscountAmount)
          : raw;
    }
  }

  const netAfterCoupon = Math.max(0, subtotal - couponDiscount);
  const shippingCost =
    detailedCart.length === 0 || netAfterCoupon >= settings.freeShippingThreshold
      ? 0
      : settings.standardShippingRate;
  const taxTotal = Math.round(netAfterCoupon * 0.03); // 3% Jewellery GST
  const grandTotal = netAfterCoupon + shippingCost + taxTotal;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyCouponCode(couponInput);
    setCouponFeedback(res.message);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 space-y-12">
      <div className="flex items-center justify-between border-b border-[#E5D9D0] pb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">Your Selection</p>
          <h1 className="font-serif-display text-3xl sm:text-4xl text-[#2C221E] mt-1">
            Shopping Bag ({detailedCart.reduce((s, i) => s + i.quantity, 0)})
          </h1>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="text-xs font-medium text-[#5A4A42] hover:text-[#2C221E] underline underline-offset-4"
        >
          Continue Shopping
        </button>
      </div>

      {detailedCart.length === 0 ? (
        <div className="bg-white border border-[#E8DDD4] rounded-xl p-12 text-center space-y-4">
          <ShoppingBag className="w-10 h-10 text-[#9B8B82] mx-auto stroke-[1.5]" />
          <h2 className="font-serif-display text-3xl text-[#2C221E]">Your shopping bag is empty</h2>
          <p className="text-sm text-[#6E5D55] max-w-md mx-auto">
            Explore our handmade bracelets, pressed flower necklaces, and gift boxes crafted with
            love.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium uppercase tracking-wider rounded-md"
          >
            Explore Handmade Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {detailedCart.map((item) => (
              <div
                key={`${item.productId}-${item.variant}`}
                className="bg-white border border-[#E8DDD4] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
              >
                <div className="flex items-start gap-4">
                  <div
                    onClick={() => navigate(`/product/${item.product.slug}`)}
                    className="w-24 h-24 rounded-lg overflow-hidden bg-[#F4EFEA] border border-[#E5D9D0] shrink-0 cursor-pointer"
                  >
                    <ResilientImage
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3
                      onClick={() => navigate(`/product/${item.product.slug}`)}
                      className="font-serif-display text-xl font-semibold text-[#2C221E] hover:text-[#9E584D] cursor-pointer"
                    >
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-[#6E5D55]">Variant: {item.variant}</p>
                    <div className="flex items-baseline gap-2 font-mono-tabular pt-1">
                      <span className="text-sm font-semibold text-[#2C221E]">
                        ₹{item.product.salePrice}
                      </span>
                      {item.product.originalPrice > item.product.salePrice && (
                        <>
                          <span className="text-xs text-[#9B8B82] line-through">
                            ₹{item.product.originalPrice}
                          </span>
                          <span className="text-[11px] text-[#9E584D]">
                            Save ₹{item.lineSavings}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity & Item Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F2EAE3]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#D8C7BE] rounded-md bg-[#FAF7F2]">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(item.productId, item.variant, item.quantity - 1)
                        }
                        className="px-2.5 py-1 text-xs text-[#2C221E] hover:bg-[#EFE6DF]"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 font-mono-tabular text-xs font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(item.productId, item.variant, item.quantity + 1)
                        }
                        className="px-2.5 py-1 text-xs text-[#2C221E] hover:bg-[#EFE6DF]"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-mono-tabular text-base font-semibold text-[#2C221E] min-w-[70px] text-right">
                      ₹{item.lineSale}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#6E5D55]">
                    <button
                      type="button"
                      onClick={() => saveForLater(item.productId, item.variant)}
                      className="inline-flex items-center gap-1 hover:text-[#2C221E] transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save for later</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId, item.variant)}
                      className="inline-flex items-center gap-1 text-[#9E584D] hover:text-[#7F1D1D] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Order Summary */}
          <div className="lg:col-span-4 bg-white border border-[#E8DDD4] rounded-xl p-6 space-y-6">
            <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
              Order Summary
            </h2>

            {/* Coupon Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="block text-xs font-medium text-[#2C221E]">
                Have an Atelier Coupon?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs font-mono-tabular uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2C221E] hover:bg-[#43352F] text-white text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  Apply
                </button>
              </div>
              {couponFeedback && (
                <p className="text-[11px] text-[#737765] font-medium">{couponFeedback}</p>
              )}
              {appliedCoupon && (
                <div className="flex items-center justify-between bg-[#F4EFEA] px-3 py-1.5 rounded text-xs">
                  <span className="font-mono-tabular font-semibold text-[#4D6A46]">
                    Applied: {appliedCoupon.code} (−₹{couponDiscount})
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[#9E584D] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              <p className="text-[11px] text-[#7D6B61]">
                Try <button type="button" onClick={() => setCouponInput('WELCOME15')} className="underline font-mono-tabular">WELCOME15</button> or <button type="button" onClick={() => setCouponInput('LOVE20')} className="underline font-mono-tabular">LOVE20</button>
              </p>
            </form>

            {/* Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-[#E8DDD4] text-xs text-[#5A4A42] font-mono-tabular">
              <div className="flex justify-between">
                <span className="font-sans">Subtotal</span>
                <span className="font-semibold text-[#2C221E]">₹{subtotal}</span>
              </div>
              {productDiscountSavings > 0 && (
                <div className="flex justify-between text-[#4D6A46]">
                  <span className="font-sans">Product Savings</span>
                  <span>−₹{productDiscountSavings}</span>
                </div>
              )}
              <div className="flex justify-between text-[#4D6A46]">
                <span className="font-sans">Coupon Discount</span>
                <span>−₹{couponDiscount}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans">Insured Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans">Tax (3% Jewellery GST)</span>
                <span>₹{taxTotal}</span>
              </div>
              <div className="pt-3 border-t border-[#E8DDD4] flex justify-between items-baseline text-base font-semibold text-[#2C221E]">
                <span className="font-serif-display text-xl">Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-semibold uppercase tracking-widest rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Saved for Later Section */}
      {savedForLater.length > 0 && (
        <div className="pt-8 border-t border-[#E5D9D0] space-y-4">
          <h2 className="font-serif-display text-2xl text-[#2C221E]">
            Saved for Later ({savedForLater.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedForLater.map((saved) => {
              const p = products.find((prod) => prod.id === saved.productId);
              if (!p) return null;
              return (
                <div
                  key={`${saved.productId}-${saved.variant}`}
                  className="bg-white border border-[#E8DDD4] rounded-lg p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <ResilientImage
                      src={p.images[0]}
                      alt={p.name}
                      className="w-16 h-16 rounded object-cover bg-[#F4EFEA]"
                    />
                    <div>
                      <p className="font-serif-display text-lg font-semibold text-[#2C221E]">
                        {p.name}
                      </p>
                      <p className="text-xs text-[#6E5D55]">{saved.variant}</p>
                      <p className="font-mono-tabular text-xs font-semibold text-[#2C221E] mt-0.5">
                        ₹{p.salePrice}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveToCartFromSaved(saved.productId, saved.variant)}
                      className="px-3 py-1.5 bg-[#737765] text-white text-xs rounded"
                    >
                      Move to Bag
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSavedForLater(saved.productId, saved.variant)}
                      className="text-[11px] text-[#9E584D] hover:underline text-center"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 11. CHECKOUT PAGE
 * ==========================================================================*/
export const CheckoutView: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const {
    cart,
    products,
    settings,
    appliedCoupon,
    currentUser,
    placeOrder,
    showToast,
  } = useStore();

  const [fullName, setFullName] = useState(currentUser?.displayName || '');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [country, setCountry] = useState('India');
  const [shippingMethod, setShippingMethod] = useState<
    'Standard Insured Delivery' | 'Express Air Boutique Delivery'
  >('Standard Insured Delivery');

  // Available payment methods configured in Admin -> Payments
  const configuredPaymentOptions = [
    ...(settings.upiEnabled ? [{ id: 'UPI', label: 'UPI (GPay, PhonePe, Paytm)', icon: Smartphone }] : []),
    ...(settings.razorpayEnabled
      ? [{ id: 'Razorpay Gateway', label: 'Razorpay Secure Checkout', icon: ShieldCheck }]
      : []),
    ...(settings.cardEnabled
      ? [
          { id: 'Credit Card', label: 'Credit Card (Visa, Mastercard, RuPay)', icon: CreditCard },
          { id: 'Debit Card', label: 'Debit Card', icon: CreditCard },
        ]
      : []),
    ...(settings.netBankingEnabled
      ? [{ id: 'Net Banking', label: 'Net Banking (All Indian Banks)', icon: Wallet }]
      : []),
    ...(settings.walletEnabled ? [{ id: 'Wallet', label: 'Mobile Wallets', icon: Wallet }] : []),
    ...(settings.codEnabled
      ? [{ id: 'Cash on Delivery', label: 'Cash on Delivery (Pay at Doorstep)', icon: Truck }]
      : []),
  ];

  const availablePaymentOptions =
    configuredPaymentOptions.length > 0
      ? configuredPaymentOptions
      : [
          { id: 'UPI', label: 'UPI (GPay, PhonePe, Paytm)', icon: Smartphone },
          { id: 'Cash on Delivery', label: 'Cash on Delivery (Pay at Doorstep)', icon: Truck },
        ];

  const [paymentMethod, setPaymentMethod] = useState<string>(
    availablePaymentOptions[0]?.id || 'UPI'
  );
  const [upiHandle, setUpiHandle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const detailedCart = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return { ...item, product, lineTotal: product.salePrice * item.quantity };
    })
    .filter(Boolean) as Array<{
    productId: string;
    variant: string;
    quantity: number;
    product: (typeof products)[0];
    lineTotal: number;
  }>;

  const subtotal = detailedCart.reduce((acc, i) => acc + i.lineTotal, 0);
  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderAmount) {
    couponDiscount =
      appliedCoupon.discountType === 'fixed'
        ? Math.min(subtotal, appliedCoupon.discountValue)
        : Math.min(
            appliedCoupon.maxDiscountAmount || 99999,
            Math.round((subtotal * appliedCoupon.discountValue) / 100)
          );
  }
  const netSubtotal = Math.max(0, subtotal - couponDiscount);
  const baseShipping =
    netSubtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingRate;
  const shippingCost =
    shippingMethod === 'Express Air Boutique Delivery' ? baseShipping + 120 : baseShipping;
  const taxTotal = Math.round(netSubtotal * 0.03);
  const grandTotal = netSubtotal + shippingCost + taxTotal;

  if (detailedCart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-serif-display text-3xl text-[#2C221E]">No items in your bag</h1>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-[#737765] text-white text-xs rounded-md"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobile.trim() || !email.trim() || !address.trim() || !pinCode.trim()) {
      showToast('Missing Details', 'Please fill in all shipping address fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Create server-side payment order via modular payment gateway route
      const createRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          currency: 'INR',
          paymentMethod,
          customerEmail: email,
        }),
      });
      const gatewayOrder = await createRes.json();

      // Step 2: Verify payment signature server-side
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatewayOrderId: gatewayOrder.gatewayOrderId,
          amountInPaise: gatewayOrder.amountInPaise,
          currency: 'INR',
          signature: gatewayOrder.signature,
          paymentMethod,
        }),
      });
      const verifyData = await verifyRes.json();

      const paymentStatus: PaymentStatus =
        verifyData.paymentStatus === 'Paid' ? 'Paid' : 'Pending';

      const orderItems: OrderItem[] = detailedCart.map((i, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        orderId: 'pending',
        userId: currentUser?.uid || `guest-${Date.now()}`,
        productId: i.productId,
        productName: i.product.name,
        productImage: i.product.images[0],
        variant: i.variant,
        quantity: i.quantity,
        unitPrice: i.product.salePrice,
        lineTotal: i.lineTotal,
        createdAt: new Date().toISOString(),
      }));

      const itemsSummary = detailedCart
        .map((i) => `${i.product.name} (×${i.quantity})`)
        .join(', ');

      const createdOrder = await placeOrder({
        userId: currentUser?.uid || `guest-${Date.now()}`,
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: mobile.trim(),
        shippingAddress: address.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pinCode: pinCode.trim(),
        country: country.trim(),
        shippingMethod,
        paymentMethod,
        paymentStatus,
        orderStatus: 'Pending',
        subtotal,
        discountTotal: couponDiscount,
        shippingCost,
        taxTotal,
        grandTotal,
        couponCode: appliedCoupon?.code || 'NONE',
        itemsSummary,
        itemCount: detailedCart.reduce((s, i) => s + i.quantity, 0),
        items: orderItems,
        transactionRef: verifyData.transactionRef || gatewayOrder.gatewayOrderId,
      });

      showToast('Order Confirmed!', `Thank you, ${fullName}! Order ${createdOrder.id} placed.`);
      navigate(`/order-confirmation/${createdOrder.id}`);
    } catch {
      showToast('Checkout Error', 'Unable to process payment verification. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">Secure Boutique Checkout</p>
        <h1 className="font-serif-display text-3xl sm:text-4xl text-[#2C221E] mt-1">
          Complete Your Mikkimama Order
        </h1>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Customer & Payment Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Customer & Shipping Information */}
          <div className="bg-white border border-[#E8DDD4] rounded-xl p-6 space-y-4">
            <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
              1. Shipping Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#2C221E] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ananya Sharma"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2C221E] mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98201 44102"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs font-mono-tabular"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#2C221E] mb-1">
                Email Address (for order updates & receipt) *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#2C221E] mb-1">
                Street Address / House / Flat *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House No., Building Name, Street, Landmark"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#2C221E] mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2C221E] mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2C221E] mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="400050"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2C221E] mb-1">Country *</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Method */}
          <div className="bg-white border border-[#E8DDD4] rounded-xl p-6 space-y-4">
            <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
              2. Delivery Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-lg border cursor-pointer flex items-start justify-between ${
                  shippingMethod === 'Standard Insured Delivery'
                    ? 'border-[#737765] bg-[#F4EFEA]'
                    : 'border-[#E5D9D0] bg-white'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === 'Standard Insured Delivery'}
                    onChange={() => setShippingMethod('Standard Insured Delivery')}
                    className="mt-1 accent-[#737765]"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#2C221E]">Standard Insured Delivery</p>
                    <p className="text-[11px] text-[#6E5D55]">3–5 working days in keepsake box</p>
                  </div>
                </div>
                <span className="font-mono-tabular text-xs font-semibold">
                  {baseShipping === 0 ? 'FREE' : `₹${baseShipping}`}
                </span>
              </label>

              <label
                className={`p-4 rounded-lg border cursor-pointer flex items-start justify-between ${
                  shippingMethod === 'Express Air Boutique Delivery'
                    ? 'border-[#737765] bg-[#F4EFEA]'
                    : 'border-[#E5D9D0] bg-white'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === 'Express Air Boutique Delivery'}
                    onChange={() => setShippingMethod('Express Air Boutique Delivery')}
                    className="mt-1 accent-[#737765]"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#2C221E]">
                      Express Air Boutique Delivery
                    </p>
                    <p className="text-[11px] text-[#6E5D55]">1–2 days priority dispatch</p>
                  </div>
                </div>
                <span className="font-mono-tabular text-xs font-semibold">
                  +₹120
                </span>
              </label>
            </div>
          </div>

          {/* 3. Modular Payment Section */}
          <div className="bg-white border border-[#E8DDD4] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
                3. Payment Method
              </h2>
              <span className="text-[11px] text-[#737765] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                256-Bit Encrypted Verification
              </span>
            </div>

            <div className="space-y-2.5">
              {availablePaymentOptions.map((opt) => {
                const Icon = opt.icon;
                const active = paymentMethod === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`p-3.5 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                      active ? 'border-[#737765] bg-[#F4EFEA]' : 'border-[#E5D9D0] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={active}
                        onChange={() => setPaymentMethod(opt.id)}
                        className="accent-[#737765]"
                      />
                      <Icon className="w-4 h-4 text-[#737765]" />
                      <span className="text-xs font-medium text-[#2C221E]">{opt.label}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            {paymentMethod === 'UPI' && (
              <div className="p-3.5 bg-[#FAF7F2] border border-[#E5D9D0] rounded-md space-y-2">
                <label className="block text-xs font-medium text-[#2C221E]">
                  Enter UPI ID (or pay to {settings.upiId})
                </label>
                <input
                  type="text"
                  value={upiHandle}
                  onChange={(e) => setUpiHandle(e.target.value)}
                  placeholder="yourname@okicici"
                  className="w-full px-3 py-2 bg-white border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary & Submit */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#E8DDD4] rounded-xl p-6 space-y-5 sticky top-24">
            <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
              Your Handmade Order
            </h2>

            <div className="divide-y divide-[#F0E6DE] max-h-72 overflow-y-auto pr-1">
              {detailedCart.map((item) => (
                <div
                  key={`${item.productId}-${item.variant}`}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <ResilientImage
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 rounded object-cover bg-[#F4EFEA]"
                    />
                    <div>
                      <p className="text-xs font-semibold text-[#2C221E]">{item.product.name}</p>
                      <p className="text-[11px] text-[#6E5D55]">
                        {item.variant} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono-tabular text-xs font-semibold text-[#2C221E]">
                    ₹{item.lineTotal}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-[#E8DDD4] text-xs font-mono-tabular text-[#5A4A42]">
              <div className="flex justify-between">
                <span className="font-sans">Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#4D6A46]">
                  <span className="font-sans">Coupon ({appliedCoupon?.code})</span>
                  <span>−₹{couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-sans">Shipping ({shippingMethod})</span>
                <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans">GST (3%)</span>
                <span>₹{taxTotal}</span>
              </div>
              <div className="pt-3 border-t border-[#E8DDD4] flex justify-between items-baseline text-base font-semibold text-[#2C221E]">
                <span className="font-serif-display text-xl">Total Payable</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-semibold uppercase tracking-widest rounded-md transition-colors disabled:opacity-50"
            >
              {submitting
                ? 'Verifying Order & Payment...'
                : `Place Order · ₹${grandTotal}`}
            </button>

            <p className="text-[11px] text-center text-[#7D6B61]">
              Every Mikkimama order includes complimentary gift wrapping and a handwritten studio
              card.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

/* ============================================================================
 * 14. ORDER CONFIRMATION PAGE
 * ==========================================================================*/
export const OrderConfirmationView: React.FC<{
  orderId: string;
  navigate: (path: string) => void;
}> = ({ orderId, navigate }) => {
  const { orders } = useStore();
  const order = orders.find((o) => o.id === orderId) || orders[0];

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-serif-display text-3xl text-[#2C221E]">Order Confirmed</h1>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-[#737765] text-white text-xs rounded-md"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12">
      <div className="bg-white border border-[#E5D9D0] rounded-xl p-6 sm:p-10 space-y-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-[#737765] mx-auto stroke-[1.5]" />
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">
            Handmade With Love · Order Confirmed
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl text-[#2C221E]">
            Thank You, {order.customerName}!
          </h1>
          <p className="text-xs text-[#5A4A42]">
            Your order <span className="font-mono-tabular font-semibold">{order.id}</span> has been
            received at our studio and is being lovingly prepared.
          </p>
        </div>

        <div className="bg-[#FAF7F2] border border-[#E5D9D0] rounded-lg p-5 text-left space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-[#6E5D55]">Order Reference</span>
            <span className="font-mono-tabular font-semibold text-[#2C221E]">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6E5D55]">Payment Method & Status</span>
            <span className="font-mono-tabular font-medium text-[#2C221E]">
              {order.paymentMethod} ({order.paymentStatus})
            </span>
          </div>
          {order.transactionRef && (
            <div className="flex justify-between">
              <span className="text-[#6E5D55]">Transaction Ref</span>
              <span className="font-mono-tabular text-[#2C221E]">{order.transactionRef}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#6E5D55]">Delivery Address</span>
            <span className="text-right text-[#2C221E] max-w-xs">
              {order.shippingAddress}, {order.city}, {order.state} - {order.pinCode}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#E5D9D0]">
            <span className="font-semibold text-[#2C221E]">Items</span>
            <span className="text-right text-[#5A4A42] max-w-xs">{order.itemsSummary}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#E5D9D0] text-sm font-semibold text-[#2C221E] font-mono-tabular">
            <span>Grand Total</span>
            <span>₹{order.grandTotal}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/account')}
            className="px-6 py-2.5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium rounded-md transition-colors"
          >
            Track Order in My Account
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-2.5 border border-[#2C221E] text-[#2C221E] hover:bg-[#F4EFEA] text-xs font-medium rounded-md transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 15. CUSTOMER ACCOUNT & ORDERS PAGE
 * ==========================================================================*/
export const CustomerAccountView: React.FC<{ navigate: (path: string) => void }> = ({
  navigate,
}) => {
  const {
    currentUser,
    signInCustomerWithGoogle,
    logoutUser,
    orders,
    cancelCustomerOrder,
  } = useStore();

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-8 py-10 space-y-10">
      <div className="bg-[#F4EFEA] border border-[#E5D9D0] rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">Customer Portal</p>
          <h1 className="font-serif-display text-3xl sm:text-4xl text-[#2C221E]">
            {currentUser ? `Welcome, ${currentUser.displayName || currentUser.email}` : 'My Mikkimama Account'}
          </h1>
          <p className="text-xs text-[#5A4A42]">
            {currentUser
              ? `Signed in with Google (${currentUser.email})`
              : 'Sign in with Google to sync your wishlist and track your handmade orders across devices.'}
          </p>
        </div>

        <div>
          {currentUser ? (
            <button
              onClick={logoutUser}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#D8C7BE] bg-white text-xs font-medium text-[#2C221E] rounded-md hover:bg-[#EFE6DF]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={signInCustomerWithGoogle}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium rounded-md transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Order History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-display text-2xl text-[#2C221E] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#737765]" />
            <span>Order History & Live Status ({orders.length})</span>
          </h2>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-[#E8DDD4] rounded-xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F2EAE3] pb-3">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono-tabular font-semibold text-sm text-[#2C221E]">
                    {order.id}
                  </span>
                  <span>·</span>
                  <span className="font-mono-tabular text-[#6E5D55]">
                    Placed on {order.createdAt.slice(0, 10)}
                  </span>
                  <span>·</span>
                  <span className="text-[#2C221E] font-medium">
                    Status: {order.orderStatus}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono-tabular text-sm font-semibold text-[#2C221E]">
                    Total: ₹{order.grandTotal}
                  </span>
                  {order.orderStatus === 'Pending' && (
                    <button
                      onClick={() => cancelCustomerOrder(order.id)}
                      className="text-xs text-[#9E584D] hover:underline"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs text-[#5A4A42]">
                <div className="md:col-span-7 space-y-1">
                  <p className="font-semibold text-[#2C221E]">Pieces Ordered</p>
                  <p>{order.itemsSummary}</p>
                </div>
                <div className="md:col-span-5 space-y-1">
                  <p className="font-semibold text-[#2C221E]">Shipping To</p>
                  <p>
                    {order.customerName} — {order.shippingAddress}, {order.city} ({order.pinCode})
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 16. WISHLIST PAGE
 * ==========================================================================*/
export const WishlistView: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { wishlist, products } = useStore();
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">Saved Treasures</p>
        <h1 className="font-serif-display text-3xl sm:text-5xl text-[#2C221E]">
          My Wishlist ({wishlistedProducts.length})
        </h1>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="bg-white border border-[#E8DDD4] rounded-xl p-12 text-center space-y-4">
          <Heart className="w-10 h-10 text-[#B6766C] mx-auto stroke-[1.5]" />
          <p className="font-serif-display text-2xl text-[#2C221E]">
            Your wishlist is currently empty
          </p>
          <p className="text-xs text-[#6E5D55]">
            Tap the heart icon on any Mikkimama piece to save it here for later.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-2.5 bg-[#737765] text-white text-xs rounded-md"
          >
            Explore Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
};

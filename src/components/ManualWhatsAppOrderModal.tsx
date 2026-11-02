import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  X,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ManualOrderRecord } from '../types';
import { ResilientImage } from './ResilientImage';

const SAVED_MANUAL_CUSTOMER_KEY = 'mkm_manual_customer_draft_v1';

interface SavedCustomerDraft {
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  completeAddress: string;
  city: string;
  state: string;
  pinCode: string;
}

export function sanitizeWhatsAppPhone(rawPhone: string): string {
  const digits = (rawPhone || '').replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

export function buildWhatsAppOrderMessage(
  order: ManualOrderRecord,
  originUrl: string
): string {
  const imageRef = order.productImage.startsWith('http')
    ? order.productImage
    : `${originUrl}${order.productImage}`;

  const itemDisplay =
    order.variant && order.variant !== 'Standard'
      ? `${order.productName} (${order.variant})`
      : order.productName;

  return [
    'NEW MANUAL ORDER',
    '',
    `Order No: ${order.id}`,
    '',
    'Customer Details:',
    `Name: ${order.customerName}`,
    `Mobile: ${order.customerMobile}`,
    `Email: ${order.customerEmail}`,
    '',
    'Delivery Address:',
    `${order.completeAddress}`,
    `${order.city}, ${order.state} - ${order.pinCode}`,
    '',
    'Order Details:',
    `Item: ${itemDisplay}`,
    `Product ID: ${order.productSku}`,
    `Quantity: ${order.quantity}`,
    `Price: ₹${order.unitPrice}`,
    `Total Amount: ₹${order.totalAmount}`,
    '',
    'Product Image:',
    `${imageRef}`,
    '',
    'Please process this manual order.',
  ].join('\n');
}

export const ManualWhatsAppOrderModal: React.FC = () => {
  const {
    manualOrderTarget,
    closeManualOrderModal,
    createManualWhatsAppOrder,
    currentUser,
    customers,
    settings,
    showToast,
  } = useStore();

  const [step, setStep] = useState<'form' | 'review' | 'confirmed'>('form');
  const [selectedVariant, setSelectedVariant] = useState<string>('Standard');
  const [quantity, setQuantity] = useState<number>(1);

  const [customerName, setCustomerName] = useState<string>('');
  const [customerMobile, setCustomerMobile] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [completeAddress, setCompleteAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [stateName, setStateName] = useState<string>('');
  const [pinCode, setPinCode] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ManualOrderRecord | null>(null);
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false);

  // Auto-prefill customer details from existing website/account or saved profile
  useEffect(() => {
    if (!manualOrderTarget) return;

    setStep('form');
    setConfirmedOrder(null);
    setFormError('');
    setSelectedVariant(
      manualOrderTarget.variant || manualOrderTarget.product.variants[0] || 'Standard'
    );
    setQuantity(Math.max(1, manualOrderTarget.quantity || 1));

    // 1. Check matching customer record from logged-in user or store customers
    const matchedCustomer = currentUser?.email
      ? customers.find((c) => c.email.toLowerCase() === currentUser.email?.toLowerCase())
      : undefined;

    // 2. Check local saved draft if guest or missing fields
    let savedDraft: Partial<SavedCustomerDraft> = {};
    try {
      const raw = localStorage.getItem(SAVED_MANUAL_CUSTOMER_KEY);
      if (raw) {
        savedDraft = JSON.parse(raw) as Partial<SavedCustomerDraft>;
      }
    } catch {
      // ignore localStorage read errors
    }

    setCustomerName(
      matchedCustomer?.displayName ||
        currentUser?.displayName ||
        savedDraft.customerName ||
        customers[0]?.displayName ||
        ''
    );
    setCustomerMobile(
      matchedCustomer?.phone || savedDraft.customerMobile || customers[0]?.phone || ''
    );
    setCustomerEmail(
      matchedCustomer?.email ||
        currentUser?.email ||
        savedDraft.customerEmail ||
        customers[0]?.email ||
        ''
    );
    setCompleteAddress(
      matchedCustomer?.address || savedDraft.completeAddress || customers[0]?.address || ''
    );
    setCity(matchedCustomer?.city || savedDraft.city || customers[0]?.city || '');
    setStateName(matchedCustomer?.state || savedDraft.state || customers[0]?.state || '');
    setPinCode(matchedCustomer?.pinCode || savedDraft.pinCode || customers[0]?.pinCode || '');
  }, [manualOrderTarget, currentUser, customers]);

  const product = manualOrderTarget?.product;

  // Reuse existing product selling price & automatic calculation: Product Price × Quantity = Total Amount
  const unitPrice = product ? product.salePrice : 0;
  const totalAmount = unitPrice * quantity;

  const adminWhatsAppRaw =
    settings.manualWhatsappNumber?.trim() || settings.supportWhatsapp?.trim() || '';
  const adminWhatsAppDigits = sanitizeWhatsAppPhone(adminWhatsAppRaw);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const previewOrderRecord: ManualOrderRecord | null = useMemo(() => {
    if (!product) return null;
    if (confirmedOrder) return confirmedOrder;
    const nowObj = new Date();
    const dateStamp = `${nowObj.getFullYear()}${String(nowObj.getMonth() + 1).padStart(
      2,
      '0'
    )}${String(nowObj.getDate()).padStart(2, '0')}`;
    return {
      id: `MO-${dateStamp}-PREVIEW`,
      userId: currentUser?.uid || 'guest',
      customerName: customerName.trim(),
      customerMobile: customerMobile.trim(),
      customerEmail: customerEmail.trim(),
      completeAddress: completeAddress.trim(),
      city: city.trim(),
      state: stateName.trim(),
      pinCode: pinCode.trim(),
      productId: product.id,
      productSku: product.sku,
      productName: product.name,
      productImage: product.images[0] || '/assets/products/story-pendant.png',
      variant: selectedVariant,
      quantity,
      unitPrice,
      totalAmount,
      orderType: 'Manual / WhatsApp',
      status: 'Pending',
      createdAt: nowObj.toISOString(),
      updatedAt: nowObj.toISOString(),
    };
  }, [
    product,
    confirmedOrder,
    currentUser,
    customerName,
    customerMobile,
    customerEmail,
    completeAddress,
    city,
    stateName,
    pinCode,
    selectedVariant,
    quantity,
    unitPrice,
    totalAmount,
  ]);

  if (!manualOrderTarget || !product || settings.manualWhatsappOrderEnabled === false) {
    return null;
  }

  const validateDetails = (): boolean => {
    if (!customerName.trim()) {
      setFormError('Please enter your full name.');
      return false;
    }
    const mobileDigits = customerMobile.replace(/\D/g, '');
    if (mobileDigits.length < 10 || mobileDigits.length > 15) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return false;
    }
    if (!completeAddress.trim() || completeAddress.trim().length < 5) {
      setFormError('Please enter your complete delivery address.');
      return false;
    }
    if (!city.trim() || !stateName.trim()) {
      setFormError('Please enter both City and State.');
      return false;
    }
    if (!pinCode.trim() || pinCode.trim().length < 4) {
      setFormError('Please enter a valid PIN Code.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) return;

    try {
      const draft: SavedCustomerDraft = {
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        customerEmail: customerEmail.trim(),
        completeAddress: completeAddress.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pinCode: pinCode.trim(),
      };
      localStorage.setItem(SAVED_MANUAL_CUSTOMER_KEY, JSON.stringify(draft));
    } catch {
      // ignore storage errors
    }

    setStep('review');
  };

  const handleConfirmManualOrder = async () => {
    if (!validateDetails()) return;
    setSubmitting(true);
    try {
      const created = await createManualWhatsAppOrder({
        userId: currentUser?.uid || `guest-${Date.now()}`,
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        customerEmail: customerEmail.trim(),
        completeAddress: completeAddress.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pinCode: pinCode.trim(),
        productId: product.id,
        productSku: product.sku,
        productName: product.name,
        productImage: product.images[0] || '/assets/products/story-pendant.png',
        variant: selectedVariant,
        quantity,
        unitPrice,
        totalAmount,
      });
      setConfirmedOrder(created);
      setStep('confirmed');
      showToast(
        'Manual Order Generated',
        `Order ${created.id} is ready to send on WhatsApp.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMessageText = confirmedOrder
    ? buildWhatsAppOrderMessage(confirmedOrder, originUrl)
    : previewOrderRecord
    ? buildWhatsAppOrderMessage(previewOrderRecord, originUrl)
    : '';

  const whatsappClickToChatUrl = adminWhatsAppDigits
    ? `https://wa.me/${adminWhatsAppDigits}?text=${encodeURIComponent(whatsappMessageText)}`
    : `https://wa.me/?text=${encodeURIComponent(whatsappMessageText)}`;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessageText);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={closeManualOrderModal}
      />

      <div className="relative z-10 bg-[#FAF7F2] border border-[#E5D9D0] rounded-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-xl">
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-[#FAF7F2]/95 backdrop-blur-xs border-b border-[#E5D9D0] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EBF5EE] border border-[#B7DFC2] flex items-center justify-center text-[#1F7A3E]">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#737765] font-semibold">
                Direct Boutique Concierge
              </p>
              <h2 className="font-serif-display text-xl sm:text-2xl font-semibold text-[#2C221E]">
                Manual Order via WhatsApp
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={closeManualOrderModal}
            aria-label="Close manual order modal"
            className="w-8 h-8 rounded-full bg-white border border-[#E5D9D0] flex items-center justify-center text-[#2C221E] hover:text-[#9E584D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="px-5 py-2.5 bg-[#F4EFEA] border-b border-[#E5D9D0] flex items-center justify-between text-[11px] font-medium text-[#6E5D55]">
          <span className={step === 'form' ? 'text-[#2C221E] font-semibold' : ''}>
            1. Customer Details
          </span>
          <span>→</span>
          <span className={step === 'review' ? 'text-[#2C221E] font-semibold' : ''}>
            2. Order Summary Review
          </span>
          <span>→</span>
          <span className={step === 'confirmed' ? 'text-[#1F7A3E] font-semibold' : ''}>
            3. Send on WhatsApp
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Product Summary Card (Always Visible) */}
          <div className="bg-white border border-[#E5D9D0] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F4EFEA] border border-[#E5D9D0] shrink-0">
                <ResilientImage
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-mono-tabular text-[#7D6B61]">
                  Product ID / SKU: <span className="font-semibold text-[#2C221E]">{product.sku}</span>
                </p>
                <h3 className="font-serif-display text-lg font-semibold text-[#2C221E]">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-2 font-mono-tabular text-xs">
                  <span className="font-semibold text-[#2C221E]">Unit Price: ₹{unitPrice}</span>
                  {product.originalPrice > unitPrice && (
                    <span className="text-[#9B8B82] line-through">₹{product.originalPrice}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Automatic Calculation Box */}
            <div className="w-full sm:w-auto bg-[#FAF7F2] border border-[#E5D9D0] rounded-md px-3.5 py-2 text-right font-mono-tabular">
              <p className="text-[11px] text-[#6E5D55]">
                ₹{unitPrice} × {quantity} {quantity === 1 ? 'pc' : 'pcs'}
              </p>
              <p className="text-base font-semibold text-[#2C221E]">Total: ₹{totalAmount}</p>
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-xs text-[#991B1B]">
              {formError}
            </div>
          )}

          {/* STEP 1: COLLECT CUSTOMER DETAILS & QUANTITY */}
          {step === 'form' && (
            <form onSubmit={handleProceedToReview} className="space-y-4">
              {/* Variant & Quantity Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-[#E5D9D0] rounded-lg p-4">
                <div>
                  <label className="block text-xs font-medium text-[#2C221E] mb-1">
                    Select Finish / Variant
                  </label>
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs text-[#2C221E]"
                  >
                    {(product.variants.length > 0 ? product.variants : ['Standard']).map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2C221E] mb-1">
                    Quantity (Auto-calculates Total)
                  </label>
                  <div className="flex items-center justify-between border border-[#D8C7BE] rounded-md bg-[#FAF7F2] px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded bg-white border border-[#E5D9D0] text-sm font-semibold text-[#2C221E] hover:bg-[#F4EFEA]"
                    >
                      −
                    </button>
                    <span className="font-mono-tabular text-xs font-semibold text-[#2C221E]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(Math.max(1, product.stock || 20), q + 1))
                      }
                      className="w-7 h-7 rounded bg-white border border-[#E5D9D0] text-sm font-semibold text-[#2C221E] hover:bg-[#F4EFEA]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer Contact & Delivery Fields */}
              <div className="bg-white border border-[#E5D9D0] rounded-lg p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif-display text-lg font-semibold text-[#2C221E]">
                    Customer & Delivery Information
                  </h4>
                  <span className="text-[11px] text-[#737765]">
                    No online payment gateway required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#2C221E] mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs text-[#2C221E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2C221E] mb-1">
                      Mobile Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      placeholder="+91 98201 44102"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs text-[#2C221E] font-mono-tabular"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2C221E] mb-1">
                    Email ID *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs text-[#2C221E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2C221E] mb-1">
                    Complete Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={completeAddress}
                    onChange={(e) => setCompleteAddress(e.target.value)}
                    placeholder="House/Flat No., Building, Street, Landmark"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs text-[#2C221E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#2C221E] mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs text-[#2C221E]"
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
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs text-[#2C221E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2C221E] mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="400050"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs text-[#2C221E] font-mono-tabular"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeManualOrderModal}
                  className="px-4 py-2.5 border border-[#D8C7BE] bg-white text-[#5A4A42] text-xs font-medium rounded-md hover:bg-[#F4EFEA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors flex items-center gap-2"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Review Manual Order Summary →</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ORDER SUMMARY REVIEW BEFORE SENDING */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E5D9D0] rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#F0E6DE] pb-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#737765] font-semibold">
                      Please Review Your Details
                    </p>
                    <h3 className="font-serif-display text-xl font-semibold text-[#2C221E]">
                      Manual Order Summary
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="inline-flex items-center gap-1 text-xs text-[#737765] hover:text-[#2C221E] underline underline-offset-4"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-[#FAF7F2] rounded-md border border-[#E8DDD4] space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-[#7D6B61] font-semibold">
                      Customer Details
                    </p>
                    <p className="font-semibold text-[#2C221E]">{customerName}</p>
                    <p className="font-mono-tabular text-[#5A4A42]">Mobile: {customerMobile}</p>
                    <p className="text-[#5A4A42]">Email: {customerEmail}</p>
                  </div>

                  <div className="p-3.5 bg-[#FAF7F2] rounded-md border border-[#E8DDD4] space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-[#7D6B61] font-semibold">
                      Delivery Address
                    </p>
                    <p className="text-[#2C221E]">{completeAddress}</p>
                    <p className="text-[#5A4A42]">
                      {city}, {stateName} - <span className="font-mono-tabular">{pinCode}</span>
                    </p>
                  </div>
                </div>

                {/* Product & Price Calculation Breakdown */}
                <div className="p-4 bg-[#FAF7F2] rounded-md border border-[#E8DDD4] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E5D55]">Product / Item Name</span>
                    <span className="font-semibold text-[#2C221E]">
                      {product.name} ({selectedVariant})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E5D55]">Product ID / SKU</span>
                    <span className="font-mono-tabular font-semibold text-[#2C221E]">
                      {product.sku}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E5D55]">Product Selling Price</span>
                    <span className="font-mono-tabular">₹{unitPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E5D55]">Quantity</span>
                    <span className="font-mono-tabular">× {quantity}</span>
                  </div>
                  <div className="pt-2 border-t border-[#E5D9D0] flex items-center justify-between text-sm font-semibold text-[#2C221E]">
                    <span>Total Amount (₹{unitPrice} × {quantity})</span>
                    <span className="font-mono-tabular text-base">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="px-4 py-2.5 border border-[#D8C7BE] bg-white text-[#2C221E] text-xs font-medium rounded-md hover:bg-[#F4EFEA]"
                >
                  ← Back to Edit
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmManualOrder}
                  className="px-6 py-2.5 bg-[#1F7A3E] hover:bg-[#186331] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {submitting ? 'Generating Order Number...' : 'Confirm & Generate Manual Order'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMED MANUAL ORDER + SEND ON WHATSAPP */}
          {step === 'confirmed' && confirmedOrder && (
            <div className="space-y-4">
              <div className="bg-[#EBF5EE] border border-[#B7DFC2] rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1F7A3E] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-[#14532D]">
                    Manual Order Created — Order No:{' '}
                    <span className="font-mono-tabular">{confirmedOrder.id}</span>
                  </p>
                  <p className="text-[#166534]">
                    Your order has been logged with Mikkimama Atelier. Click{' '}
                    <strong>“Send Order on WhatsApp”</strong> below to open WhatsApp with your
                    complete pre-filled order message.
                  </p>
                </div>
              </div>

              {/* Product Image & Reference Card on Confirmation Screen */}
              <div className="bg-white border border-[#E5D9D0] rounded-lg p-4 flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#E5D9D0] bg-[#F4EFEA] shrink-0">
                  <ResilientImage
                    src={confirmedOrder.productImage}
                    alt={confirmedOrder.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs space-y-1">
                  <span className="inline-block text-[10px] uppercase tracking-wider font-semibold text-[#1F7A3E]">
                    Order Type: Manual / WhatsApp
                  </span>
                  <h4 className="font-serif-display text-lg font-semibold text-[#2C221E]">
                    {confirmedOrder.productName}
                  </h4>
                  <p className="font-mono-tabular text-[#6E5D55]">
                    SKU: {confirmedOrder.productSku} · Qty: {confirmedOrder.quantity} · Total: ₹
                    {confirmedOrder.totalAmount}
                  </p>
                </div>
              </div>

              {/* Pre-filled WhatsApp Message Preview */}
              <div className="bg-white border border-[#E5D9D0] rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-[#6E5D55] font-semibold">
                    Pre-Filled WhatsApp Message Preview
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1 text-[11px] text-[#737765] hover:text-[#2C221E]"
                  >
                    {copiedMsg ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#1F7A3E]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-[#FAF7F2] border border-[#E8DDD4] rounded text-[11px] font-mono-tabular text-[#2C221E] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {whatsappMessageText}
                </pre>
              </div>

              {/* Primary WhatsApp Click-to-Chat Action */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeManualOrderModal}
                  className="px-4 py-2.5 border border-[#D8C7BE] bg-white text-[#5A4A42] text-xs font-medium rounded-md hover:bg-[#F4EFEA]"
                >
                  Close Window
                </button>

                <a
                  href={whatsappClickToChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1F7A3E] hover:bg-[#186331] text-white text-xs font-semibold uppercase tracking-wider rounded-md shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Order on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6E5D55] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#737765]" />
                <span>
                  Opens official WhatsApp Click-to-Chat with Mikkimama Concierge ({adminWhatsAppRaw})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

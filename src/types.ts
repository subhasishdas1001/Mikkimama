export type ProductStatus = 'published' | 'draft' | 'archived';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  description: string;
  shortDescription: string;
  images: string[];
  videoUrl?: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  stock: number;
  lowStockThreshold: number;
  soldCount: number;
  variants: string[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  status: ProductStatus;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  customerName: string;
  rating: number;
  comment: string;
  photoUrl: string;
  status: ReviewStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DiscountType = 'percentage' | 'fixed' | 'first_order' | 'min_order' | 'limited_time';

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  applicableCategory: string;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface OrderItem {
  id: string;
  orderId: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  shippingMethod: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  discountTotal: number;
  shippingCost: number;
  taxTotal: number;
  grandTotal: number;
  couponCode: string;
  itemsSummary: string;
  itemCount: number;
  items?: OrderItem[];
  transactionRef?: string;
  orderType?: 'Standard' | 'Manual / WhatsApp';
  productId?: string;
  productSku?: string;
  productName?: string;
  productImage?: string;
  quantity?: number;
  unitPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export type ManualOrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface ManualOrderRecord {
  id: string;
  userId?: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  completeAddress: string;
  city: string;
  state: string;
  pinCode: string;
  productId: string;
  productSku: string;
  productName: string;
  productImage: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  orderType: 'Manual / WhatsApp';
  status: ManualOrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRecord {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  accountStatus: 'Active' | 'VIP' | 'Suspended';
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  variant: string;
  quantity: number;
}

export interface StoreSettings {
  id: string;
  heroHeading: string;
  heroSubtext: string;
  heroPrimaryBtn: string;
  heroSecondaryBtn: string;
  heroImage: string;
  announcementText: string;
  storyHeading: string;
  storyBody: string;
  storyImage: string;
  promoBannerTitle: string;
  promoBannerSubtitle: string;
  promoBannerCode: string;
  codEnabled: boolean;
  upiEnabled: boolean;
  upiId: string;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  cardEnabled: boolean;
  netBankingEnabled: boolean;
  walletEnabled: boolean;
  freeShippingThreshold: number;
  standardShippingRate: number;
  supportEmail: string;
  supportPhone: string;
  supportWhatsapp: string;
  manualWhatsappOrderEnabled?: boolean;
  manualWhatsappNumber?: string;
  instagramHandle: string;
  updatedAt: string;
}

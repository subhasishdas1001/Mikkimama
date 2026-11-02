import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import {
  CartItem,
  Category,
  Coupon,
  CustomerRecord,
  ManualOrderRecord,
  ManualOrderStatus,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  Review,
  ReviewStatus,
  StoreSettings,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_CUSTOMERS,
  INITIAL_MANUAL_ORDERS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
} from '../data/initialStoreData';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'error';
}

interface StoreContextValue {
  // Data state
  products: Product[];
  categories: Category[];
  reviews: Review[];
  coupons: Coupon[];
  orders: Order[];
  manualOrders: ManualOrderRecord[];
  customers: CustomerRecord[];
  settings: StoreSettings;
  isLoading: boolean;

  // Cart & Wishlist & Saved for Later
  cart: CartItem[];
  savedForLater: CartItem[];
  wishlist: string[];
  appliedCoupon: Coupon | null;
  addToCart: (productId: string, variant?: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, variant: string, quantity: number) => void;
  removeFromCart: (productId: string, variant: string) => void;
  saveForLater: (productId: string, variant: string) => void;
  moveToCartFromSaved: (productId: string, variant: string) => void;
  removeSavedForLater: (productId: string, variant: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Customer & Admin Auth
  currentUser: User | null;
  isAdmin: boolean;
  adminProfile: { email: string; name: string } | null;
  signInCustomerWithGoogle: () => Promise<void>;
  loginAdminWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAdminWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => Promise<void>;
  logoutAdmin: () => void;

  // Customer Actions
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  cancelCustomerOrder: (orderId: string) => Promise<void>;
  submitReview: (reviewData: {
    productId: string;
    productName: string;
    customerName: string;
    rating: number;
    comment: string;
    photoUrl: string;
  }) => Promise<void>;

  // Admin CRUD Actions
  saveProduct: (product: Omit<Product, 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
  saveCategory: (category: Omit<Category, 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, orderStatus: OrderStatus, paymentStatus?: PaymentStatus) => Promise<void>;
  moderateReview: (reviewId: string, status: ReviewStatus, featured?: boolean) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  saveCoupon: (coupon: Omit<Coupon, 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  deleteCoupon: (couponId: string) => Promise<void>;
  applyCategoryDiscount: (categoryName: string, discountPercent: number) => Promise<void>;
  updateCustomerStatus: (uid: string, accountStatus: CustomerRecord['accountStatus']) => Promise<void>;
  updateStoreSettings: (newSettings: StoreSettings) => Promise<void>;
  resetDemoStore: () => Promise<void>;

  // Manual WhatsApp Order Flow
  manualOrderTarget: { product: Product; variant: string; quantity: number } | null;
  openManualOrderModal: (product: Product, variant?: string, quantity?: number) => void;
  closeManualOrderModal: () => void;
  createManualWhatsAppOrder: (
    input: Omit<ManualOrderRecord, 'id' | 'orderType' | 'status' | 'createdAt' | 'updatedAt'>
  ) => Promise<ManualOrderRecord>;
  updateManualOrderStatus: (orderId: string, status: ManualOrderStatus) => Promise<void>;

  // UI Helpers
  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'mkm_products_v1',
  CATEGORIES: 'mkm_categories_v1',
  REVIEWS: 'mkm_reviews_v1',
  COUPONS: 'mkm_coupons_v1',
  ORDERS: 'mkm_orders_v1',
  MANUAL_ORDERS: 'mkm_manual_orders_v1',
  CUSTOMERS: 'mkm_customers_v1',
  SETTINGS: 'mkm_settings_v1',
  CART: 'mkm_cart_v1',
  SAVED: 'mkm_saved_v1',
  WISHLIST: 'mkm_wishlist_v1',
  ADMIN_SESSION: 'mkm_admin_session_v1',
};

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore storage errors
  }
  return fallback;
}

function saveLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() =>
    loadLocal(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    loadLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES)
  );
  const [reviews, setReviews] = useState<Review[]>(() =>
    loadLocal(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS)
  );
  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    loadLocal(STORAGE_KEYS.COUPONS, INITIAL_COUPONS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadLocal(STORAGE_KEYS.ORDERS, INITIAL_ORDERS)
  );
  const [manualOrders, setManualOrders] = useState<ManualOrderRecord[]>(() =>
    loadLocal(STORAGE_KEYS.MANUAL_ORDERS, INITIAL_MANUAL_ORDERS)
  );
  const [customers, setCustomers] = useState<CustomerRecord[]>(() =>
    loadLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS)
  );
  const [settings, setSettings] = useState<StoreSettings>(() =>
    loadLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
  );
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadLocal(STORAGE_KEYS.CART, [
      { productId: 'prod-rose-bracelet', variant: '18k Gold Plated (Adjustable)', quantity: 1 },
    ])
  );
  const [savedForLater, setSavedForLater] = useState<CartItem[]>(() =>
    loadLocal(STORAGE_KEYS.SAVED, [])
  );
  const [wishlist, setWishlist] = useState<string[]>(() =>
    loadLocal(STORAGE_KEYS.WISHLIST, ['prod-daisy-necklace', 'prod-sunlit-hoop-earrings'])
  );
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<{ email: string; name: string } | null>(() =>
    loadLocal(STORAGE_KEYS.ADMIN_SESSION, null)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [manualOrderTarget, setManualOrderTarget] = useState<{
    product: Product;
    variant: string;
    quantity: number;
  } | null>(null);

  const showToast = useCallback(
    (title: string, description?: string, type: 'success' | 'info' | 'error' = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync state to localStorage & server store backup
  const syncStoreState = useCallback(
    async (partial: {
      products?: Product[];
      categories?: Category[];
      reviews?: Review[];
      coupons?: Coupon[];
      orders?: Order[];
      manualOrders?: ManualOrderRecord[];
      customers?: CustomerRecord[];
      settings?: StoreSettings;
    }) => {
      if (partial.products) saveLocal(STORAGE_KEYS.PRODUCTS, partial.products);
      if (partial.categories) saveLocal(STORAGE_KEYS.CATEGORIES, partial.categories);
      if (partial.reviews) saveLocal(STORAGE_KEYS.REVIEWS, partial.reviews);
      if (partial.coupons) saveLocal(STORAGE_KEYS.COUPONS, partial.coupons);
      if (partial.orders) saveLocal(STORAGE_KEYS.ORDERS, partial.orders);
      if (partial.manualOrders) saveLocal(STORAGE_KEYS.MANUAL_ORDERS, partial.manualOrders);
      if (partial.customers) saveLocal(STORAGE_KEYS.CUSTOMERS, partial.customers);
      if (partial.settings) saveLocal(STORAGE_KEYS.SETTINGS, partial.settings);

      try {
        await fetch('/api/store/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(partial),
        });
      } catch {
        // Offline or dev reload fallback
      }
    },
    []
  );

  useEffect(() => {
    saveLocal(STORAGE_KEYS.CART, cart);
  }, [cart]);

  useEffect(() => {
    saveLocal(STORAGE_KEYS.SAVED, savedForLater);
  }, [savedForLater]);

  useEffect(() => {
    saveLocal(STORAGE_KEYS.WISHLIST, wishlist);
  }, [wishlist]);

  // Initial load from server store & public Firestore collections
  useEffect(() => {
    let mounted = true;
    async function hydrateStore() {
      try {
        const res = await fetch('/api/store/state');
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
            saveLocal(STORAGE_KEYS.PRODUCTS, data.products);
          }
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
            saveLocal(STORAGE_KEYS.CATEGORIES, data.categories);
          }
          if (Array.isArray(data.reviews) && data.reviews.length > 0) {
            setReviews(data.reviews);
            saveLocal(STORAGE_KEYS.REVIEWS, data.reviews);
          }
          if (Array.isArray(data.coupons) && data.coupons.length > 0) {
            setCoupons(data.coupons);
            saveLocal(STORAGE_KEYS.COUPONS, data.coupons);
          }
          if (Array.isArray(data.orders) && data.orders.length > 0) {
            setOrders(data.orders);
            saveLocal(STORAGE_KEYS.ORDERS, data.orders);
          }
          if (Array.isArray(data.manualOrders) && data.manualOrders.length > 0) {
            setManualOrders(data.manualOrders);
            saveLocal(STORAGE_KEYS.MANUAL_ORDERS, data.manualOrders);
          }
          if (Array.isArray(data.customers) && data.customers.length > 0) {
            setCustomers(data.customers);
            saveLocal(STORAGE_KEYS.CUSTOMERS, data.customers);
          }
          if (data.settings && data.settings.id) {
            const mergedSettings: StoreSettings = {
              ...INITIAL_SETTINGS,
              ...data.settings,
            };
            setSettings(mergedSettings);
            saveLocal(STORAGE_KEYS.SETTINGS, mergedSettings);
          }
        }
      } catch {
        // Use local defaults
      }

      // Also query published products from Firestore if present
      try {
        const prodQuery = query(collection(db, 'products'), where('status', '==', 'published'));
        const snap = await getDocs(prodQuery);
        if (!snap.empty && mounted) {
          const firestoreProducts: Product[] = [];
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            firestoreProducts.push({
              ...(d as Product),
              id: docSnap.id,
              createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : String(d.createdAt || ''),
              updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : String(d.updatedAt || ''),
            });
          });
          if (firestoreProducts.length > 0) {
            setProducts((prev) => {
              const map = new Map(prev.map((p) => [p.id, p]));
              firestoreProducts.forEach((fp) => map.set(fp.id, fp));
              return Array.from(map.values());
            });
          }
        }
      } catch {
        // Fallback to local/server state
      }
    }
    hydrateStore();
    return () => {
      mounted = false;
    };
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user?.email?.toLowerCase() === 'subhasishdas1001@gmail.com' && user.emailVerified) {
        const profile = { email: user.email, name: user.displayName || 'Mikkimama Founder' };
        setAdminProfile(profile);
        saveLocal(STORAGE_KEYS.ADMIN_SESSION, profile);

        // Seed Firestore if empty when verified admin signs in
        try {
          const prodQuery = query(collection(db, 'products'), where('status', '==', 'published'));
          const snap = await getDocs(prodQuery);
          if (snap.empty) {
            const batch = writeBatch(db);
            INITIAL_PRODUCTS.slice(0, 6).forEach((p) => {
              const ref = doc(db, 'products', p.id);
              batch.set(ref, {
                ...p,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            });
            await batch.commit();
          }
        } catch {
          // Non-fatal seed check
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = Boolean(
    adminProfile ||
      (currentUser?.email?.toLowerCase() === 'subhasishdas1001@gmail.com' && currentUser?.emailVerified)
  );

  // Cart & Wishlist Handlers
  const addToCart = useCallback(
    (productId: string, variant?: string, quantity = 1) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      if (product.stock <= 0) {
        showToast('Out of Stock', `${product.name} is currently out of stock.`, 'error');
        return;
      }
      const chosenVariant = variant || product.variants[0] || 'Standard';
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.productId === productId && item.variant === chosenVariant
        );
        if (existingIndex > -1) {
          const next = [...prev];
          const newQty = Math.min(product.stock, next[existingIndex].quantity + quantity);
          next[existingIndex] = { ...next[existingIndex], quantity: newQty };
          return next;
        }
        return [...prev, { productId, variant: chosenVariant, quantity: Math.min(product.stock, quantity) }];
      });
      showToast('Added to Bag', `${product.name} (${chosenVariant}) added to your shopping bag.`);
    },
    [products, showToast]
  );

  const updateCartQuantity = useCallback(
    (productId: string, variant: string, quantity: number) => {
      const product = products.find((p) => p.id === productId);
      const maxStock = product ? product.stock : 99;
      if (quantity <= 0) {
        setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variant === variant)));
        return;
      }
      setCart((prev) =>
        prev.map((i) =>
          i.productId === productId && i.variant === variant
            ? { ...i, quantity: Math.min(maxStock, quantity) }
            : i
        )
      );
    },
    [products]
  );

  const removeFromCart = useCallback(
    (productId: string, variant: string) => {
      setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variant === variant)));
      showToast('Removed from Bag', 'Item removed from your shopping bag.', 'info');
    },
    [showToast]
  );

  const saveForLater = useCallback(
    (productId: string, variant: string) => {
      const target = cart.find((i) => i.productId === productId && i.variant === variant);
      if (!target) return;
      setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variant === variant)));
      setSavedForLater((prev) => {
        if (prev.some((i) => i.productId === productId && i.variant === variant)) return prev;
        return [...prev, target];
      });
      showToast('Saved for Later', 'Moved item to your Saved for Later list.', 'info');
    },
    [cart, showToast]
  );

  const moveToCartFromSaved = useCallback(
    (productId: string, variant: string) => {
      const target = savedForLater.find((i) => i.productId === productId && i.variant === variant);
      if (!target) return;
      setSavedForLater((prev) => prev.filter((i) => !(i.productId === productId && i.variant === variant)));
      addToCart(target.productId, target.variant, target.quantity);
    },
    [savedForLater, addToCart]
  );

  const removeSavedForLater = useCallback((productId: string, variant: string) => {
    setSavedForLater((prev) => prev.filter((i) => !(i.productId === productId && i.variant === variant)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
  }, []);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const product = products.find((p) => p.id === productId);
      const existsInWishlist = wishlist.includes(productId);
      const next = existsInWishlist
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId];
      setWishlist(next);

      if (existsInWishlist) {
        showToast('Removed from Wishlist', product ? `${product.name} removed.` : 'Removed from wishlist.', 'info');
      } else {
        showToast('Saved to Wishlist', product ? `${product.name} saved to your wishlist.` : 'Saved to wishlist.');
      }

      if (currentUser && currentUser.emailVerified) {
        const wishPath = `users/${currentUser.uid}/wishlist`;
        try {
          if (existsInWishlist) {
            await deleteDoc(doc(db, wishPath, productId));
          } else {
            await setDoc(doc(db, wishPath, productId), {
              productId,
              userId: currentUser.uid,
              addedAt: serverTimestamp(),
            });
          }
        } catch {
          // Local wishlist already updated
        }
      }
    },
    [wishlist, products, currentUser, showToast]
  );

  const applyCouponCode = useCallback(
    (code: string): { success: boolean; message: string } => {
      const normalized = code.trim().toUpperCase();
      if (!normalized) {
        return { success: false, message: 'Please enter a coupon code.' };
      }
      const coupon = coupons.find((c) => c.code.toUpperCase() === normalized && c.active);
      if (!coupon) {
        return { success: false, message: 'Invalid or expired coupon code.' };
      }
      const subtotal = cart.reduce((sum, item) => {
        const p = products.find((prod) => prod.id === item.productId);
        return sum + (p ? p.salePrice * item.quantity : 0);
      }, 0);

      if (subtotal < coupon.minOrderAmount) {
        return {
          success: false,
          message: `Minimum order of ₹${coupon.minOrderAmount} required for ${coupon.code}.`,
        };
      }
      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return { success: false, message: 'This coupon has reached its usage limit.' };
      }

      setAppliedCoupon(coupon);
      showToast('Coupon Applied', `Code ${coupon.code} applied to your bag!`);
      return { success: true, message: `Coupon ${coupon.code} applied!` };
    },
    [coupons, cart, products, showToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('Coupon Removed', 'Coupon code removed from order.', 'info');
  }, [showToast]);

  // Auth Actions
  const signInCustomerWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          await setDoc(
            userDocRef,
            {
              uid: user.uid,
              displayName: (user.displayName || 'Mikkimama Patron').slice(0, 120),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch {
          // Profile already exists
        }
        showToast('Welcome to Mikkimama', `Signed in as ${user.displayName || user.email}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Sign-in cancelled';
      showToast('Sign-In Notice', msg, 'info');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const loginAdminWithCredentials = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          const profile = { email: data.admin.email, name: data.admin.name };
          setAdminProfile(profile);
          saveLocal(STORAGE_KEYS.ADMIN_SESSION, profile);
          showToast('Admin Portal Unlocked', `Welcome back, ${profile.name}`);
          return { success: true };
        }
        return { success: false, error: data.error || 'Invalid credentials' };
      } catch {
        return { success: false, error: 'Unable to reach authentication server.' };
      }
    },
    [showToast]
  );

  const loginAdminWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email?.toLowerCase() === 'subhasishdas1001@gmail.com' && user.emailVerified) {
        const profile = { email: user.email, name: user.displayName || 'Mikkimama Founder' };
        setAdminProfile(profile);
        saveLocal(STORAGE_KEYS.ADMIN_SESSION, profile);
        showToast('Admin Portal Unlocked', `Signed in as ${user.email}`);
        return { success: true };
      }
      return {
        success: false,
        error: 'This Google account is not registered as an administrator. Use subhasishdas1001@gmail.com or the Admin Passcode.',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google sign-in was cancelled.',
      };
    }
  }, [showToast]);

  const logoutUser = useCallback(async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
    showToast('Signed Out', 'You have been signed out of your account.', 'info');
  }, [showToast]);

  const logoutAdmin = useCallback(() => {
    setAdminProfile(null);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    showToast('Admin Logged Out', 'Exited Mikkimama Admin Portal.', 'info');
  }, [showToast]);

  // Customer Order Creation (Updates Orders, Inventory, Coupons, and Customers)
  const placeOrder = useCallback(
    async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
      const now = new Date().toISOString();
      const orderId = `MKM-2026-${Math.floor(1051 + Math.random() * 8900)}`;
      const newOrder: Order = {
        ...orderData,
        id: orderId,
        createdAt: now,
        updatedAt: now,
      };

      // 1. Update orders list
      const nextOrders = [newOrder, ...orders];
      setOrders(nextOrders);

      // 2. Decrement product stock & increment soldCount
      const nextProducts = products.map((prod) => {
        const orderedQty = (orderData.items || [])
          .filter((i) => i.productId === prod.id)
          .reduce((acc, i) => acc + i.quantity, 0);
        if (orderedQty > 0) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - orderedQty),
            soldCount: prod.soldCount + orderedQty,
            updatedAt: now,
          };
        }
        return prod;
      });
      setProducts(nextProducts);

      // 3. Update or create customer record
      const existingCustomerIdx = customers.findIndex(
        (c) => c.email.toLowerCase() === orderData.customerEmail.toLowerCase()
      );
      let nextCustomers = [...customers];
      if (existingCustomerIdx > -1) {
        const existing = nextCustomers[existingCustomerIdx];
        const newTotalSpent = existing.totalSpent + orderData.grandTotal;
        nextCustomers[existingCustomerIdx] = {
          ...existing,
          displayName: orderData.customerName,
          phone: orderData.customerPhone,
          address: orderData.shippingAddress,
          city: orderData.city,
          state: orderData.state,
          pinCode: orderData.pinCode,
          totalOrders: existing.totalOrders + 1,
          totalSpent: newTotalSpent,
          lastOrderDate: now.slice(0, 10),
          accountStatus: newTotalSpent >= 3500 ? 'VIP' : existing.accountStatus,
          updatedAt: now,
        };
      } else {
        nextCustomers = [
          {
            uid: orderData.userId || `cust-${Date.now()}`,
            displayName: orderData.customerName,
            email: orderData.customerEmail,
            phone: orderData.customerPhone,
            address: orderData.shippingAddress,
            city: orderData.city,
            state: orderData.state,
            pinCode: orderData.pinCode,
            totalOrders: 1,
            totalSpent: orderData.grandTotal,
            lastOrderDate: now.slice(0, 10),
            accountStatus: orderData.grandTotal >= 3500 ? 'VIP' : 'Active',
            createdAt: now,
            updatedAt: now,
          },
          ...nextCustomers,
        ];
      }
      setCustomers(nextCustomers);

      // 4. Increment coupon usage if applied
      let nextCoupons = coupons;
      if (appliedCoupon) {
        nextCoupons = coupons.map((c) =>
          c.id === appliedCoupon.id ? { ...c, usedCount: c.usedCount + 1, updatedAt: now } : c
        );
        setCoupons(nextCoupons);
      }

      await syncStoreState({
        orders: nextOrders,
        products: nextProducts,
        customers: nextCustomers,
        coupons: nextCoupons,
      });

      // 5. If authenticated with Firebase, also write to Firestore
      if (currentUser && currentUser.emailVerified) {
        try {
          const firestoreOrder = {
            id: orderId,
            userId: currentUser.uid,
            customerName: orderData.customerName.slice(0, 120),
            customerEmail: orderData.customerEmail.slice(0, 160),
            customerPhone: orderData.customerPhone.slice(0, 30),
            shippingAddress: orderData.shippingAddress.slice(0, 400),
            city: orderData.city.slice(0, 100),
            state: orderData.state.slice(0, 100),
            pinCode: orderData.pinCode.slice(0, 20),
            country: orderData.country.slice(0, 80),
            shippingMethod: orderData.shippingMethod.slice(0, 60),
            paymentMethod: orderData.paymentMethod.slice(0, 60),
            paymentStatus: orderData.paymentStatus,
            orderStatus: 'Pending' as OrderStatus,
            subtotal: orderData.subtotal,
            discountTotal: orderData.discountTotal,
            shippingCost: orderData.shippingCost,
            taxTotal: orderData.taxTotal,
            grandTotal: orderData.grandTotal,
            couponCode: (orderData.couponCode || 'NONE').slice(0, 40),
            itemsSummary: orderData.itemsSummary.slice(0, 1000),
            itemCount: orderData.itemCount,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'orders', orderId), firestoreOrder);
        } catch {
          // Persisted in server store
        }
      }

      clearCart();
      return newOrder;
    },
    [orders, products, customers, coupons, appliedCoupon, currentUser, syncStoreState, clearCart]
  );

  const cancelCustomerOrder = useCallback(
    async (orderId: string) => {
      const now = new Date().toISOString();
      const nextOrders = orders.map((o) =>
        o.id === orderId && o.orderStatus === 'Pending'
          ? { ...o, orderStatus: 'Cancelled' as OrderStatus, updatedAt: now }
          : o
      );
      setOrders(nextOrders);
      await syncStoreState({ orders: nextOrders });
      showToast('Order Cancelled', `Order ${orderId} has been cancelled.`, 'info');
    },
    [orders, syncStoreState, showToast]
  );

  const submitReview = useCallback(
    async (reviewData: {
      productId: string;
      productName: string;
      customerName: string;
      rating: number;
      comment: string;
      photoUrl: string;
    }) => {
      const now = new Date().toISOString();
      const revId = `rev-${Date.now()}`;
      const newReview: Review = {
        id: revId,
        productId: reviewData.productId,
        productName: reviewData.productName.slice(0, 160),
        userId: currentUser?.uid || `guest-${Date.now()}`,
        customerName: reviewData.customerName.trim().slice(0, 100),
        rating: Math.max(1, Math.min(5, Number(reviewData.rating))),
        comment: reviewData.comment.trim().slice(0, 1500),
        photoUrl: reviewData.photoUrl || '',
        status: 'pending',
        featured: false,
        createdAt: now,
        updatedAt: now,
      };

      const nextReviews = [newReview, ...reviews];
      setReviews(nextReviews);
      await syncStoreState({ reviews: nextReviews });

      if (currentUser && currentUser.emailVerified) {
        try {
          await setDoc(doc(db, 'reviews', revId), {
            ...newReview,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch {
          // Saved via server store
        }
      }

      showToast(
        'Review Submitted for Moderation',
        'Thank you! Your review will appear once approved by the Mikkimama team.'
      );
    },
    [reviews, currentUser, syncStoreState, showToast]
  );

  // Admin CRUD: Products
  const saveProduct = useCallback(
    async (productInput: Omit<Product, 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Product> => {
      const now = new Date().toISOString();
      const id =
        productInput.id && productInput.id.trim() !== ''
          ? productInput.id
          : `prod-${productInput.slug || Date.now()}`;
      const discountPercent =
        productInput.originalPrice > productInput.salePrice && productInput.originalPrice > 0
          ? Math.round(
              ((productInput.originalPrice - productInput.salePrice) / productInput.originalPrice) * 100
            )
          : 0;

      const existing = products.find((p) => p.id === id);
      const saved: Product = {
        ...productInput,
        id,
        slug:
          productInput.slug
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-|-$/g, '') || `item-${Date.now()}`,
        discountPercent,
        createdAt: existing ? existing.createdAt : now,
        updatedAt: now,
      };

      const nextProducts = existing
        ? products.map((p) => (p.id === id ? saved : p))
        : [saved, ...products];

      // Recalculate category counts
      const nextCategories = categories.map((cat) => ({
        ...cat,
        productCount: nextProducts.filter((p) => p.category === cat.name && p.status === 'published').length,
      }));

      setProducts(nextProducts);
      setCategories(nextCategories);
      await syncStoreState({ products: nextProducts, categories: nextCategories });

      if (currentUser?.email?.toLowerCase() === 'subhasishdas1001@gmail.com' && currentUser.emailVerified) {
        try {
          await setDoc(doc(db, 'products', id), {
            ...saved,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `products/${id}`);
        }
      }

      showToast(existing ? 'Product Updated' : 'Product Added', `${saved.name} saved to catalog.`);
      return saved;
    },
    [products, categories, currentUser, syncStoreState, showToast]
  );

  const deleteProduct = useCallback(
    async (productId: string) => {
      const target = products.find((p) => p.id === productId);
      const nextProducts = products.filter((p) => p.id !== productId);
      const nextCategories = categories.map((cat) => ({
        ...cat,
        productCount: nextProducts.filter((p) => p.category === cat.name && p.status === 'published').length,
      }));
      setProducts(nextProducts);
      setCategories(nextCategories);
      await syncStoreState({ products: nextProducts, categories: nextCategories });

      if (currentUser?.email?.toLowerCase() === 'subhasishdas1001@gmail.com' && currentUser.emailVerified) {
        try {
          await deleteDoc(doc(db, 'products', productId));
        } catch {
          // Deleted from store state
        }
      }

      showToast('Product Deleted', target ? `${target.name} removed from store.` : 'Product deleted.', 'info');
    },
    [products, categories, currentUser, syncStoreState, showToast]
  );

  // Admin CRUD: Categories
  const saveCategory = useCallback(
    async (categoryInput: Omit<Category, 'createdAt' | 'updatedAt'> & { id?: string }) => {
      const now = new Date().toISOString();
      const id =
        categoryInput.id && categoryInput.id.trim() !== ''
          ? categoryInput.id
          : `cat-${Date.now()}`;
      const existing = categories.find((c) => c.id === id);
      const productCount = products.filter(
        (p) => p.category === categoryInput.name && p.status === 'published'
      ).length;

      const saved: Category = {
        ...categoryInput,
        id,
        slug:
          categoryInput.slug
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-|-$/g, '') || `category-${Date.now()}`,
        productCount,
        createdAt: existing ? existing.createdAt : now,
        updatedAt: now,
      };

      const nextCategories = existing
        ? categories.map((c) => (c.id === id ? saved : c))
        : [...categories, saved];
      setCategories(nextCategories);
      await syncStoreState({ categories: nextCategories });
      showToast(existing ? 'Category Updated' : 'Category Created', `${saved.name} saved.`);
    },
    [categories, products, syncStoreState, showToast]
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      const nextCategories = categories.filter((c) => c.id !== categoryId);
      setCategories(nextCategories);
      await syncStoreState({ categories: nextCategories });
      showToast('Category Deleted', 'Category removed from store.', 'info');
    },
    [categories, syncStoreState, showToast]
  );

  // Admin: Order Management
  const updateOrderStatus = useCallback(
    async (orderId: string, orderStatus: OrderStatus, paymentStatus?: PaymentStatus) => {
      const now = new Date().toISOString();
      const nextOrders = orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus,
              paymentStatus: paymentStatus || o.paymentStatus,
              updatedAt: now,
            }
          : o
      );
      setOrders(nextOrders);

      // Also sync manualOrders if this is a Manual WhatsApp order
      const validManualStatuses: ManualOrderStatus[] = [
        'Pending',
        'Confirmed',
        'Processing',
        'Shipped',
        'Delivered',
        'Cancelled',
      ];
      let nextManualOrders = manualOrders;
      if (validManualStatuses.includes(orderStatus as ManualOrderStatus)) {
        nextManualOrders = manualOrders.map((mo) =>
          mo.id === orderId
            ? { ...mo, status: orderStatus as ManualOrderStatus, updatedAt: now }
            : mo
        );
        setManualOrders(nextManualOrders);
      }

      await syncStoreState({ orders: nextOrders, manualOrders: nextManualOrders });
      showToast('Order Updated', `Order ${orderId} marked as ${orderStatus}.`);
    },
    [orders, manualOrders, syncStoreState, showToast]
  );

  // Manual WhatsApp Order Modal & Actions
  const openManualOrderModal = useCallback(
    (product: Product, variant?: string, quantity = 1) => {
      const chosenVariant = variant || product.variants[0] || 'Standard';
      const chosenQty = Math.max(1, Math.min(product.stock || 99, quantity));
      setManualOrderTarget({ product, variant: chosenVariant, quantity: chosenQty });
    },
    []
  );

  const closeManualOrderModal = useCallback(() => {
    setManualOrderTarget(null);
  }, []);

  const createManualWhatsAppOrder = useCallback(
    async (
      input: Omit<ManualOrderRecord, 'id' | 'orderType' | 'status' | 'createdAt' | 'updatedAt'>
    ): Promise<ManualOrderRecord> => {
      const nowObj = new Date();
      const now = nowObj.toISOString();
      const dateStamp = `${nowObj.getFullYear()}${String(nowObj.getMonth() + 1).padStart(2, '0')}${String(
        nowObj.getDate()
      ).padStart(2, '0')}`;

      // Generate unique non-conflicting Manual Order Number: MO-YYYYMMDD-XXXX
      const existingSeqNumbers = manualOrders
        .map((mo) => {
          const parts = mo.id.split('-');
          const num = parseInt(parts[parts.length - 1] || '0', 10);
          return Number.isFinite(num) ? num : 0;
        });
      const maxSeq = existingSeqNumbers.length > 0 ? Math.max(...existingSeqNumbers) : 0;
      let nextSeq = maxSeq + 1;
      let manualOrderId = `MO-${dateStamp}-${String(nextSeq).padStart(4, '0')}`;
      while (
        manualOrders.some((mo) => mo.id === manualOrderId) ||
        orders.some((o) => o.id === manualOrderId)
      ) {
        nextSeq += 1;
        manualOrderId = `MO-${dateStamp}-${String(nextSeq).padStart(4, '0')}`;
      }

      // Reuse product selling price from existing product system for accuracy
      const matchedProduct = products.find((p) => p.id === input.productId);
      const unitSellingPrice = matchedProduct ? matchedProduct.salePrice : input.unitPrice;
      const calculatedTotalAmount = unitSellingPrice * input.quantity;

      const createdManualOrder: ManualOrderRecord = {
        ...input,
        id: manualOrderId,
        unitPrice: unitSellingPrice,
        totalAmount: calculatedTotalAmount,
        orderType: 'Manual / WhatsApp',
        status: 'Pending',
        createdAt: now,
        updatedAt: now,
      };

      const nextManualOrders = [createdManualOrder, ...manualOrders];
      setManualOrders(nextManualOrders);

      // Also add to standard Orders list with orderType: 'Manual / WhatsApp' so it is visible in all Admin Order views
      const mappedOrder: Order = {
        id: manualOrderId,
        userId: input.userId || currentUser?.uid || `guest-${Date.now()}`,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerMobile,
        shippingAddress: input.completeAddress,
        city: input.city,
        state: input.state,
        pinCode: input.pinCode,
        country: 'India',
        shippingMethod: 'Manual WhatsApp Order Dispatch',
        paymentMethod: 'Manual / WhatsApp',
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        subtotal: calculatedTotalAmount,
        discountTotal: 0,
        shippingCost: 0,
        taxTotal: 0,
        grandTotal: calculatedTotalAmount,
        couponCode: 'NONE',
        itemsSummary: `${input.productName} (${input.variant}) ×${input.quantity}`,
        itemCount: input.quantity,
        transactionRef: manualOrderId,
        orderType: 'Manual / WhatsApp',
        productSku: input.productSku,
        productImage: input.productImage,
        unitPrice: unitSellingPrice,
        items: [
          {
            id: `item-${manualOrderId}-1`,
            orderId: manualOrderId,
            userId: input.userId || currentUser?.uid || `guest-${Date.now()}`,
            productId: input.productId,
            productName: input.productName,
            productImage: input.productImage,
            variant: input.variant,
            quantity: input.quantity,
            unitPrice: unitSellingPrice,
            lineTotal: calculatedTotalAmount,
            createdAt: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      const nextOrders = [mappedOrder, ...orders];
      setOrders(nextOrders);

      await syncStoreState({
        manualOrders: nextManualOrders,
        orders: nextOrders,
      });

      return createdManualOrder;
    },
    [manualOrders, orders, products, currentUser, syncStoreState]
  );

  const updateManualOrderStatus = useCallback(
    async (orderId: string, status: ManualOrderStatus) => {
      const now = new Date().toISOString();
      const nextManualOrders = manualOrders.map((mo) =>
        mo.id === orderId ? { ...mo, status, updatedAt: now } : mo
      );
      setManualOrders(nextManualOrders);

      const nextOrders = orders.map((o) =>
        o.id === orderId ? { ...o, orderStatus: status as OrderStatus, updatedAt: now } : o
      );
      setOrders(nextOrders);

      await syncStoreState({
        manualOrders: nextManualOrders,
        orders: nextOrders,
      });
      showToast('Manual Order Updated', `Manual order ${orderId} status set to ${status}.`);
    },
    [manualOrders, orders, syncStoreState, showToast]
  );

  // Admin: Review Moderation
  const moderateReview = useCallback(
    async (reviewId: string, status: ReviewStatus, featured?: boolean) => {
      const now = new Date().toISOString();
      const nextReviews = reviews.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              status,
              featured: featured !== undefined ? featured : r.featured,
              updatedAt: now,
            }
          : r
      );

      // Update product rating & reviewCount based on approved reviews
      const targetReview = reviews.find((r) => r.id === reviewId);
      let nextProducts = products;
      if (targetReview) {
        const approvedForProduct = nextReviews.filter(
          (r) => r.productId === targetReview.productId && r.status === 'approved'
        );
        if (approvedForProduct.length > 0) {
          const avg =
            approvedForProduct.reduce((sum, r) => sum + r.rating, 0) / approvedForProduct.length;
          nextProducts = products.map((p) =>
            p.id === targetReview.productId
              ? {
                  ...p,
                  rating: Number(avg.toFixed(1)),
                  reviewCount: Math.max(p.reviewCount, approvedForProduct.length),
                }
              : p
          );
          setProducts(nextProducts);
        }
      }

      setReviews(nextReviews);
      await syncStoreState({ reviews: nextReviews, products: nextProducts });
      showToast('Review Updated', `Review moderation status updated to ${status}.`);
    },
    [reviews, products, syncStoreState, showToast]
  );

  const deleteReview = useCallback(
    async (reviewId: string) => {
      const nextReviews = reviews.filter((r) => r.id !== reviewId);
      setReviews(nextReviews);
      await syncStoreState({ reviews: nextReviews });
      showToast('Review Deleted', 'Customer review permanently removed.', 'info');
    },
    [reviews, syncStoreState, showToast]
  );

  // Admin: Coupons & Discounts
  const saveCoupon = useCallback(
    async (couponInput: Omit<Coupon, 'createdAt' | 'updatedAt'> & { id?: string }) => {
      const now = new Date().toISOString();
      const id =
        couponInput.id && couponInput.id.trim() !== '' ? couponInput.id : `coup-${Date.now()}`;
      const existing = coupons.find((c) => c.id === id);
      const saved: Coupon = {
        ...couponInput,
        id,
        code: couponInput.code.trim().toUpperCase(),
        createdAt: existing ? existing.createdAt : now,
        updatedAt: now,
      };
      const nextCoupons = existing
        ? coupons.map((c) => (c.id === id ? saved : c))
        : [saved, ...coupons];
      setCoupons(nextCoupons);
      await syncStoreState({ coupons: nextCoupons });
      showToast(existing ? 'Coupon Updated' : 'Coupon Created', `Coupon ${saved.code} is ready.`);
    },
    [coupons, syncStoreState, showToast]
  );

  const deleteCoupon = useCallback(
    async (couponId: string) => {
      const nextCoupons = coupons.filter((c) => c.id !== couponId);
      setCoupons(nextCoupons);
      await syncStoreState({ coupons: nextCoupons });
      showToast('Coupon Deleted', 'Coupon removed.', 'info');
    },
    [coupons, syncStoreState, showToast]
  );

  const applyCategoryDiscount = useCallback(
    async (categoryName: string, discountPercent: number) => {
      const clamped = Math.max(0, Math.min(80, Math.round(discountPercent)));
      const now = new Date().toISOString();
      const nextProducts = products.map((p) => {
        if (categoryName === 'All' || p.category === categoryName) {
          const newSalePrice = Math.max(1, Math.round(p.originalPrice * (1 - clamped / 100)));
          return {
            ...p,
            salePrice: newSalePrice,
            discountPercent: clamped,
            updatedAt: now,
          };
        }
        return p;
      });
      setProducts(nextProducts);
      await syncStoreState({ products: nextProducts });
      showToast(
        'Discount Campaign Applied',
        `Applied ${clamped}% OFF across ${categoryName === 'All' ? 'all products' : categoryName}.`
      );
    },
    [products, syncStoreState, showToast]
  );

  const updateCustomerStatus = useCallback(
    async (uid: string, accountStatus: CustomerRecord['accountStatus']) => {
      const now = new Date().toISOString();
      const nextCustomers = customers.map((c) =>
        c.uid === uid ? { ...c, accountStatus, updatedAt: now } : c
      );
      setCustomers(nextCustomers);
      await syncStoreState({ customers: nextCustomers });
      showToast('Customer Updated', `Customer status set to ${accountStatus}.`);
    },
    [customers, syncStoreState, showToast]
  );

  const updateStoreSettings = useCallback(
    async (newSettings: StoreSettings) => {
      const updated = { ...newSettings, updatedAt: new Date().toISOString() };
      setSettings(updated);
      await syncStoreState({ settings: updated });

      if (currentUser?.email?.toLowerCase() === 'subhasishdas1001@gmail.com' && currentUser.emailVerified) {
        try {
          await setDoc(doc(db, 'settings', 'storefront'), {
            ...updated,
            updatedAt: serverTimestamp(),
          });
        } catch {
          // Saved via server store
        }
      }

      showToast('Store Settings Saved', 'Your storefront changes are now live.');
    },
    [currentUser, syncStoreState, showToast]
  );

  const resetDemoStore = useCallback(async () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setReviews(INITIAL_REVIEWS);
    setCoupons(INITIAL_COUPONS);
    setOrders(INITIAL_ORDERS);
    setManualOrders(INITIAL_MANUAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setSettings(INITIAL_SETTINGS);
    await syncStoreState({
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      reviews: INITIAL_REVIEWS,
      coupons: INITIAL_COUPONS,
      orders: INITIAL_ORDERS,
      manualOrders: INITIAL_MANUAL_ORDERS,
      customers: INITIAL_CUSTOMERS,
      settings: INITIAL_SETTINGS,
    });
    showToast('Store Reset Complete', 'Restored original Mikkimama boutique catalog and settings.');
  }, [syncStoreState, showToast]);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        reviews,
        coupons,
        orders,
        manualOrders,
        customers,
        settings,
        isLoading,
        cart,
        savedForLater,
        wishlist,
        appliedCoupon,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        saveForLater,
        moveToCartFromSaved,
        removeSavedForLater,
        clearCart,
        toggleWishlist,
        applyCouponCode,
        removeCoupon,
        currentUser,
        isAdmin,
        adminProfile,
        signInCustomerWithGoogle,
        loginAdminWithCredentials,
        loginAdminWithGoogle,
        logoutUser,
        logoutAdmin,
        placeOrder,
        cancelCustomerOrder,
        submitReview,
        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        updateOrderStatus,
        moderateReview,
        deleteReview,
        saveCoupon,
        deleteCoupon,
        applyCategoryDiscount,
        updateCustomerStatus,
        updateStoreSettings,
        resetDemoStore,
        manualOrderTarget,
        openManualOrderModal,
        closeManualOrderModal,
        createManualWhatsAppOrder,
        updateManualOrderStatus,
        toasts,
        showToast,
        dismissToast,
        quickViewProduct,
        setQuickViewProduct,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

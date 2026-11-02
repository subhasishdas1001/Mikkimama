import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Check,
  CreditCard,
  Edit3,
  Eye,
  FolderKanban,
  Home,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Percent,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  Category,
  Coupon,
  CustomerRecord,
  DiscountType,
  ManualOrderRecord,
  ManualOrderStatus,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductStatus,
} from '../types';
import { ResilientImage } from '../components/ResilientImage';
import { buildWhatsAppOrderMessage, sanitizeWhatsAppPhone } from '../components/ManualWhatsAppOrderModal';

type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'manual-orders'
  | 'customers'
  | 'reviews'
  | 'coupons'
  | 'discounts'
  | 'payments'
  | 'inventory'
  | 'analytics'
  | 'homepage'
  | 'settings';

const STUDIO_IMAGE_PRESETS = [
  { label: 'Hero Botanical Hoops', url: '/assets/products/hero-earrings.png' },
  { label: 'Baby’s Breath Pendant', url: '/assets/products/story-pendant.png' },
  { label: 'Meadow Daisy Necklace', url: '/assets/products/daisy-necklace.png' },
  { label: 'Blush Heart Studs', url: '/assets/products/pink-floral-studs.png' },
  { label: 'Wildflower Coaster', url: '/assets/products/wildflower-coaster.png' },
  { label: 'Teardrop Rose Necklace', url: '/assets/products/rose-necklace.png' },
  { label: 'Lavender Heart Studs', url: '/assets/products/purple-heart-studs.png' },
  { label: 'Floral Initial Keyring', url: '/assets/products/floral-keyring.png' },
  { label: 'Layered Necklaces', url: '/assets/products/layered-necklaces.png' },
  { label: 'Gold Botanical Rings', url: '/assets/products/botanical-rings.png' },
  { label: 'Ceramic Dish Earrings', url: '/assets/products/ceramic-dish-earrings.png' },
  { label: 'Worn Gold Pendant', url: '/assets/products/worn-gold-pendant.png' },
  { label: 'Silk Stud Earrings', url: '/assets/products/silk-stud-earrings.png' },
  { label: 'Twin Heart Coasters', url: '/assets/products/heart-coaster-set.png' },
  { label: 'Initial Keyrings Duo', url: '/assets/products/initial-keyrings-duo.png' },
  { label: 'Gold Rim Vanity Tray', url: '/assets/products/gold-rim-tray.png' },
];

/* ============================================================================
 * 29. ADMIN LOGIN VIEW (/admin/login)
 * ==========================================================================*/
export const AdminLoginView: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { isAdmin, loginAdminWithCredentials, loginAdminWithGoogle } = useStore();
  const [email, setEmail] = useState('subhasishdas1001@gmail.com');
  const [password, setPassword] = useState('mikkimama2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await loginAdminWithCredentials(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  const handleGoogleAdmin = async () => {
    setError('');
    setLoading(true);
    const res = await loginAdminWithGoogle();
    setLoading(false);
    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.error || 'Google authentication failed');
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 bg-[#FAF7F2]">
      <div className="max-w-md w-full bg-white border border-[#E5D9D0] rounded-xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-full bg-[#F4EFEA] border border-[#E5D9D0] flex items-center justify-center mx-auto text-[#737765]">
            <Lock className="w-5 h-5" />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#737765]">Protected Area</p>
          <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
            Mikkimama Admin Portal
          </h1>
          <p className="text-xs text-[#6E5D55]">
            Sign in to manage products, inventory, orders, reviews, coupons, and homepage content.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-xs text-[#991B1B]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#2C221E] mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs text-[#2C221E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2C221E] mb-1">Admin Passcode</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs text-[#2C221E] font-mono-tabular"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-semibold uppercase tracking-widest rounded-md transition-colors"
          >
            {loading ? 'Signing In...' : 'Enter Admin Dashboard'}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#E8DDD4]" />
          <span className="flex-shrink mx-3 text-[11px] text-[#8C7A70] uppercase">or</span>
          <div className="flex-grow border-t border-[#E8DDD4]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleAdmin}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[#FAF7F2] hover:bg-[#EFE6DF] border border-[#D8C7BE] text-[#2C221E] text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-[#737765]" />
          <span>Sign In with Google Admin Account</span>
        </button>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-[#6E5D55] hover:text-[#2C221E] underline underline-offset-4"
          >
            ← Return to Customer Storefront
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 12–21. COMPLETE ADMIN DASHBOARD (/admin/dashboard)
 * ==========================================================================*/
export const AdminDashboardView: React.FC<{ navigate: (path: string) => void }> = ({
  navigate,
}) => {
  const {
    isAdmin,
    adminProfile,
    logoutAdmin,
    products,
    categories,
    orders,
    manualOrders,
    customers,
    reviews,
    coupons,
    settings,
    saveProduct,
    deleteProduct,
    saveCategory,
    deleteCategory,
    updateOrderStatus,
    updateManualOrderStatus,
    moderateReview,
    deleteReview,
    saveCoupon,
    deleteCoupon,
    applyCategoryDiscount,
    updateCustomerStatus,
    updateStoreSettings,
    resetDemoStore,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Product Form Modal State
  const [editingProduct, setEditingProduct] = useState<
    (Omit<Product, 'createdAt' | 'updatedAt'> & { id?: string }) | null
  >(null);
  const [customImageInput, setCustomImageInput] = useState('');

  // Category Form State
  const [editingCategory, setEditingCategory] = useState<
    (Omit<Category, 'createdAt' | 'updatedAt'> & { id?: string }) | null
  >(null);

  // Order Detail Modal State
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);

  // Customer Profile Modal State
  const [inspectingCustomer, setInspectingCustomer] = useState<CustomerRecord | null>(null);

  // Coupon Form State
  const [editingCoupon, setEditingCoupon] = useState<
    (Omit<Coupon, 'createdAt' | 'updatedAt'> & { id?: string }) | null
  >(null);

  // Discounts Campaign State
  const [campaignCategory, setCampaignCategory] = useState<string>('All');
  const [campaignPercent, setCampaignPercent] = useState<number>(25);

  // Homepage & Store Settings Draft State
  const [draftSettings, setDraftSettings] = useState(settings);
  const [whatsappNumberError, setWhatsappNumberError] = useState<string>('');
  const [inspectingManualOrder, setInspectingManualOrder] = useState<ManualOrderRecord | null>(null);

  // Payment Gateway Server Status
  const [gatewayStatus, setGatewayStatus] = useState<{
    gatewayProvider: string;
    razorpayConfigured: boolean;
    mode: string;
    publicKeyPreview: string;
    serverVerificationReady: boolean;
  } | null>(null);

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  useEffect(() => {
    fetch('/api/payments/config')
      .then((r) => r.json())
      .then((d) => setGatewayStatus(d))
      .catch(() => null);
  }, []);

  if (!isAdmin) {
    return <AdminLoginView navigate={navigate} />;
  }

  // Computed Store KPIs
  const totalSales = orders
    .filter((o) => o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded')
    .reduce((sum, o) => sum + o.grandTotal, 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;
  const totalProductsSold = products.reduce((sum, p) => sum + p.soldCount, 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);
  const pendingReviews = reviews.filter((r) => r.status === 'pending');

  const navItems: Array<{ id: AdminTab; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: ShoppingBag, badge: products.length },
    { id: 'categories', label: 'Categories', icon: FolderKanban, badge: categories.length },
    { id: 'orders', label: 'Orders', icon: Package, badge: orders.length },
    {
      id: 'manual-orders',
      label: 'Manual WhatsApp Orders',
      icon: MessageCircle,
      badge: manualOrders.length,
    },
    { id: 'customers', label: 'Customers', icon: Users, badge: customers.length },
    { id: 'reviews', label: 'Reviews', icon: Star, badge: pendingReviews.length || undefined },
    { id: 'coupons', label: 'Coupons', icon: Tag, badge: coupons.length },
    { id: 'discounts', label: 'Discounts', icon: Percent },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Layers,
      badge: lowStockProducts.length || undefined,
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'homepage', label: 'Homepage CMS', icon: Home },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSaveManualWhatsAppConfig = async (
    nextEnabled: boolean,
    nextRawNumber: string
  ) => {
    const cleanedDigits = nextRawNumber.replace(/\D/g, '');
    if (cleanedDigits.length < 10 || cleanedDigits.length > 15) {
      setWhatsappNumberError(
        'Please enter a valid WhatsApp number with 10 to 15 digits (e.g., +91 98204 51290).'
      );
      showToast(
        'Invalid WhatsApp Number',
        'Please enter a valid 10–15 digit WhatsApp number.',
        'error'
      );
      return;
    }
    setWhatsappNumberError('');
    const updatedSettings = {
      ...draftSettings,
      manualWhatsappOrderEnabled: nextEnabled,
      manualWhatsappNumber: nextRawNumber.trim(),
    };
    setDraftSettings(updatedSettings);
    await updateStoreSettings(updatedSettings);
  };

  const openNewProductModal = () => {
    setEditingProduct({
      id: '',
      name: '',
      slug: '',
      sku: `MKM-${Math.floor(100 + Math.random() * 900)}`,
      category: categories[0]?.name || 'Handmade Jewellery',
      shortDescription: '',
      description: '',
      images: ['/assets/products/daisy-necklace.png'],
      videoUrl: '',
      originalPrice: 1299,
      salePrice: 899,
      discountPercent: 31,
      stock: 15,
      lowStockThreshold: 4,
      soldCount: 0,
      variants: ['18k Gold Plated', 'Rose Gold Vermeil'],
      tags: ['Handmade', 'Botanical'],
      seoTitle: '',
      seoDescription: '',
      featured: true,
      bestSeller: false,
      newArrival: true,
      status: 'published',
      rating: 5.0,
      reviewCount: 1,
    });
  };

  const handleProductFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingProduct) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditingProduct((prev) =>
            prev
              ? { ...prev, images: [...prev.images, reader.result as string].slice(0, 8) }
              : prev
          );
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleHeroImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'heroImage' | 'storyImage'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDraftSettings((prev) => ({ ...prev, [field]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] text-[#2C221E] flex flex-col lg:flex-row">
      {/* Sidebar Navigation (260px) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#231C18] text-[#FAF7F2] flex flex-col justify-between transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
            <div>
              <span className="font-serif-display text-2xl font-semibold tracking-tight text-white">
                Mikkimama
              </span>
              <span className="ml-2 text-[10px] uppercase tracking-widest text-[#C5A059]">
                Admin
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#737765] text-white'
                      : 'text-[#D8C7BE] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="font-mono-tabular text-[11px] opacity-80">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-[#D8C7BE] hover:bg-white/5 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Live Storefront</span>
          </button>
          <button
            onClick={() => {
              logoutAdmin();
              navigate('/');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-[#F87171] hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract for Admin Workspace */}
        <header className="h-16 bg-white border-b border-[#E5D9D0] px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#2C221E]"
              aria-label="Open admin sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-[#6E5D55]">
              <span>Admin</span>
              <span>/</span>
              <span className="font-semibold text-[#2C221E] capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-[#6E5D55]">
              {adminProfile?.email || 'subhasishdas1001@gmail.com'}
            </span>
            <button
              onClick={openNewProductModal}
              className="px-3.5 py-2 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium rounded-md flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="p-4 sm:p-8 max-w-[1360px] w-full mx-auto space-y-8">
          {/* =================================================================
           * TAB 1: DASHBOARD
           * ================================================================*/}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
                    Atelier Command Overview
                  </h1>
                  <p className="text-xs text-[#6E5D55]">
                    Real-time store performance, inventory alerts, and order fulfillment queue.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('homepage')}
                    className="px-4 py-2 bg-white border border-[#D8C7BE] text-xs font-medium rounded-md hover:border-[#2C221E]"
                  >
                    Edit Homepage CMS
                  </button>
                </div>
              </div>

              {/* 6 KPI Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Total Sales', value: `₹${totalSales.toLocaleString('en-IN')}`, sub: '+18.4% vs last month' },
                  { label: 'Total Orders', value: String(totalOrdersCount), sub: '100% insured dispatch' },
                  { label: 'Customers', value: String(customers.length), sub: '2 VIP patrons' },
                  { label: 'Avg. Order Value', value: `₹${avgOrderValue}`, sub: 'Free ship > ₹999' },
                  { label: 'Products Sold', value: String(totalProductsSold), sub: `${products.length} active SKUs` },
                  { label: 'Conversion Rate', value: '4.6%', sub: 'Boutique D2C benchmark' },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="bg-white border border-[#E5D9D0] rounded-lg p-4 space-y-1"
                  >
                    <p className="text-[11px] text-[#6E5D55] uppercase tracking-wider">
                      {kpi.label}
                    </p>
                    <p className="font-mono-tabular text-2xl font-semibold text-[#2C221E]">
                      {kpi.value}
                    </p>
                    <p className="text-[11px] text-[#737765]">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Orders Table */}
                <div className="lg:col-span-8 bg-white border border-[#E5D9D0] rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-[#E5D9D0] flex items-center justify-between">
                    <h2 className="font-serif-display text-xl font-semibold text-[#2C221E]">
                      Recent Customer Orders
                    </h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-[#737765] hover:underline"
                    >
                      Manage All Orders →
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#E5D9D0] bg-[#FAF7F2] text-[#6E5D55]">
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4 text-right">Total</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0E6DE]">
                        {orders.slice(0, 5).map((ord) => (
                          <tr
                            key={ord.id}
                            onClick={() => setInspectingOrder(ord)}
                            className="hover:bg-[#FAF7F2] cursor-pointer"
                          >
                            <td className="py-3 px-4 font-mono-tabular font-semibold">{ord.id}</td>
                            <td className="py-3 px-4">{ord.customerName}</td>
                            <td className="py-3 px-4 font-mono-tabular text-[#6E5D55]">
                              {ord.createdAt.slice(0, 10)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono-tabular font-semibold">
                              ₹{ord.grandTotal}
                            </td>
                            <td className="py-3 px-4 font-medium text-[#2C221E]">
                              {ord.orderStatus}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Low Stock & Pending Reviews Alerts */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white border border-[#E5D9D0] rounded-lg p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif-display text-lg font-semibold text-[#2C221E] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                        <span>Low Stock Alerts ({lowStockProducts.length})</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('inventory')}
                        className="text-xs text-[#737765] hover:underline"
                      >
                        Restock
                      </button>
                    </div>
                    {lowStockProducts.length === 0 ? (
                      <p className="text-xs text-[#6E5D55]">All products are well-stocked.</p>
                    ) : (
                      <div className="space-y-2">
                        {lowStockProducts.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between text-xs py-1.5 border-b border-[#F4EFEA] last:border-0"
                          >
                            <span className="truncate pr-2">{p.name}</span>
                            <span className="font-mono-tabular font-semibold text-[#B45309] shrink-0">
                              {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-[#E5D9D0] rounded-lg p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif-display text-lg font-semibold text-[#2C221E]">
                        Pending Reviews ({pendingReviews.length})
                      </h3>
                      <button
                        onClick={() => setActiveTab('reviews')}
                        className="text-xs text-[#737765] hover:underline"
                      >
                        Moderate
                      </button>
                    </div>
                    {pendingReviews.length === 0 ? (
                      <p className="text-xs text-[#6E5D55]">No reviews awaiting approval.</p>
                    ) : (
                      pendingReviews.slice(0, 2).map((rev) => (
                        <div key={rev.id} className="p-3 bg-[#FAF7F2] rounded-md space-y-2 text-xs">
                          <div className="flex justify-between font-medium">
                            <span>{rev.customerName}</span>
                            <span className="font-mono-tabular">{rev.rating} ★</span>
                          </div>
                          <p className="text-[#5A4A42] line-clamp-2">“{rev.comment}”</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => moderateReview(rev.id, 'approved')}
                              className="px-2.5 py-1 bg-[#737765] text-white rounded text-[11px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => moderateReview(rev.id, 'rejected')}
                              className="px-2.5 py-1 bg-white border border-[#D8C7BE] rounded text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
           * TAB 2: PRODUCTS MANAGEMENT (#13 & #14)
           * ================================================================*/}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
                    Product Catalog ({products.length})
                  </h1>
                  <p className="text-xs text-[#6E5D55]">
                    Add, edit, upload multiple photos, change pricing/discounts, and manage product
                    flags.
                  </p>
                </div>
                <button
                  onClick={openNewProductModal}
                  className="px-4 py-2.5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium rounded-md flex items-center gap-2 self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Handmade Product</span>
                </button>
              </div>

              <div className="bg-white border border-[#E5D9D0] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E5D9D0] bg-[#FAF7F2] text-[#6E5D55]">
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-right">MRP / Sale</th>
                        <th className="py-3 px-4 text-right">Stock</th>
                        <th className="py-3 px-4">Visibility</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E6DE]">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-[#FAF7F2]">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <ResilientImage
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-10 h-10 rounded object-cover bg-[#F4EFEA] shrink-0"
                              />
                              <div>
                                <p className="font-semibold text-[#2C221E]">{prod.name}</p>
                                <p className="text-[11px] text-[#7D6B61]">
                                  {[
                                    prod.featured && 'Featured',
                                    prod.bestSeller && 'Best Seller',
                                    prod.newArrival && 'New Arrival',
                                  ]
                                    .filter(Boolean)
                                    .join(' · ') || 'Standard'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono-tabular text-[#5A4A42]">
                            {prod.sku}
                          </td>
                          <td className="py-3 px-4">{prod.category}</td>
                          <td className="py-3 px-4 text-right font-mono-tabular">
                            <span className="font-semibold text-[#2C221E]">₹{prod.salePrice}</span>{' '}
                            <span className="text-[#9B8B82] line-through">
                              ₹{prod.originalPrice}
                            </span>{' '}
                            <span className="text-[#9E584D]">(-{prod.discountPercent}%)</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono-tabular">
                            <span
                              className={
                                prod.stock === 0
                                  ? 'text-[#DC2626] font-semibold'
                                  : prod.stock <= prod.lowStockThreshold
                                  ? 'text-[#D97706] font-semibold'
                                  : 'text-[#2C221E]'
                              }
                            >
                              {prod.stock}
                            </span>
                          </td>
                          <td className="py-3 px-4 capitalize font-medium">{prod.status}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => setEditingProduct({ ...prod })}
                                className="p-1.5 text-[#5A4A42] hover:text-[#2C221E] border border-[#E5D9D0] rounded bg-white"
                                title="Edit Product"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteProduct(prod.id)}
                                className="p-1.5 text-[#9E584D] hover:text-[#DC2626] border border-[#E5D9D0] rounded bg-white"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
           * TAB 3: CATEGORIES MANAGEMENT
           * ================================================================*/}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
                    Categories ({categories.length})
                  </h1>
                  <p className="text-xs text-[#6E5D55]">
                    Organize your handmade collections and category showcase cards.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingCategory({
                      id: '',
                      name: '',
                      slug: '',
                      description: '',
                      image: '/assets/products/daisy-necklace.png',
                      productCount: 0,
                      featured: true,
                    })
                  }
                  className="px-4 py-2 bg-[#737765] text-white text-xs font-medium rounded-md flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>

              {editingCategory && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await saveCategory(editingCategory);
                    setEditingCategory(null);
                  }}
                  className="bg-white border border-[#E5D9D0] rounded-lg p-6 space-y-4"
                >
                  <h2 className="font-serif-display text-2xl text-[#2C221E]">
                    {editingCategory.id ? 'Edit Category' : 'Create Category'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Category Name *</label>
                      <input
                        type="text"
                        required
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                          })
                        }
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">URL Slug *</label>
                      <input
                        type="text"
                        required
                        value={editingCategory.slug}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, slug: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Studio Image</label>
                      <select
                        value={editingCategory.image}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, image: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                      >
                        {STUDIO_IMAGE_PRESETS.map((p) => (
                          <option key={p.url} value={p.url}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Description</label>
                    <input
                      type="text"
                      value={editingCategory.description}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, description: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 border border-[#D8C7BE] text-xs rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#737765] text-white text-xs font-medium rounded-md"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white border border-[#E5D9D0] rounded-lg p-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <ResilientImage
                        src={cat.image}
                        alt={cat.name}
                        className="w-16 h-16 rounded object-cover bg-[#F4EFEA] shrink-0"
                      />
                      <div>
                        <h3 className="font-serif-display text-xl font-semibold text-[#2C221E]">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-[#6E5D55] line-clamp-2">{cat.description}</p>
                        <p className="font-mono-tabular text-[11px] text-[#737765] mt-1">
                          {cat.productCount} products · /{cat.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => setEditingCategory({ ...cat })}
                        className="p-1.5 border border-[#E5D9D0] rounded hover:bg-[#FAF7F2]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-1.5 border border-[#E5D9D0] rounded text-[#9E584D] hover:bg-[#FAF7F2]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
           * TAB 4: ORDER MANAGEMENT (#16)
           * ================================================================*/}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
                    Order Management ({orders.length})
                  </h1>
                  <p className="text-xs text-[#6E5D55]">
                    Inspect customer shipping details and update order & payment statuses across
                    Standard and Manual / WhatsApp orders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('manual-orders')}
                  className="px-4 py-2 bg-[#EBF5EE] border border-[#B7DFC2] text-[#1F7A3E] text-xs font-medium rounded-md flex items-center gap-2 self-start"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Manage Manual WhatsApp Orders ({manualOrders.length})</span>
                </button>
              </div>

              <div className="bg-white border border-[#E5D9D0] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E5D9D0] bg-[#FAF7F2] text-[#6E5D55]">
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Order Type</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Products</th>
                        <th className="py-3 px-4 text-right">Total</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Order Status</th>
                        <th className="py-3 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E6DE]">
                      {orders.map((ord) => {
                        const isManual =
                          ord.orderType === 'Manual / WhatsApp' || ord.id.startsWith('MO-');
                        return (
                          <tr key={ord.id} className="hover:bg-[#FAF7F2]">
                            <td className="py-3 px-4 font-mono-tabular font-semibold text-[#2C221E]">
                              {ord.id}
                            </td>
                            <td className="py-3 px-4">
                              {isManual ? (
                                <span className="text-[#1F7A3E] font-semibold">
                                  Manual / WhatsApp
                                </span>
                              ) : (
                                <span className="text-[#6E5D55]">Standard Checkout</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-medium text-[#2C221E]">{ord.customerName}</p>
                              <p className="text-[11px] text-[#6E5D55]">{ord.city}</p>
                            </td>
                            <td className="py-3 px-4 font-mono-tabular text-[#6E5D55]">
                              {ord.createdAt.slice(0, 10)}
                            </td>
                            <td className="py-3 px-4 max-w-xs truncate" title={ord.itemsSummary}>
                              {ord.itemsSummary}
                            </td>
                            <td className="py-3 px-4 text-right font-mono-tabular font-semibold">
                              ₹{ord.grandTotal}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={ord.paymentStatus}
                                onChange={(e) =>
                                  updateOrderStatus(
                                    ord.id,
                                    ord.orderStatus,
                                    e.target.value as PaymentStatus
                                  )
                                }
                                className="px-2 py-1 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-[11px]"
                              >
                                {(['Pending', 'Paid', 'Failed', 'Refunded'] as PaymentStatus[]).map(
                                  (ps) => (
                                    <option key={ps} value={ps}>
                                      {ps}
                                    </option>
                                  )
                                )}
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={ord.orderStatus}
                                onChange={(e) =>
                                  updateOrderStatus(ord.id, e.target.value as OrderStatus)
                                }
                                className="px-2.5 py-1 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-medium"
                              >
                                {(
                                  [
                                    'Pending',
                                    'Confirmed',
                                    'Processing',
                                    'Shipped',
                                    'Out for Delivery',
                                    'Delivered',
                                    'Cancelled',
                                    'Refunded',
                                  ] as OrderStatus[]
                                ).map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setInspectingOrder(ord)}
                                className="px-2.5 py-1 border border-[#D8C7BE] rounded hover:bg-[#F4EFEA] inline-flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
           * TAB 4B: MANUAL WHATSAPP ORDERS & ADMIN CONTROL
           * ================================================================*/}
          {activeTab === 'manual-orders' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
                  Manual Order via WhatsApp ({manualOrders.length})
                </h1>
                <p className="text-xs text-[#6E5D55]">
                  Control customer visibility of the Manual Order button, configure your receiving
                  WhatsApp number, and manage all incoming WhatsApp orders.
                </p>
              </div>

              {/* Admin ON/OFF Control & Dynamic WhatsApp Number Setting */}
              <div className="bg-white border border-[#E5D9D0] rounded-lg p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0E6DE] pb-4">
                  <div className="space-y-1">
                    <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E] flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-[#1F7A3E]" />
                      <span>Manual WhatsApp Order Settings</span>
                    </h2>
                    <p className="text-xs text-[#6E5D55]">
                      When ON, customers see the “Manual Order / Order on WhatsApp” button on
                      products. When OFF, the option is completely hidden from customers.
                    </p>
                  </div>

                  {/* ON / OFF Control */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-[#6E5D55] mr-1">
                      Manual WhatsApp Order:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleSaveManualWhatsAppConfig(
                          true,
                          draftSettings.manualWhatsappNumber ||
                            settings.manualWhatsappNumber ||
                            settings.supportWhatsapp
                        )
                      }
                      className={`px-4 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                        draftSettings.manualWhatsappOrderEnabled !== false
                          ? 'bg-[#1F7A3E] border-[#1F7A3E] text-white'
                          : 'bg-white border-[#D8C7BE] text-[#5A4A42] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      ON
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSaveManualWhatsAppConfig(
                          false,
                          draftSettings.manualWhatsappNumber ||
                            settings.manualWhatsappNumber ||
                            settings.supportWhatsapp
                        )
                      }
                      className={`px-4 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                        draftSettings.manualWhatsappOrderEnabled === false
                          ? 'bg-[#2C221E] border-[#2C221E] text-white'
                          : 'bg-white border-[#D8C7BE] text-[#5A4A42] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      OFF
                    </button>
                  </div>
                </div>

                {/* Dynamic Admin WhatsApp Number Input */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-8">
                    <label className="block text-xs font-medium text-[#2C221E] mb-1">
                      Manual Order WhatsApp Number (Dynamic Destination Number)
                    </label>
                    <input
                      type="tel"
                      value={
                        draftSettings.manualWhatsappNumber !== undefined
                          ? draftSettings.manualWhatsappNumber
                          : settings.supportWhatsapp
                      }
                      onChange={(e) => {
                        setWhatsappNumberError('');
                        setDraftSettings({
                          ...draftSettings,
                          manualWhatsappNumber: e.target.value,
                        });
                      }}
                      placeholder="+91 98204 51290"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8C7BE] rounded-md text-xs font-mono-tabular text-[#2C221E]"
                    />
                    <p className="text-[11px] text-[#6E5D55] mt-1">
                      Include country code (e.g., +91 98204 51290). All customer manual orders open
                      WhatsApp addressed to this number (`wa.me/
                      {sanitizeWhatsAppPhone(
                        draftSettings.manualWhatsappNumber || settings.supportWhatsapp
                      )}
                      `).
                    </p>
                    {whatsappNumberError && (
                      <p className="text-xs text-[#DC2626] mt-1">{whatsappNumberError}</p>
                    )}
                  </div>

                  <div className="md:col-span-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleSaveManualWhatsAppConfig(
                          draftSettings.manualWhatsappOrderEnabled !== false,
                          draftSettings.manualWhatsappNumber || settings.supportWhatsapp
                        )
                      }
                      className="w-full py-2.5 px-5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium rounded-md transition-colors"
                    >
                      Save WhatsApp Order Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Manual Orders Table */}
              <div className="bg-white border border-[#E5D9D0] rounded-lg overflow-hidden">
                <div className="p-4 border-b border-[#E5D9D0] flex items-center justify-between">
                  <h2 className="font-serif-display text-xl font-semibold text-[#2C221E]">
                    Manual / WhatsApp Orders Log
                  </h2>
                  <span className="text-xs text-[#1F7A3E] font-medium">
                    Order Type: Manual / WhatsApp
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E5D9D0] bg-[#FAF7F2] text-[#6E5D55]">
                        <th className="py-3 px-4">Order Number</th>
                        <th className="py-3 px-4">Customer Name</th>
                        <th className="py-3 px-4">Mobile</th>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Product ID</th>
                        <th className="py-3 px-4 text-right">Quantity</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4">Date / Time</th>
                        <th className="py-3 px-4">Order Type</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E6DE]">
                      {manualOrders.map((mo) => (
                        <tr key={mo.id} className="hover:bg-[#FAF7F2]">
                          <td className="py-3 px-4 font-mono-tabular font-semibold text-[#2C221E]">
                            {mo.id}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-[#2C221E]">{mo.customerName}</p>
                            <p className="text-[11px] text-[#6E5D55]">
                              {mo.city}, {mo.state}
                            </p>
                          </td>
                          <td className="py-3 px-4 font-mono-tabular text-[#2C221E]">
                            {mo.customerMobile}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <ResilientImage
                                src={mo.productImage}
                                alt={mo.productName}
                                className="w-9 h-9 rounded object-cover bg-[#F4EFEA] border border-[#E5D9D0] shrink-0"
                              />
                              <div>
                                <p className="font-medium text-[#2C221E]">{mo.productName}</p>
                                <p className="text-[11px] text-[#6E5D55]">{mo.variant}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono-tabular text-[#5A4A42]">
                            {mo.productSku}
                          </td>
                          <td className="py-3 px-4 text-right font-mono-tabular">{mo.quantity}</td>
                          <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-[#2C221E]">
                            ₹{mo.totalAmount}
                          </td>
                          <td className="py-3 px-4 font-mono-tabular text-[#6E5D55]">
                            {mo.createdAt.slice(0, 16).replace('T', ' ')}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#1F7A3E]">
                            {mo.orderType}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={mo.status}
                              onChange={(e) =>
                                updateManualOrderStatus(
                                  mo.id,
                                  e.target.value as ManualOrderStatus
                                )
                              }
                              className="px-2.5 py-1 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-medium"
                            >
                              {(
                                [
                                  'Pending',
                                  'Confirmed',
                                  'Processing',
                                  'Shipped',
                                  'Delivered',
                                  'Cancelled',
                                ] as ManualOrderStatus[]
                              ).map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setInspectingManualOrder(mo)}
                              className="px-2.5 py-1 border border-[#D8C7BE] rounded hover:bg-[#F4EFEA] inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
           * TAB 5: CUSTOMER MANAGEMENT (#17)
           * ================================================================*/}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
                  Customers ({customers.length})
                </h1>
                <p className="text-xs text-[#6E5D55]">
                  View customer spending metrics, account status, and complete order history.
                </p>
              </div>

              <div className="bg-white border border-[#E5D9D0] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E5D9D0] bg-[#FAF7F2] text-[#6E5D55]">
                        <th className="py-3 px-4">Customer Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4 text-right">Total Orders</th>
                        <th className="py-3 px-4 text-right">Total Spending</th>
                        <th className="py-3 px-4">Last Order</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">History</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E6DE]">
                      {customers.map((cust) => (
                        <tr key={cust.uid} className="hover:bg-[#FAF7F2]">
                          <td className="py-3 px-4 font-semibold text-[#2C221E]">
                            {cust.displayName}
                          </td>
                          <td className="py-3 px-4 text-[#5A4A42]">{cust.email}</td>
                          <td className="py-3 px-4 font-mono-tabular">{cust.phone}</td>
                          <td className="py-3 px-4 text-right font-mono-tabular">
                            {cust.totalOrders}
                          </td>
                          <td className="py-3 px-4 text-right font-mono-tabular font-semibold">
                            ₹{cust.totalSpent}
                          </td>
                          <td className="py-3 px-4 font-mono-tabular text-[#6E5D55]">
                            {cust.lastOrderDate}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={cust.accountStatus}
                              onChange={(e) =>
                                updateCustomerStatus(
                                  cust.uid,
                                  e.target.value as CustomerRecord['accountStatus']
                                )
                              }
                              className="px-2 py-1 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                            >
                              <option value="Active">Active</option>
                              <option value="VIP">VIP</option>
                              <option value="Suspended">Suspended</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setInspectingCustomer(cust)}
                              className="px-2.5 py-1 border border-[#D8C7BE] rounded hover:bg-[#F4EFEA]"
                            >
                              View Orders
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
           * TAB 6: REVIEWS MODERATION (#9)
           * ================================================================*/}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
                  Customer Review Moderation ({reviews.length})
                </h1>
                <p className="text-xs text-[#6E5D55]">
                  Approve, reject, feature on homepage, or delete customer product reviews.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white border border-[#E5D9D0] rounded-lg p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#2C221E]">
                          {rev.customerName} · {rev.productName}
                        </span>
                        <span className="font-mono-tabular uppercase text-[11px] font-semibold text-[#737765]">
                          Status: {rev.status} {rev.featured ? '· Featured' : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[#C5A059]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-[#C5A059]' : 'opacity-30'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-[#2C221E] leading-relaxed">“{rev.comment}”</p>

                      {rev.photoUrl && (
                        <ResilientImage
                          src={rev.photoUrl}
                          alt="Review attachment"
                          className="w-16 h-16 rounded object-cover border border-[#E5D9D0]"
                        />
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#F0E6DE] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => moderateReview(rev.id, 'approved', rev.featured)}
                          className="px-3 py-1 bg-[#737765] text-white text-xs rounded hover:bg-[#5E6252]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => moderateReview(rev.id, 'rejected', false)}
                          className="px-3 py-1 bg-white border border-[#D8C7BE] text-xs rounded hover:bg-[#FAF7F2]"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => moderateReview(rev.id, 'approved', !rev.featured)}
                          className="px-3 py-1 bg-[#FAF7F2] border border-[#D8C7BE] text-xs rounded hover:border-[#C5A059]"
                        >
                          {rev.featured ? 'Unfeature' : 'Feature on Home'}
                        </button>
                      </div>
                      <button
                        onClick={() => deleteReview(rev.id)}
                        className="p-1.5 text-[#9E584D] hover:text-[#DC2626]"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
           * TAB 7: COUPONS SYSTEM (#15)
           * ================================================================*/}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
                    Coupon Codes ({coupons.length})
                  </h1>
                  <p className="text-xs text-[#6E5D55]">
                    Create percentage, fixed amount, first-order, and limited-time promotional
                    coupons.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingCoupon({
                      id: '',
                      code: '',
                      discountType: 'percentage',
                      discountValue: 15,
                      minOrderAmount: 699,
                      maxDiscountAmount: 500,
                      applicableCategory: 'All',
                      startDate: '2026-11-01',
                      endDate: '2027-12-31',
                      usageLimit: 200,
                      usedCount: 0,
                      active: true,
                      description: '',
                    })
                  }
                  className="px-4 py-2 bg-[#737765] text-white text-xs font-medium rounded-md flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Coupon</span>
                </button>
              </div>

              {editingCoupon && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await saveCoupon(editingCoupon);
                    setEditingCoupon(null);
                  }}
                  className="bg-white border border-[#E5D9D0] rounded-lg p-6 space-y-4"
                >
                  <h2 className="font-serif-display text-2xl text-[#2C221E]">
                    {editingCoupon.id ? 'Edit Coupon' : 'Create New Coupon'}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Coupon Code *</label>
                      <input
                        type="text"
                        required
                        value={editingCoupon.code}
                        onChange={(e) =>
                          setEditingCoupon({
                            ...editingCoupon,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="ROSE25"
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Discount Type</label>
                      <select
                        value={editingCoupon.discountType}
                        onChange={(e) =>
                          setEditingCoupon({
                            ...editingCoupon,
                            discountType: e.target.value as DiscountType,
                          })
                        }
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                      >
                        <option value="percentage">Percentage Discount (%)</option>
                        <option value="fixed">Fixed Amount Discount (₹)</option>
                        <option value="first_order">First-Order Discount (%)</option>
                        <option value="min_order">Minimum Order Discount (%)</option>
                        <option value="limited_time">Limited-Time Offer (%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Discount Value *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={editingCoupon.discountValue}
                        onChange={(e) =>
                          setEditingCoupon({
                            ...editingCoupon,
                            discountValue: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Minimum Order (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={editingCoupon.minOrderAmount}
                        onChange={(e) =>
                          setEditingCoupon({
                            ...editingCoupon,
                            minOrderAmount: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Max Discount (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={editingCoupon.maxDiscountAmount}
                        onChange={(e) =>
                          setEditingCoupon({
                            ...editingCoupon,
                            maxDiscountAmount: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Start Date</label>
                      <input
                        type="date"
                        value={editingCoupon.startDate}
                        onChange={(e) =>
                          setEditingCoupon({ ...editingCoupon, startDate: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">End Date</label>
                      <input
                        type="date"
                        value={editingCoupon.endDate}
                        onChange={(e) =>
                          setEditingCoupon({ ...editingCoupon, endDate: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Usage Limit</label>
                      <input
                        type="number"
                        min={1}
                        value={editingCoupon.usageLimit}
                        onChange={(e) =>
                          setEditingCoupon({
                            ...editingCoupon,
                            usageLimit: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1">Description</label>
                      <input
                        type="text"
                        value={editingCoupon.description}
                        onChange={(e) =>
                          setEditingCoupon({ ...editingCoupon, description: e.target.value })
                        }
                        placeholder="e.g., 25% OFF on Handmade Rose Collection"
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs font-medium pt-4">
                      <input
                        type="checkbox"
                        checked={editingCoupon.active}
                        onChange={(e) =>
                          setEditingCoupon({ ...editingCoupon, active: e.target.checked })
                        }
                        className="accent-[#737765]"
                      />
                      <span>Coupon Active</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingCoupon(null)}
                      className="px-4 py-2 border border-[#D8C7BE] text-xs rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#737765] text-white text-xs font-medium rounded-md"
                    >
                      Save Coupon
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white border border-[#E5D9D0] rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E5D9D0] bg-[#FAF7F2] text-[#6E5D55]">
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Value</th>
                      <th className="py-3 px-4 text-right">Min Order</th>
                      <th className="py-3 px-4 text-right">Used / Limit</th>
                      <th className="py-3 px-4">Validity</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E6DE]">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-[#FAF7F2]">
                        <td className="py-3 px-4 font-mono-tabular font-semibold text-[#2C221E]">
                          {c.code}
                        </td>
                        <td className="py-3 px-4 capitalize">{c.discountType.replace('_', ' ')}</td>
                        <td className="py-3 px-4 text-right font-mono-tabular font-semibold">
                          {c.discountType === 'fixed' ? `₹${c.discountValue}` : `${c.discountValue}%`}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-tabular">
                          ₹{c.minOrderAmount}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-tabular">
                          {c.usedCount} / {c.usageLimit}
                        </td>
                        <td className="py-3 px-4 font-mono-tabular text-[#6E5D55]">
                          {c.startDate} → {c.endDate}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => saveCoupon({ ...c, active: !c.active })}
                            className={`text-xs font-medium ${
                              c.active ? 'text-[#4D6A46]' : 'text-[#9B8B82]'
                            }`}
                          >
                            {c.active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => setEditingCoupon({ ...c })}
                              className="p-1.5 border border-[#E5D9D0] rounded"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteCoupon(c.id)}
                              className="p-1.5 border border-[#E5D9D0] rounded text-[#9E584D]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
           * TAB 8: DISCOUNTS CAMPAIGN MANAGER (#15)
           * ================================================================*/}
          {activeTab === 'discounts' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
                  Storewide & Category Discounts
                </h1>
                <p className="text-xs text-[#6E5D55]">
                  Apply percentage discounts across specific categories or update individual
                  product sale prices.
                </p>
              </div>

              <div className="bg-white border border-[#E5D9D0] rounded-lg p-6 space-y-4">
                <h2 className="font-serif-display text-2xl text-[#2C221E]">
                  Launch Category Discount Campaign
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-medium mb-1">Target Category</label>
                    <select
                      value={campaignCategory}
                      onChange={(e) => setCampaignCategory(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                    >
                      <option value="All">All Storefront Products</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={80}
                      value={campaignPercent}
                      onChange={(e) => setCampaignPercent(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => applyCategoryDiscount(campaignCategory, campaignPercent)}
                    className="py-2.5 px-5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium rounded-md transition-colors"
                  >
                    Apply {campaignPercent}% Discount Now
                  </button>
                </div>
              </div>

              {/* Quick Product Price & Discount Editor */}
              <div className="bg-white border border-[#E5D9D0] rounded-lg overflow-hidden">
                <div className="p-4 border-b border-[#E5D9D0]">
                  <h3 className="font-serif-display text-xl font-semibold">
                    Individual Product Price & Discount Editor
                  </h3>
                </div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E5D9D0] bg-[#FAF7F2] text-[#6E5D55]">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4 text-right">Original Price (₹)</th>
                      <th className="py-3 px-4 text-right">Sale Price (₹)</th>
                      <th className="py-3 px-4 text-right">Discount %</th>
                      <th className="py-3 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E6DE]">
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 px-4 font-medium">{p.name}</td>
                        <td className="py-3 px-4 text-right font-mono-tabular">
                          ₹{p.originalPrice}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-tabular font-semibold">
                          ₹{p.salePrice}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-tabular text-[#9E584D]">
                          {p.discountPercent}% OFF
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setEditingProduct({ ...p })}
                            className="px-3 py-1 border border-[#D8C7BE] rounded hover:bg-[#FAF7F2]"
                          >
                            Edit Price
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
           * TAB 9: PAYMENT SETTINGS (#21)
           * ================================================================*/}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
                  Payment Gateway & Methods Configuration
                </h1>
                <p className="text-xs text-[#6E5D55]">
                  Enable or disable checkout payment providers. Secret API keys are managed
                  exclusively via server-side environment variables.
                </p>
              </div>

              {/* Server-Side Gateway Security Status */}
              <div className="bg-white border border-[#E5D9D0] rounded-lg p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#737765]" />
                    <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
                      Server-Side Payment Verification Engine
                    </h2>
                  </div>
                  <span className="text-xs font-mono-tabular text-[#4D6A46] font-semibold">
                    HMAC-SHA256 Verification Active
                  </span>
                </div>
                <p className="text-xs text-[#5A4A42]">
                  Secret keys (`RAZORPAY_KEY_SECRET`, `PAYMENT_WEBHOOK_SECRET`) are loaded on the
                  Express server from `.env` and are never exposed to the client browser.
                </p>
                {gatewayStatus && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                    <div className="p-3 bg-[#FAF7F2] rounded border border-[#E5D9D0]">
                      <span className="text-[#6E5D55] block">Gateway Mode</span>
                      <span className="font-mono-tabular font-semibold uppercase">
                        {gatewayStatus.mode}
                      </span>
                    </div>
                    <div className="p-3 bg-[#FAF7F2] rounded border border-[#E5D9D0]">
                      <span className="text-[#6E5D55] block">Server Key Reference</span>
                      <span className="font-mono-tabular font-semibold">
                        {gatewayStatus.publicKeyPreview}
                      </span>
                    </div>
                    <div className="p-3 bg-[#FAF7F2] rounded border border-[#E5D9D0]">
                      <span className="text-[#6E5D55] block">Signature Verification</span>
                      <span className="font-mono-tabular font-semibold text-[#4D6A46]">
                        Ready (/api/payments/verify)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggleable Payment Methods */}
              <div className="bg-white border border-[#E5D9D0] rounded-lg p-6 space-y-5">
                <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
                  Active Checkout Payment Options
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      key: 'razorpayEnabled' as const,
                      title: 'Razorpay Payment Gateway',
                      desc: 'Unified Indian payment gateway with server-side order verification.',
                    },
                    {
                      key: 'upiEnabled' as const,
                      title: 'UPI Instant Pay (GPay, PhonePe, Paytm)',
                      desc: 'Direct UPI VPA & QR checkout for zero-fee instant payments.',
                    },
                    {
                      key: 'codEnabled' as const,
                      title: 'Cash on Delivery (COD)',
                      desc: 'Allow customers to pay in cash or UPI at the time of doorstep delivery.',
                    },
                    {
                      key: 'cardEnabled' as const,
                      title: 'Credit & Debit Cards',
                      desc: 'Accept Visa, Mastercard, RuPay, and Amex cards.',
                    },
                    {
                      key: 'netBankingEnabled' as const,
                      title: 'Net Banking',
                      desc: 'Support 50+ Indian retail and corporate banks.',
                    },
                    {
                      key: 'walletEnabled' as const,
                      title: 'Digital Wallets',
                      desc: 'Support Amazon Pay, PhonePe Wallet, and Mobikwik.',
                    },
                  ].map((method) => (
                    <label
                      key={method.key}
                      className="p-4 border border-[#E5D9D0] rounded-lg flex items-start justify-between gap-4 cursor-pointer hover:bg-[#FAF7F2]"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#2C221E]">{method.title}</p>
                        <p className="text-[11px] text-[#6E5D55] mt-0.5">{method.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(draftSettings[method.key])}
                        onChange={(e) =>
                          setDraftSettings({
                            ...draftSettings,
                            [method.key]: e.target.checked,
                          })
                        }
                        className="mt-1 accent-[#737765] w-4 h-4"
                      />
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Merchant UPI ID</label>
                    <input
                      type="text"
                      value={draftSettings.upiId}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, upiId: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Free Shipping Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={draftSettings.freeShippingThreshold}
                      onChange={(e) =>
                        setDraftSettings({
                          ...draftSettings,
                          freeShippingThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Standard Shipping Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={draftSettings.standardShippingRate}
                      onChange={(e) =>
                        setDraftSettings({
                          ...draftSettings,
                          standardShippingRate: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateStoreSettings(draftSettings)}
                  className="px-6 py-2.5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium rounded-md"
                >
                  Save Payment & Shipping Settings
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
           * TAB 10: INVENTORY MANAGEMENT (#18)
           * ================================================================*/}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
                  Inventory Tracking & Stock Control
                </h1>
                <p className="text-xs text-[#6E5D55]">
                  Monitor stock levels, sold counts, and low-stock warnings. When stock reaches 0,
                  products automatically display Out of Stock and disable purchasing.
                </p>
              </div>

              <div className="bg-white border border-[#E5D9D0] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E5D9D0] bg-[#FAF7F2] text-[#6E5D55]">
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4 text-right">Sold</th>
                        <th className="py-3 px-4 text-right">Remaining Stock</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Quick Restock / Adjust</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E6DE]">
                      {products.map((prod) => {
                        const isOut = prod.stock <= 0;
                        const isLow = prod.stock > 0 && prod.stock <= prod.lowStockThreshold;
                        return (
                          <tr key={prod.id} className="hover:bg-[#FAF7F2]">
                            <td className="py-3 px-4 font-medium text-[#2C221E]">{prod.name}</td>
                            <td className="py-3 px-4 font-mono-tabular text-[#6E5D55]">
                              {prod.sku}
                            </td>
                            <td className="py-3 px-4 text-right font-mono-tabular">
                              {prod.soldCount}
                            </td>
                            <td className="py-3 px-4 text-right font-mono-tabular font-semibold">
                              {prod.stock}
                            </td>
                            <td className="py-3 px-4">
                              {isOut ? (
                                <span className="text-[#DC2626] font-semibold">Out of Stock</span>
                              ) : isLow ? (
                                <span className="text-[#D97706] font-semibold">
                                  Low Stock Warning (≤{prod.lowStockThreshold})
                                </span>
                              ) : (
                                <span className="text-[#4D6A46]">In Stock</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() =>
                                    saveProduct({ ...prod, stock: prod.stock + 5 })
                                  }
                                  className="px-2.5 py-1 bg-[#FAF7F2] border border-[#D8C7BE] rounded font-mono-tabular hover:bg-[#EFE6DF]"
                                >
                                  +5
                                </button>
                                <button
                                  onClick={() =>
                                    saveProduct({ ...prod, stock: prod.stock + 10 })
                                  }
                                  className="px-2.5 py-1 bg-[#FAF7F2] border border-[#D8C7BE] rounded font-mono-tabular hover:bg-[#EFE6DF]"
                                >
                                  +10
                                </button>
                                <button
                                  onClick={() => saveProduct({ ...prod, stock: 0 })}
                                  className="px-2.5 py-1 bg-white border border-[#D8C7BE] text-[#9E584D] rounded hover:bg-[#FEF2F2]"
                                >
                                  Mark Out of Stock
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
           * TAB 11: ANALYTICS (#19)
           * ================================================================*/}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div>
                <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
                  Store Analytics & Revenue Insights
                </h1>
                <p className="text-xs text-[#6E5D55]">
                  Sales over time, orders over time, best-selling products, and revenue by
                  category.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales & Orders Over Time Chart */}
                <div className="bg-white border border-[#E5D9D0] rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif-display text-2xl font-semibold">
                      Sales & Orders Over Time (Last 6 Months)
                    </h2>
                    <span className="font-mono-tabular text-xs text-[#737765]">INR (₹)</span>
                  </div>
                  <div className="space-y-3 pt-2">
                    {[
                      { month: 'Jun 2026', sales: 42800, ordersCount: 31, pct: 52 },
                      { month: 'Jul 2026', sales: 51400, ordersCount: 39, pct: 64 },
                      { month: 'Aug 2026', sales: 63900, ordersCount: 48, pct: 76 },
                      { month: 'Sep 2026', sales: 71200, ordersCount: 54, pct: 85 },
                      { month: 'Oct 2026', sales: 84600, ordersCount: 67, pct: 100 },
                      {
                        month: 'Nov 2026 (MTD)',
                        sales: totalSales + 28400,
                        ordersCount: totalOrdersCount + 22,
                        pct: 45,
                      },
                    ].map((row) => (
                      <div key={row.month} className="space-y-1 text-xs">
                        <div className="flex justify-between font-mono-tabular">
                          <span className="font-sans font-medium text-[#2C221E]">{row.month}</span>
                          <span>
                            ₹{row.sales.toLocaleString('en-IN')} · {row.ordersCount} orders
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-[#F4EFEA] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#737765] rounded-full"
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Revenue by Category */}
                <div className="bg-white border border-[#E5D9D0] rounded-lg p-6 space-y-4">
                  <h2 className="font-serif-display text-2xl font-semibold">
                    Revenue by Category
                  </h2>
                  <div className="space-y-3.5 pt-2">
                    {categories.map((cat) => {
                      const catProducts = products.filter((p) => p.category === cat.name);
                      const catRevenue = catProducts.reduce(
                        (sum, p) => sum + p.salePrice * p.soldCount,
                        0
                      );
                      const maxRev = 420000;
                      const pct = Math.min(100, Math.max(12, Math.round((catRevenue / maxRev) * 100)));
                      return (
                        <div key={cat.id} className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="font-medium text-[#2C221E]">{cat.name}</span>
                            <span className="font-mono-tabular font-semibold">
                              ₹{catRevenue.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-[#F4EFEA] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#B6766C] rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Best-Selling Products Ranking */}
              <div className="bg-white border border-[#E5D9D0] rounded-lg p-6 space-y-4">
                <h2 className="font-serif-display text-2xl font-semibold">
                  Top Performing Handmade Products
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...products]
                    .sort((a, b) => b.soldCount - a.soldCount)
                    .slice(0, 4)
                    .map((p, idx) => (
                      <div
                        key={p.id}
                        className="p-4 bg-[#FAF7F2] border border-[#E5D9D0] rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs text-[#737765] font-mono-tabular">
                          <span>#{idx + 1} Best Seller</span>
                          <span>{p.soldCount} sold</span>
                        </div>
                        <p className="font-serif-display text-lg font-semibold text-[#2C221E] truncate">
                          {p.name}
                        </p>
                        <p className="font-mono-tabular text-xs font-semibold text-[#2C221E]">
                          Revenue: ₹{(p.soldCount * p.salePrice).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
           * TAB 12: HOMEPAGE CONTENT MANAGEMENT (#20)
           * ================================================================*/}
          {activeTab === 'homepage' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
                  Homepage Content Management (No-Code CMS)
                </h1>
                <p className="text-xs text-[#6E5D55]">
                  Customize your hero banner, brand story, promotional strip, and featured
                  collections without editing code.
                </p>
              </div>

              <div className="bg-white border border-[#E5D9D0] rounded-lg p-6 space-y-6">
                <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
                  1. Hero Section & Announcement Bar
                </h2>

                <div>
                  <label className="block text-xs font-medium mb-1">Top Announcement Text</label>
                  <input
                    type="text"
                    value={draftSettings.announcementText}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, announcementText: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Hero Headline</label>
                    <input
                      type="text"
                      value={draftSettings.heroHeading}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, heroHeading: e.target.value })
                      }
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Hero Image Preset</label>
                    <div className="flex gap-2">
                      <select
                        value={draftSettings.heroImage}
                        onChange={(e) =>
                          setDraftSettings({ ...draftSettings, heroImage: e.target.value })
                        }
                        className="flex-1 px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                      >
                        {STUDIO_IMAGE_PRESETS.map((p) => (
                          <option key={p.url} value={p.url}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <label className="px-3 py-2 bg-[#F4EFEA] border border-[#D8C7BE] rounded text-xs cursor-pointer shrink-0">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleHeroImageUpload(e, 'heroImage')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Hero Supporting Text</label>
                  <textarea
                    rows={2}
                    value={draftSettings.heroSubtext}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, heroSubtext: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Primary Button Text</label>
                    <input
                      type="text"
                      value={draftSettings.heroPrimaryBtn}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, heroPrimaryBtn: e.target.value })
                      }
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Secondary Button Text</label>
                    <input
                      type="text"
                      value={draftSettings.heroSecondaryBtn}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, heroSecondaryBtn: e.target.value })
                      }
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                    />
                  </div>
                </div>

                <hr className="border-[#E5D9D0]" />

                <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
                  2. Brand Story & Promotional Banner
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Story Heading</label>
                    <input
                      type="text"
                      value={draftSettings.storyHeading}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, storyHeading: e.target.value })
                      }
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Story Image</label>
                    <div className="flex gap-2">
                      <select
                        value={draftSettings.storyImage}
                        onChange={(e) =>
                          setDraftSettings({ ...draftSettings, storyImage: e.target.value })
                        }
                        className="flex-1 px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                      >
                        {STUDIO_IMAGE_PRESETS.map((p) => (
                          <option key={p.url} value={p.url}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <label className="px-3 py-2 bg-[#F4EFEA] border border-[#D8C7BE] rounded text-xs cursor-pointer shrink-0">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleHeroImageUpload(e, 'storyImage')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Brand Story Narrative</label>
                  <textarea
                    rows={3}
                    value={draftSettings.storyBody}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, storyBody: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Promo Banner Title</label>
                    <input
                      type="text"
                      value={draftSettings.promoBannerTitle}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, promoBannerTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Promo Subtitle</label>
                    <input
                      type="text"
                      value={draftSettings.promoBannerSubtitle}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, promoBannerSubtitle: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Featured Coupon Code</label>
                    <input
                      type="text"
                      value={draftSettings.promoBannerCode}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, promoBannerCode: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateStoreSettings(draftSettings)}
                  className="px-6 py-2.5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium rounded-md"
                >
                  Publish Homepage Changes
                </button>
              </div>

              {/* Quick Toggle for Featured / New Arrivals / Best Sellers */}
              <div className="bg-white border border-[#E5D9D0] rounded-lg p-6 space-y-4">
                <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
                  3. Curate Homepage Featured, New Arrivals & Best Sellers
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E5D9D0] bg-[#FAF7F2] text-[#6E5D55]">
                        <th className="py-2.5 px-4">Product</th>
                        <th className="py-2.5 px-4 text-center">Featured on Home</th>
                        <th className="py-2.5 px-4 text-center">New Arrival</th>
                        <th className="py-2.5 px-4 text-center">Best Seller</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E6DE]">
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2.5 px-4 font-medium">{p.name}</td>
                          <td className="py-2.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={p.featured}
                              onChange={(e) =>
                                saveProduct({ ...p, featured: e.target.checked })
                              }
                              className="accent-[#737765]"
                            />
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={p.newArrival}
                              onChange={(e) =>
                                saveProduct({ ...p, newArrival: e.target.checked })
                              }
                              className="accent-[#737765]"
                            />
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={p.bestSeller}
                              onChange={(e) =>
                                saveProduct({ ...p, bestSeller: e.target.checked })
                              }
                              className="accent-[#737765]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
           * TAB 13: STORE SETTINGS
           * ================================================================*/}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif-display text-3xl font-semibold text-[#2C221E]">
                  Store Contact & General Settings
                </h1>
                <p className="text-xs text-[#6E5D55]">
                  Update customer support channels, social handles, and store demo data.
                </p>
              </div>

              <div className="bg-white border border-[#E5D9D0] rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Support Email</label>
                    <input
                      type="email"
                      value={draftSettings.supportEmail}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, supportEmail: e.target.value })
                      }
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Support Phone</label>
                    <input
                      type="text"
                      value={draftSettings.supportPhone}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, supportPhone: e.target.value })
                      }
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">WhatsApp Concierge</label>
                    <input
                      type="text"
                      value={draftSettings.supportWhatsapp}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, supportWhatsapp: e.target.value })
                      }
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Instagram Handle</label>
                    <input
                      type="text"
                      value={draftSettings.instagramHandle}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, instagramHandle: e.target.value })
                      }
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                    />
                  </div>
                </div>

                {/* Manual WhatsApp Order Settings inside Store Settings Tab */}
                <div className="pt-4 border-t border-[#E5D9D0] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif-display text-xl font-semibold text-[#2C221E] flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-[#1F7A3E]" />
                        <span>Manual WhatsApp Order</span>
                      </h3>
                      <p className="text-xs text-[#6E5D55]">
                        Toggle whether the “Manual Order / Order on WhatsApp” button is visible on
                        the customer website.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setDraftSettings({
                            ...draftSettings,
                            manualWhatsappOrderEnabled: true,
                          })
                        }
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                          draftSettings.manualWhatsappOrderEnabled !== false
                            ? 'bg-[#1F7A3E] border-[#1F7A3E] text-white'
                            : 'bg-white border-[#D8C7BE] text-[#5A4A42]'
                        }`}
                      >
                        ON
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDraftSettings({
                            ...draftSettings,
                            manualWhatsappOrderEnabled: false,
                          })
                        }
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                          draftSettings.manualWhatsappOrderEnabled === false
                            ? 'bg-[#2C221E] border-[#2C221E] text-white'
                            : 'bg-white border-[#D8C7BE] text-[#5A4A42]'
                        }`}
                      >
                        OFF
                      </button>
                    </div>
                  </div>

                  <div className="max-w-md">
                    <label className="block text-xs font-medium mb-1">
                      Manual Order WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={
                        draftSettings.manualWhatsappNumber !== undefined
                          ? draftSettings.manualWhatsappNumber
                          : draftSettings.supportWhatsapp
                      }
                      onChange={(e) => {
                        setWhatsappNumberError('');
                        setDraftSettings({
                          ...draftSettings,
                          manualWhatsappNumber: e.target.value,
                        });
                      }}
                      placeholder="+91 98204 51290"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                    />
                    {whatsappNumberError && (
                      <p className="text-xs text-[#DC2626] mt-1">{whatsappNumberError}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E5D9D0]">
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveManualWhatsAppConfig(
                        draftSettings.manualWhatsappOrderEnabled !== false,
                        draftSettings.manualWhatsappNumber || draftSettings.supportWhatsapp
                      )
                    }
                    className="px-6 py-2.5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-medium rounded-md"
                  >
                    Save Store Settings
                  </button>

                  <button
                    type="button"
                    onClick={resetDemoStore}
                    className="px-4 py-2 border border-[#D8C7BE] text-xs text-[#6E5D55] hover:text-[#2C221E] rounded-md inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restore Default Mikkimama Catalog</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =====================================================================
       * MODAL: MANUAL WHATSAPP ORDER DETAIL INSPECTOR
       * ====================================================================*/}
      {inspectingManualOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white border border-[#E5D9D0] rounded-xl max-w-2xl w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5D9D0] pb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#1F7A3E] font-semibold">
                  Order Type: {inspectingManualOrder.orderType}
                </p>
                <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
                  Manual Order {inspectingManualOrder.id}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectingManualOrder(null)}
                className="p-1.5 text-[#6E5D55] hover:text-[#2C221E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#FAF7F2] rounded-lg border border-[#E5D9D0] space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-[#6E5D55] font-semibold">
                  Customer Details
                </p>
                <p className="font-semibold text-[#2C221E]">{inspectingManualOrder.customerName}</p>
                <p className="font-mono-tabular">Mobile: {inspectingManualOrder.customerMobile}</p>
                <p>Email: {inspectingManualOrder.customerEmail}</p>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-lg border border-[#E5D9D0] space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-[#6E5D55] font-semibold">
                  Delivery Address
                </p>
                <p className="text-[#2C221E]">{inspectingManualOrder.completeAddress}</p>
                <p>
                  {inspectingManualOrder.city}, {inspectingManualOrder.state} -{' '}
                  <span className="font-mono-tabular">{inspectingManualOrder.pinCode}</span>
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-lg border border-[#E5D9D0] flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <ResilientImage
                  src={inspectingManualOrder.productImage}
                  alt={inspectingManualOrder.productName}
                  className="w-16 h-16 rounded object-cover bg-white border border-[#E5D9D0]"
                />
                <div className="space-y-0.5">
                  <p className="font-semibold text-[#2C221E]">
                    {inspectingManualOrder.productName} ({inspectingManualOrder.variant})
                  </p>
                  <p className="font-mono-tabular text-[#6E5D55]">
                    Product ID: {inspectingManualOrder.productSku}
                  </p>
                  <p className="font-mono-tabular">
                    ₹{inspectingManualOrder.unitPrice} × {inspectingManualOrder.quantity} ={' '}
                    <strong>₹{inspectingManualOrder.totalAmount}</strong>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#6E5D55] mb-1">Order Status</label>
                <select
                  value={inspectingManualOrder.status}
                  onChange={(e) => {
                    const nextSt = e.target.value as ManualOrderStatus;
                    updateManualOrderStatus(inspectingManualOrder.id, nextSt);
                    setInspectingManualOrder({ ...inspectingManualOrder, status: nextSt });
                  }}
                  className="px-3 py-1.5 bg-white border border-[#D8C7BE] rounded text-xs font-medium"
                >
                  {(
                    [
                      'Pending',
                      'Confirmed',
                      'Processing',
                      'Shipped',
                      'Delivered',
                      'Cancelled',
                    ] as ManualOrderStatus[]
                  ).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#6E5D55] font-semibold mb-1.5">
                Formatted WhatsApp Order Transcript
              </p>
              <pre className="p-3.5 bg-[#FAF7F2] border border-[#E5D9D0] rounded-lg text-[11px] font-mono-tabular whitespace-pre-wrap max-h-48 overflow-y-auto">
                {buildWhatsAppOrderMessage(
                  inspectingManualOrder,
                  typeof window !== 'undefined' ? window.location.origin : ''
                )}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
       * MODAL 1: ADD / EDIT PRODUCT WITH FULL IMAGE MANAGEMENT (#13 & #14)
       * ====================================================================*/}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white border border-[#E5D9D0] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5D9D0] pb-4">
              <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2C221E]">
                {editingProduct.id ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
              </h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 text-[#6E5D55] hover:text-[#2C221E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                      slug:
                        editingProduct.slug ||
                        e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    })
                  }
                  placeholder="Handmade Rose Bracelet"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">SKU *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.sku}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Category *</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">URL Slug</label>
                <input
                  type="text"
                  value={editingProduct.slug}
                  onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Optional Product Video URL</label>
                <input
                  type="text"
                  value={editingProduct.videoUrl || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, videoUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={editingProduct.originalPrice}
                  onChange={(e) => {
                    const orig = Number(e.target.value);
                    const disc =
                      orig > editingProduct.salePrice
                        ? Math.round(((orig - editingProduct.salePrice) / orig) * 100)
                        : 0;
                    setEditingProduct({
                      ...editingProduct,
                      originalPrice: orig,
                      discountPercent: disc,
                    });
                  }}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Sale Price (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={editingProduct.salePrice}
                  onChange={(e) => {
                    const sale = Number(e.target.value);
                    const disc =
                      editingProduct.originalPrice > sale
                        ? Math.round(
                            ((editingProduct.originalPrice - sale) /
                              editingProduct.originalPrice) *
                              100
                          )
                        : 0;
                    setEditingProduct({
                      ...editingProduct,
                      salePrice: sale,
                      discountPercent: disc,
                    });
                  }}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Auto Discount %</label>
                <input
                  type="number"
                  readOnly
                  value={editingProduct.discountPercent}
                  className="w-full px-3 py-2 bg-[#EFE6DF] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Stock Quantity</label>
                <input
                  type="number"
                  min={0}
                  value={editingProduct.stock}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Low-Stock Alert</label>
                <input
                  type="number"
                  min={0}
                  value={editingProduct.lowStockThreshold}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      lowStockThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs font-mono-tabular"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Short Description</label>
                <input
                  type="text"
                  value={editingProduct.shortDescription}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, shortDescription: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                />
              </div>
            </div>

            {/* #14. MULTI-IMAGE MANAGEMENT (UPLOAD, DELETE, REORDER, SET PRIMARY) */}
            <div className="p-4 bg-[#FAF7F2] border border-[#E5D9D0] rounded-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-[#2C221E] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#737765]" />
                  <span>
                    Product Images ({editingProduct.images.length}) — First image is Primary
                  </span>
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3 py-1.5 bg-[#737765] text-white text-xs rounded cursor-pointer hover:bg-[#5E6252]">
                    + Upload Photo(s)
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleProductFileUpload}
                      className="hidden"
                    />
                  </label>

                  <select
                    value=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      setEditingProduct({
                        ...editingProduct,
                        images: [...editingProduct.images, e.target.value].slice(0, 8),
                      });
                    }}
                    className="px-2.5 py-1.5 bg-white border border-[#D8C7BE] rounded text-xs"
                  >
                    <option value="">+ Add from Studio Library...</option>
                    {STUDIO_IMAGE_PRESETS.map((p) => (
                      <option key={p.url} value={p.url}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customImageInput}
                  onChange={(e) => setCustomImageInput(e.target.value)}
                  placeholder="Or paste image URL..."
                  className="flex-1 px-3 py-1.5 bg-white border border-[#D8C7BE] rounded text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!customImageInput.trim()) return;
                    setEditingProduct({
                      ...editingProduct,
                      images: [...editingProduct.images, customImageInput.trim()].slice(0, 8),
                    });
                    setCustomImageInput('');
                  }}
                  className="px-3 py-1.5 bg-[#2C221E] text-white text-xs rounded"
                >
                  Add URL
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {editingProduct.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-[#D8C7BE] rounded-lg p-2 space-y-2"
                  >
                    <div className="aspect-square rounded overflow-hidden bg-[#F4EFEA] relative">
                      <ResilientImage
                        src={img}
                        alt={`Product image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-[#2C221E]/85 text-white text-[10px] px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      {idx > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...editingProduct.images];
                            const [picked] = next.splice(idx, 1);
                            next.unshift(picked);
                            setEditingProduct({ ...editingProduct, images: next });
                          }}
                          className="text-[#737765] hover:underline font-medium"
                        >
                          Set Primary
                        </button>
                      ) : (
                        <span className="text-[#8C7A70]">Cover</span>
                      )}

                      <div className="flex items-center gap-1">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...editingProduct.images];
                              [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                              setEditingProduct({ ...editingProduct, images: next });
                            }}
                            title="Move earlier"
                            className="p-1 hover:bg-[#F4EFEA] rounded"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                        )}
                        {idx < editingProduct.images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...editingProduct.images];
                              [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                              setEditingProduct({ ...editingProduct, images: next });
                            }}
                            title="Move later"
                            className="p-1 hover:bg-[#F4EFEA] rounded"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        )}
                        {editingProduct.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingProduct({
                                ...editingProduct,
                                images: editingProduct.images.filter((_, i) => i !== idx),
                              })
                            }
                            title="Delete image"
                            className="p-1 text-[#9E584D] hover:bg-[#FEF2F2] rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Variants, Tags & SEO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Product Variants (comma separated)
                </label>
                <input
                  type="text"
                  value={editingProduct.variants.join(', ')}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      variants: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editingProduct.tags.join(', ')}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      tags: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">SEO Title</label>
                <input
                  type="text"
                  value={editingProduct.seoTitle || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, seoTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">SEO Meta Description</label>
                <input
                  type="text"
                  value={editingProduct.seoDescription || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, seoDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C7BE] rounded text-xs"
                />
              </div>
            </div>

            {/* Product Flags */}
            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProduct.featured}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, featured: e.target.checked })
                  }
                  className="accent-[#737765]"
                />
                <span>Featured Product</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProduct.bestSeller}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, bestSeller: e.target.checked })
                  }
                  className="accent-[#737765]"
                />
                <span>Best Seller</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProduct.newArrival}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, newArrival: e.target.checked })
                  }
                  className="accent-[#737765]"
                />
                <span>New Arrival</span>
              </label>
            </div>

            {/* Action Buttons: Save Product, Publish, Save Draft */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E5D9D0]">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 border border-[#D8C7BE] text-xs rounded-md"
              >
                Cancel
              </button>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={async () => {
                    if (!editingProduct.name.trim()) {
                      showToast('Name Required', 'Please enter a product name.', 'error');
                      return;
                    }
                    await saveProduct({ ...editingProduct, status: 'draft' as ProductStatus });
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2.5 bg-[#FAF7F2] border border-[#D8C7BE] text-[#2C221E] text-xs font-medium rounded-md hover:bg-[#EFE6DF]"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (!editingProduct.name.trim()) {
                      showToast('Name Required', 'Please enter a product name.', 'error');
                      return;
                    }
                    await saveProduct(editingProduct);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-2.5 bg-[#2C221E] text-white text-xs font-medium rounded-md hover:bg-[#43352F]"
                >
                  Save Product
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (!editingProduct.name.trim()) {
                      showToast('Name Required', 'Please enter a product name.', 'error');
                      return;
                    }
                    await saveProduct({ ...editingProduct, status: 'published' as ProductStatus });
                    setEditingProduct(null);
                  }}
                  className="px-6 py-2.5 bg-[#737765] hover:bg-[#5E6252] text-white text-xs font-semibold rounded-md flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
       * MODAL 2: ORDER DETAILS INSPECTOR
       * ====================================================================*/}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white border border-[#E5D9D0] rounded-xl max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5D9D0] pb-3">
              <div>
                <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
                  Order Details — {inspectingOrder.id}
                </h2>
                <p className="text-xs text-[#6E5D55] font-mono-tabular">
                  Placed on {inspectingOrder.createdAt.slice(0, 10)}
                </p>
              </div>
              <button onClick={() => setInspectingOrder(null)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#FAF7F2] rounded-lg space-y-1">
                <p className="font-semibold text-[#2C221E]">Customer & Shipping Address</p>
                <p>{inspectingOrder.customerName}</p>
                <p>{inspectingOrder.customerEmail}</p>
                <p className="font-mono-tabular">{inspectingOrder.customerPhone}</p>
                <p className="pt-1 text-[#5A4A42]">
                  {inspectingOrder.shippingAddress}, {inspectingOrder.city}, {inspectingOrder.state}{' '}
                  - {inspectingOrder.pinCode}, {inspectingOrder.country}
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-lg space-y-1.5">
                <p className="font-semibold text-[#2C221E]">Payment & Fulfillment</p>
                <p>Method: {inspectingOrder.paymentMethod}</p>
                <p>Payment Status: {inspectingOrder.paymentStatus}</p>
                <p>Shipping: {inspectingOrder.shippingMethod}</p>
                <p>Order Status: {inspectingOrder.orderStatus}</p>
                {inspectingOrder.transactionRef && (
                  <p className="font-mono-tabular">Ref: {inspectingOrder.transactionRef}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#2C221E]">Ordered Items</p>
              {inspectingOrder.items && inspectingOrder.items.length > 0 ? (
                <div className="divide-y divide-[#F0E6DE] border border-[#E5D9D0] rounded-lg">
                  {inspectingOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <ResilientImage
                          src={item.productImage}
                          alt={item.productName}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div>
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-[#6E5D55]">
                            {item.variant} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono-tabular font-semibold">₹{item.lineTotal}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#5A4A42] p-3 bg-[#FAF7F2] rounded">
                  {inspectingOrder.itemsSummary}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-[#E5D9D0] flex justify-between items-center font-mono-tabular text-sm font-semibold">
              <span>Grand Total</span>
              <span>₹{inspectingOrder.grandTotal}</span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
       * MODAL 3: CUSTOMER PROFILE & ORDER HISTORY
       * ====================================================================*/}
      {inspectingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white border border-[#E5D9D0] rounded-xl max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5D9D0] pb-3">
              <div>
                <h2 className="font-serif-display text-2xl font-semibold text-[#2C221E]">
                  Customer Profile — {inspectingCustomer.displayName}
                </h2>
                <p className="text-xs text-[#6E5D55]">
                  {inspectingCustomer.email} · {inspectingCustomer.phone}
                </p>
              </div>
              <button onClick={() => setInspectingCustomer(null)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#FAF7F2] rounded border border-[#E5D9D0]">
                <span className="text-[#6E5D55] block">Total Orders</span>
                <span className="font-mono-tabular text-lg font-semibold">
                  {inspectingCustomer.totalOrders}
                </span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded border border-[#E5D9D0]">
                <span className="text-[#6E5D55] block">Lifetime Spend</span>
                <span className="font-mono-tabular text-lg font-semibold">
                  ₹{inspectingCustomer.totalSpent}
                </span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded border border-[#E5D9D0]">
                <span className="text-[#6E5D55] block">Account Tier</span>
                <span className="font-semibold">{inspectingCustomer.accountStatus}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif-display text-xl font-semibold">Customer Order History</h3>
              {orders
                .filter(
                  (o) =>
                    o.customerEmail.toLowerCase() === inspectingCustomer.email.toLowerCase() ||
                    o.userId === inspectingCustomer.uid
                )
                .map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 bg-[#FAF7F2] border border-[#E5D9D0] rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-mono-tabular font-semibold">{ord.id}</p>
                      <p className="text-[#5A4A42]">{ord.itemsSummary}</p>
                    </div>
                    <div className="text-right font-mono-tabular">
                      <p className="font-semibold">₹{ord.grandTotal}</p>
                      <p className="text-[#737765]">{ord.orderStatus}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

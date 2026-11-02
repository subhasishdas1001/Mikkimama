import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Persistent server-side store snapshot file
const DATA_FILE = path.resolve(process.cwd(), '.store-data.json');
const UPLOAD_DIR = path.resolve(process.cwd(), 'public/assets/uploads');

try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch {
  // Ignore if already exists
}

// Always serve uploaded files directly from UPLOAD_DIR in both dev and production
app.use(
  '/assets/uploads',
  express.static(UPLOAD_DIR, {
    maxAge: '365d',
    immutable: true,
  })
);

// Automatically extract any inline base64 images into static files under /public/assets/uploads/
// so .store-data.json stays lightweight (< 30 KB) and browser localStorage never overflows.
function normalizeBase64Images(val: unknown): unknown {
  if (typeof val === 'string' && val.startsWith('data:image/')) {
    const base64Marker = ';base64,';
    const base64Idx = val.indexOf(base64Marker);
    if (base64Idx !== -1) {
      try {
        const header = val.slice('data:image/'.length, base64Idx);
        const mimeSubtype = header.split(';')[0].toLowerCase().trim();
        let ext = mimeSubtype.replace(/[^a-z0-9]/g, '') || 'png';
        if (ext === 'jpeg') ext = 'jpg';
        if (ext === 'svgxml') ext = 'svg';
        const rawBase64 = val.slice(base64Idx + base64Marker.length).trim();
        const buf = Buffer.from(rawBase64, 'base64');
        if (buf.length > 0) {
          const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
          const fileName = `mkm-${hash}.${ext}`;
          const filePath = path.join(UPLOAD_DIR, fileName);
          if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, buf);
          }
          return `/assets/uploads/${fileName}`;
        }
      } catch (err) {
        console.error('Error normalizing base64 image:', err);
        return val;
      }
    }
  }
  if (Array.isArray(val)) {
    return val.map(normalizeBase64Images);
  }
  if (val && typeof val === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(val as Record<string, unknown>)) {
      out[k] = normalizeBase64Images((val as Record<string, unknown>)[k]);
    }
    return out;
  }
  return val;
}

function readServerStore(): Record<string, unknown> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      return (normalizeBase64Images(parsed) as Record<string, unknown>) || {};
    }
  } catch (err) {
    console.error('Error reading server store file:', err);
  }
  return {};
}

function writeServerStore(data: Record<string, unknown>): Record<string, unknown> {
  try {
    const normalized = normalizeBase64Images(data) as Record<string, unknown>;
    fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
    return normalized;
  } catch (err) {
    console.error('Error writing server store file:', err);
    return data;
  }
}

// Active admin tokens in memory
const activeAdminTokens = new Set<string>();

// 1. Admin Authentication Endpoint (Server-Side Verification)
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};
  const expectedEmail = (process.env.ADMIN_EMAIL || 'subhasishdas1001@gmail.com').toLowerCase().trim();
  const expectedPasscode = process.env.ADMIN_PASSCODE || 'mikkimama2026';

  if (
    typeof email === 'string' &&
    typeof password === 'string' &&
    (email.toLowerCase().trim() === expectedEmail || email.toLowerCase().trim() === 'admin@mikkimama.com') &&
    password === expectedPasscode
  ) {
    const token = crypto.randomBytes(24).toString('hex');
    activeAdminTokens.add(token);
    res.json({
      success: true,
      token,
      admin: {
        email: email.toLowerCase().trim(),
        name: 'Mikkimama Atelier Admin',
        role: 'admin',
      },
    });
    return;
  }

  res.status(401).json({
    success: false,
    error: 'Invalid admin credentials. Please verify your admin email and passcode.',
  });
});

// 2. Payment Gateway Configuration Status (Never exposes secret keys)
app.get('/api/payments/config', (_req, res) => {
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
  const hasRazorpaySecret = Boolean(process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET.length > 4);
  const isLiveKey = razorpayKeyId.startsWith('rzp_live_');

  res.json({
    gatewayProvider: 'Razorpay / Modular India Payments',
    razorpayConfigured: Boolean(razorpayKeyId && hasRazorpaySecret),
    mode: isLiveKey ? 'live' : 'sandbox',
    publicKeyPreview: razorpayKeyId ? `${razorpayKeyId.slice(0, 12)}•••` : 'Configured via Environment',
    serverVerificationReady: true,
  });
});

// 3. Modular Payment Order Creation & Server-Side Signature Generation
app.post('/api/payments/create-order', (req, res) => {
  const { amount, currency = 'INR', paymentMethod, customerEmail } = req.body || {};
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    res.status(400).json({ error: 'Valid order amount is required.' });
    return;
  }

  const gatewayOrderId = `order_mkm_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const secret = process.env.RAZORPAY_KEY_SECRET || 'mikkimama_server_hmac_secret';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${gatewayOrderId}|${Math.round(numericAmount * 100)}|${currency}`)
    .digest('hex');

  res.json({
    gatewayOrderId,
    amountInPaise: Math.round(numericAmount * 100),
    currency,
    paymentMethod: paymentMethod || 'UPI',
    customerEmail: customerEmail || '',
    signature,
    timestamp: new Date().toISOString(),
  });
});

// 4. Server-Side Payment Verification Endpoint
app.post('/api/payments/verify', (req, res) => {
  const { gatewayOrderId, amountInPaise, currency = 'INR', signature, paymentMethod } = req.body || {};

  if (paymentMethod === 'Cash on Delivery') {
    res.json({
      verified: true,
      paymentStatus: 'Pending',
      transactionRef: `COD-${Date.now().toString().slice(-6)}`,
    });
    return;
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || 'mikkimama_server_hmac_secret';
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${gatewayOrderId}|${amountInPaise}|${currency}`)
    .digest('hex');

  if (signature && signature === expectedSignature) {
    res.json({
      verified: true,
      paymentStatus: 'Paid',
      transactionRef: `PAY-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    });
    return;
  }

  res.status(400).json({
    verified: false,
    error: 'Payment signature verification failed.',
  });
});

// 5. Synchronous Pre-Render Store Hydration Script (Eliminates any initial render flash)
app.get('/api/store/init.js', (_req, res) => {
  const data = readServerStore();
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.send(`window.__MIKKIMAMA_STORE__ = ${JSON.stringify(data)};`);
});

// 6. Server-side Store State Sync & Image Upload Endpoints
app.get('/api/store/ping', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json({ ok: true, ts: Date.now() });
});

app.post('/api/store/upload-image', (req, res) => {
  const { dataUrl } = req.body || {};
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    res.status(400).json({ success: false, error: 'Invalid image dataUrl' });
    return;
  }
  const normalizedUrl = normalizeBase64Images(dataUrl);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json({
    success: true,
    url: typeof normalizedUrl === 'string' ? normalizedUrl : dataUrl,
  });
});

app.get('/api/store/state', (_req, res) => {
  const data = readServerStore();
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(data);
});

app.post('/api/store/state', (req, res) => {
  const current = readServerStore();
  const incomingBody = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<
    string,
    unknown
  >;
  const mergedSettings =
    incomingBody.settings && typeof incomingBody.settings === 'object'
      ? {
          ...((current.settings && typeof current.settings === 'object'
            ? current.settings
            : {}) as Record<string, unknown>),
          ...(incomingBody.settings as Record<string, unknown>),
        }
      : current.settings;

  const updated: Record<string, unknown> = {
    ...current,
    ...incomingBody,
    ...(mergedSettings ? { settings: mergedSettings } : {}),
    updatedAt: new Date().toISOString(),
  };
  const normalized = writeServerStore(updated);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json({
    success: true,
    updatedAt: normalized.updatedAt,
    settings: normalized.settings,
    products: normalized.products,
  });
});

// 7. SEO Endpoints: /robots.txt and /sitemap.xml
app.get('/robots.txt', (req, res) => {
  const baseUrl =
    process.env.APP_URL && !process.env.APP_URL.includes('MY_APP_URL')
      ? process.env.APP_URL.replace(/\/$/, '')
      : `${req.protocol}://${req.get('host')}`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /checkout',
      'Disallow: /account',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n')
  );
});

app.get('/sitemap.xml', (req, res) => {
  const baseUrl =
    process.env.APP_URL && !process.env.APP_URL.includes('MY_APP_URL')
      ? process.env.APP_URL.replace(/\/$/, '')
      : `${req.protocol}://${req.get('host')}`;
  const store = readServerStore();
  const products = Array.isArray(store.products) ? (store.products as Array<Record<string, unknown>>) : [];
  const staticPaths = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/shop', priority: '0.9', changefreq: 'daily' },
    { path: '/new-arrivals', priority: '0.8', changefreq: 'daily' },
    { path: '/best-sellers', priority: '0.8', changefreq: 'weekly' },
    { path: '/offers', priority: '0.7', changefreq: 'weekly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/reviews', priority: '0.7', changefreq: 'weekly' },
    { path: '/contact', priority: '0.6', changefreq: 'monthly' },
    { path: '/faq', priority: '0.6', changefreq: 'monthly' },
    { path: '/shipping-policy', priority: '0.4', changefreq: 'monthly' },
    { path: '/refund-policy', priority: '0.4', changefreq: 'monthly' },
    { path: '/privacy-policy', priority: '0.4', changefreq: 'monthly' },
    { path: '/terms', priority: '0.4', changefreq: 'monthly' },
  ];

  const urlsXml = [
    ...staticPaths.map(
      (u) => `  <url>
    <loc>${baseUrl}${u.path}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    ),
    ...products
      .filter((p) => p && p.status === 'published' && typeof p.slug === 'string')
      .map(
        (p) => `  <url>
    <loc>${baseUrl}/product/${encodeURIComponent(String(p.slug))}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      ),
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mikkimama Storefront & Admin Server running on http://localhost:${PORT}`);
  });
}

startServer();

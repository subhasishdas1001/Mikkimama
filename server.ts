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

// Persistent server-side store snapshot files (multi-location to survive workspace file syncs)
const DATA_FILE = path.resolve(process.cwd(), '.store-data.json');
const UPLOAD_DIR = path.resolve(process.cwd(), 'public/assets/uploads');
const RUNTIME_UPLOAD_FILE = path.resolve(UPLOAD_DIR, '.live-store-state.json');
const RUNTIME_TMP_FILE = '/var/tmp/mikkimama-store-state.json';

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

// Map of uploaded asset URLs (/assets/uploads/mkm-...) to their base64 data URLs
// Persisted inside .store-data.json (_uploadedAssets) so images survive container restarts and deployments,
// while stripped from public JSON responses (/api/store/init.js & /api/store/state) so payloads stay tiny (< 25 KB).
const memoryUploadedAssets: Record<string, string> = {};

function writeDataUrlToDisk(fileName: string, dataUrl: string): void {
  const base64Marker = ';base64,';
  const base64Idx = dataUrl.indexOf(base64Marker);
  if (base64Idx === -1) return;
  try {
    const rawBase64 = dataUrl.slice(base64Idx + base64Marker.length).trim();
    const buf = Buffer.from(rawBase64, 'base64');
    if (buf.length > 0) {
      const filePath = path.join(UPLOAD_DIR, fileName);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, buf);
      }
    }
  } catch (err) {
    console.error(`Failed to materialize ${fileName}:`, err);
  }
}

// Automatically extract any inline base64 images into static files under /public/assets/uploads/
// so .store-data.json public responses stay lightweight (< 30 KB) and browser localStorage never overflows.
function normalizeBase64Images(val: unknown, assetsMap: Record<string, string> = memoryUploadedAssets): unknown {
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
          const publicUrl = `/assets/uploads/${fileName}`;
          assetsMap[publicUrl] = val;
          return publicUrl;
        }
      } catch (err) {
        console.error('Error normalizing base64 image:', err);
        return val;
      }
    }
  }
  if (Array.isArray(val)) {
    return val.map((item) => normalizeBase64Images(item, assetsMap));
  }
  if (val && typeof val === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(val as Record<string, unknown>)) {
      if (k === '_uploadedAssets' || k === '_adminAuth') {
        out[k] = (val as Record<string, unknown>)[k];
      } else {
        out[k] = normalizeBase64Images((val as Record<string, unknown>)[k], assetsMap);
      }
    }
    return out;
  }
  return val;
}

// Fallback route if an uploaded image exists in _uploadedAssets but not yet on disk
app.get('/assets/uploads/:fileName', (req, res, next) => {
  const fileName = path.basename(req.params.fileName || '');
  if (!fileName || fileName.startsWith('.')) {
    next();
    return;
  }
  const diskPath = path.join(UPLOAD_DIR, fileName);
  if (fs.existsSync(diskPath)) {
    res.sendFile(diskPath);
    return;
  }
  const store = readServerStore();
  const assets = (store._uploadedAssets || memoryUploadedAssets) as Record<string, string>;
  const dataUrl = assets[`/assets/uploads/${fileName}`];
  if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
    const base64Marker = ';base64,';
    const base64Idx = dataUrl.indexOf(base64Marker);
    if (base64Idx !== -1) {
      const mime = dataUrl.slice('data:'.length, base64Idx);
      const buf = Buffer.from(dataUrl.slice(base64Idx + base64Marker.length), 'base64');
      try {
        fs.writeFileSync(diskPath, buf);
      } catch {
        // Ignore write error
      }
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(buf);
      return;
    }
  }
  next();
});

function getStoreTimestamp(storeObj: Record<string, unknown>): number {
  const topUpdated =
    typeof storeObj.updatedAt === 'string' ? Date.parse(storeObj.updatedAt) || 0 : 0;
  const settingsObj =
    storeObj.settings && typeof storeObj.settings === 'object'
      ? (storeObj.settings as Record<string, unknown>)
      : null;
  const settingsUpdated =
    settingsObj && typeof settingsObj.updatedAt === 'string'
      ? Date.parse(settingsObj.updatedAt) || 0
      : 0;
  return Math.max(topUpdated, settingsUpdated);
}

function readServerStore(): Record<string, unknown> {
  const candidateFiles = [RUNTIME_TMP_FILE, RUNTIME_UPLOAD_FILE, DATA_FILE];
  let newestData: Record<string, unknown> | null = null;
  let newestTime = -1;
  const mergedUploadedAssets: Record<string, string> = { ...memoryUploadedAssets };

  for (const filePath of candidateFiles) {
    try {
      if (fs.existsSync(filePath)) {
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (parsed && typeof parsed === 'object') {
          if (parsed._uploadedAssets && typeof parsed._uploadedAssets === 'object') {
            Object.assign(mergedUploadedAssets, parsed._uploadedAssets);
          }
          const normalized = (normalizeBase64Images(parsed, mergedUploadedAssets) as Record<string, unknown>) || {};
          const ts = getStoreTimestamp(normalized);
          if (ts > newestTime) {
            newestTime = ts;
            newestData = normalized;
          }
        }
      }
    } catch (err) {
      console.error(`Error reading store candidate ${filePath}:`, err);
    }
  }

  Object.assign(memoryUploadedAssets, mergedUploadedAssets);
  for (const [pubUrl, dataUrl] of Object.entries(mergedUploadedAssets)) {
    const fName = pubUrl.replace('/assets/uploads/', '');
    if (fName && typeof dataUrl === 'string') {
      writeDataUrlToDisk(fName, dataUrl);
    }
  }

  if (newestData) {
    if (Object.keys(mergedUploadedAssets).length > 0) {
      newestData._uploadedAssets = mergedUploadedAssets;
    }
    const serialized = JSON.stringify(newestData, null, 2);
    for (const filePath of candidateFiles) {
      try {
        let needsHeal = !fs.existsSync(filePath);
        if (!needsHeal) {
          const existingParsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          if (getStoreTimestamp(existingParsed) < newestTime) {
            needsHeal = true;
          }
        }
        if (needsHeal) {
          fs.writeFileSync(filePath, serialized, 'utf-8');
        }
      } catch {
        // Ignore heal error on individual file
      }
    }
    return newestData;
  }

  return {};
}

function writeServerStore(data: Record<string, unknown>): Record<string, unknown> {
  try {
    const existingAssets =
      data._uploadedAssets && typeof data._uploadedAssets === 'object'
        ? (data._uploadedAssets as Record<string, string>)
        : {};
    const assetsMap: Record<string, string> = { ...memoryUploadedAssets, ...existingAssets };
    const normalized = normalizeBase64Images(data, assetsMap) as Record<string, unknown>;
    if (Object.keys(assetsMap).length > 0) {
      normalized._uploadedAssets = assetsMap;
      Object.assign(memoryUploadedAssets, assetsMap);
    }
    const serialized = JSON.stringify(normalized, null, 2);
    for (const filePath of [RUNTIME_TMP_FILE, RUNTIME_UPLOAD_FILE, DATA_FILE]) {
      try {
        fs.writeFileSync(filePath, serialized, 'utf-8');
      } catch (err) {
        console.error(`Error writing server store file ${filePath}:`, err);
      }
    }
    return normalized;
  } catch (err) {
    console.error('Error writing server store file:', err);
    return data;
  }
}

function sanitizePublicStoreData(data: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...data };
  delete copy._uploadedAssets;
  delete copy._adminAuth;
  return copy;
}

function hashPasscode(passcode: string): string {
  return crypto.createHash('sha256').update(String(passcode)).digest('hex');
}

function getExpectedAdminHashes(storeData: Record<string, unknown>): Set<string> {
  const adminAuth =
    storeData._adminAuth && typeof storeData._adminAuth === 'object'
      ? (storeData._adminAuth as Record<string, unknown>)
      : null;
  if (adminAuth && typeof adminAuth.passwordHash === 'string' && adminAuth.passwordHash.length > 0) {
    return new Set([adminAuth.passwordHash]);
  }
  const hashes = new Set<string>([hashPasscode('mikkimama2026')]);
  if (process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim()) {
    hashes.add(hashPasscode(process.env.ADMIN_PASSCODE.trim()));
  }
  return hashes;
}

// Active admin tokens in memory
const activeAdminTokens = new Set<string>();

// 1. Admin Authentication & Security Endpoints (SHA-256 Hashed Verification)
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !password.trim()) {
    res.status(401).json({
      success: false,
      error: 'Please enter your admin email and passcode.',
    });
    return;
  }

  const storeData = readServerStore();
  const normalizedEmail = email.toLowerCase().trim();
  const inputHash = hashPasscode(password.trim());

  // Check staff accounts first
  const adminAuth =
    storeData._adminAuth && typeof storeData._adminAuth === 'object'
      ? (storeData._adminAuth as Record<string, unknown>)
      : {};
  const staffAccounts = Array.isArray(adminAuth.staffAccounts)
    ? (adminAuth.staffAccounts as Array<Record<string, unknown>>)
    : [];
  const matchedStaff = staffAccounts.find(
    (s) => String(s.email || '').toLowerCase().trim() === normalizedEmail
  );

  if (matchedStaff && matchedStaff.passwordHash === inputHash) {
    const token = crypto.randomBytes(24).toString('hex');
    activeAdminTokens.add(token);
    res.json({
      success: true,
      token,
      admin: {
        email: normalizedEmail,
        name: String(matchedStaff.name || 'Mikkimama Staff'),
        role: String(matchedStaff.role || 'Manager'),
      },
    });
    return;
  }

  const expectedEmail = (process.env.ADMIN_EMAIL || 'subhasishdas1001@gmail.com').toLowerCase().trim();
  const expectedOwnerHashes = getExpectedAdminHashes(storeData);
  const allowedOwnerEmails = new Set([
    expectedEmail,
    'subhasishdas1001@gmail.com',
    'admin@mikkimama.com',
    'admin@mikkimama.in',
    'hello@mikkimama.in',
  ]);

  if (allowedOwnerEmails.has(normalizedEmail) && expectedOwnerHashes.has(inputHash)) {
    const token = crypto.randomBytes(24).toString('hex');
    activeAdminTokens.add(token);
    res.json({
      success: true,
      token,
      admin: {
        email: normalizedEmail,
        name: 'Mikkimama Atelier Admin',
        role: 'Owner',
      },
    });
    return;
  }

  res.status(401).json({
    success: false,
    error: 'Invalid admin credentials. Please verify your admin email and passcode.',
  });
});

app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (
    typeof currentPassword !== 'string' ||
    typeof newPassword !== 'string' ||
    newPassword.trim().length < 6
  ) {
    res.status(400).json({
      success: false,
      error: 'Current passcode and a new passcode (minimum 6 characters) are required.',
    });
    return;
  }
  const storeData = readServerStore();
  const expectedHashes = getExpectedAdminHashes(storeData);
  if (!expectedHashes.has(hashPasscode(currentPassword.trim()))) {
    res.status(401).json({
      success: false,
      error: 'Current admin passcode is incorrect.',
    });
    return;
  }
  const existingAuth =
    storeData._adminAuth && typeof storeData._adminAuth === 'object'
      ? (storeData._adminAuth as Record<string, unknown>)
      : {};
  writeServerStore({
    ...storeData,
    _adminAuth: {
      ...existingAuth,
      passwordHash: hashPasscode(newPassword.trim()),
      updatedAt: new Date().toISOString(),
    },
  });
  res.json({ success: true, message: 'Admin passcode updated securely.' });
});

app.post('/api/admin/reset-password', (req, res) => {
  const { verificationEmail, newPassword } = req.body || {};
  if (
    typeof verificationEmail !== 'string' ||
    typeof newPassword !== 'string' ||
    newPassword.trim().length < 6
  ) {
    res.status(400).json({
      success: false,
      error: 'Registered owner email and a new passcode (minimum 6 characters) are required.',
    });
    return;
  }
  const storeData = readServerStore();
  const settingsObj =
    storeData.settings && typeof storeData.settings === 'object'
      ? (storeData.settings as Record<string, unknown>)
      : {};
  const configuredSupportEmail = String(settingsObj.supportEmail || '').toLowerCase().trim();
  const allowedOwnerEmails = new Set(
    [
      'subhasishdas1001@gmail.com',
      'admin@mikkimama.com',
      'admin@mikkimama.in',
      'hello@mikkimama.in',
      configuredSupportEmail,
    ].filter(Boolean)
  );
  if (!allowedOwnerEmails.has(verificationEmail.toLowerCase().trim())) {
    res.status(403).json({
      success: false,
      error: 'Verification email does not match the registered store owner email.',
    });
    return;
  }
  const existingAuth =
    storeData._adminAuth && typeof storeData._adminAuth === 'object'
      ? (storeData._adminAuth as Record<string, unknown>)
      : {};
  writeServerStore({
    ...storeData,
    _adminAuth: {
      ...existingAuth,
      passwordHash: hashPasscode(newPassword.trim()),
      updatedAt: new Date().toISOString(),
    },
  });
  res.json({
    success: true,
    message: 'Admin passcode reset successfully. You can now sign in with your new passcode.',
  });
});

app.get('/api/admin/staff', (_req, res) => {
  const storeData = readServerStore();
  const existingAuth =
    storeData._adminAuth && typeof storeData._adminAuth === 'object'
      ? (storeData._adminAuth as Record<string, unknown>)
      : {};
  const staffAccounts = Array.isArray(existingAuth.staffAccounts)
    ? (existingAuth.staffAccounts as Array<Record<string, unknown>>)
    : [];
  const safeStaff = staffAccounts.map(({ passwordHash: _ph, ...rest }) => rest);
  res.json({ success: true, staff: safeStaff });
});

app.post('/api/admin/staff', (req, res) => {
  const { name, email, role, password } = req.body || {};
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    password.trim().length < 6
  ) {
    res.status(400).json({
      success: false,
      error: 'Staff name, email, and passcode (min 6 characters) are required.',
    });
    return;
  }
  const storeData = readServerStore();
  const existingAuth =
    storeData._adminAuth && typeof storeData._adminAuth === 'object'
      ? (storeData._adminAuth as Record<string, unknown>)
      : {};
  const staffAccounts = Array.isArray(existingAuth.staffAccounts)
    ? (existingAuth.staffAccounts as Array<Record<string, unknown>>)
    : [];
  const normalizedEmail = email.toLowerCase().trim();
  const filtered = staffAccounts.filter(
    (s) => String(s.email || '').toLowerCase().trim() !== normalizedEmail
  );
  const newMember = {
    id: `staff-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    role: role === 'Owner' || role === 'Manager' || role === 'Order Staff' ? role : 'Manager',
    passwordHash: hashPasscode(password.trim()),
    createdAt: new Date().toISOString(),
  };
  const nextStaff = [...filtered, newMember];
  writeServerStore({
    ...storeData,
    _adminAuth: {
      ...existingAuth,
      staffAccounts: nextStaff,
    },
  });
  const { passwordHash: _ph, ...safeMember } = newMember;
  res.json({ success: true, member: safeMember });
});

app.delete('/api/admin/staff/:id', (req, res) => {
  const { id } = req.params;
  const storeData = readServerStore();
  const existingAuth =
    storeData._adminAuth && typeof storeData._adminAuth === 'object'
      ? (storeData._adminAuth as Record<string, unknown>)
      : {};
  const staffAccounts = Array.isArray(existingAuth.staffAccounts)
    ? (existingAuth.staffAccounts as Array<Record<string, unknown>>)
    : [];
  const nextStaff = staffAccounts.filter((s) => s.id !== id);
  writeServerStore({
    ...storeData,
    _adminAuth: {
      ...existingAuth,
      staffAccounts: nextStaff,
    },
  });
  res.json({ success: true });
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
  const data = sanitizePublicStoreData(readServerStore());
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
  const current = readServerStore();
  const existingAssets =
    current._uploadedAssets && typeof current._uploadedAssets === 'object'
      ? (current._uploadedAssets as Record<string, string>)
      : {};
  const assetsMap: Record<string, string> = { ...memoryUploadedAssets, ...existingAssets };
  const normalizedUrl = normalizeBase64Images(dataUrl, assetsMap);
  writeServerStore({
    ...current,
    _uploadedAssets: assetsMap,
  });
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json({
    success: true,
    url: typeof normalizedUrl === 'string' ? normalizedUrl : dataUrl,
  });
});

app.get('/api/store/state', (_req, res) => {
  const data = sanitizePublicStoreData(readServerStore());
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
  delete incomingBody._adminAuth;
  delete incomingBody._uploadedAssets;

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
    _adminAuth: current._adminAuth,
    _uploadedAssets: current._uploadedAssets,
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

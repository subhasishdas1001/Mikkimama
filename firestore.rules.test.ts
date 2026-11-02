/**
 * Firestore Security Rules Test Suite for Mikkimama
 * Verifies all 12 "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const dirtyDozenTests: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on Product (isVerified: true)',
    collectionPath: '/products/prod-1',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'subhasishdas1001@gmail.com', email_verified: true },
    payload: { id: 'prod-1', name: 'Rose Bracelet', isVerified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Admin Email Spoof',
    collectionPath: '/products/prod-1',
    operation: 'delete',
    auth: { uid: 'spoof-admin', email: 'subhasishdas1001@gmail.com', email_verified: false },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Self-Approved Customer Review',
    collectionPath: '/reviews/rev-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'customer@example.com', email_verified: true },
    payload: { id: 'rev-1', productId: 'prod-1', userId: 'user-1', status: 'approved', featured: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Orphaned Review for Non-Existent Product',
    collectionPath: '/reviews/rev-2',
    operation: 'create',
    auth: { uid: 'user-1', email: 'customer@example.com', email_verified: true },
    payload: { id: 'rev-2', productId: 'non-existent-prod', userId: 'user-1', status: 'pending', featured: false },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Identity Spoofing on Order Creation',
    collectionPath: '/orders/ord-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'customer@example.com', email_verified: true },
    payload: { id: 'ord-1', userId: 'user-2', orderStatus: 'Pending' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Order Status Shortcut on Creation',
    collectionPath: '/orders/ord-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'customer@example.com', email_verified: true },
    payload: { id: 'ord-1', userId: 'user-1', orderStatus: 'Delivered' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'PII Blanket Read on Another User Private Info',
    collectionPath: '/users/user-2/private/info',
    operation: 'get',
    auth: { uid: 'user-1', email: 'customer@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Unfiltered Scraping of Orders',
    collectionPath: '/orders',
    operation: 'list',
    auth: { uid: 'user-1', email: 'customer@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'ID Poisoning Attack (Oversized Document ID)',
    collectionPath: `/orders/${'a'.repeat(200)}`,
    operation: 'create',
    auth: { uid: 'user-1', email: 'customer@example.com', email_verified: true },
    payload: { id: 'a'.repeat(200), userId: 'user-1', orderStatus: 'Pending' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Denial-of-Wallet Oversized Array on Product',
    collectionPath: '/products/prod-1',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'subhasishdas1001@gmail.com', email_verified: true },
    payload: { id: 'prod-1', tags: Array.from({ length: 25 }, (_, i) => `tag-${i}`) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Forged Client Timestamp on Order Creation',
    collectionPath: '/orders/ord-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'customer@example.com', email_verified: true },
    payload: { id: 'ord-1', userId: 'user-1', createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Mutating Immutable Order Owner on Update',
    collectionPath: '/orders/ord-1',
    operation: 'update',
    auth: { uid: 'admin-1', email: 'subhasishdas1001@gmail.com', email_verified: true },
    payload: { id: 'ord-1', userId: 'hijacked-user' },
    expectedResult: 'PERMISSION_DENIED',
  },
];

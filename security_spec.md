# Mikkimama Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants

1. **Global Default Deny**: Any collection path not explicitly matched is denied for both read and write (`allow read, write: if false;`).
2. **Verified Identity & Admin Authority**:
   - All authenticated customer writes require `request.auth != null && request.auth.token.email_verified == true`.
   - `isAdmin()` is true ONLY if `request.auth != null && request.auth.token.email_verified == true` AND either `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` OR `request.auth.token.email == 'subhasishdas1001@gmail.com'`.
3. **Catalog Integrity (`products`, `categories`, `coupons`, `settings`)**:
   - Only `isAdmin()` can create, update, or delete products, categories, coupons, or store settings.
   - All product arrays (`images`, `variants`, `tags`) are strictly bounded (`<= 10` items) and type-checked on the first element.
4. **Order & Line Item Relational Sync (`orders/{orderId}`, `orders/{orderId}/items/{itemId}`)**:
   - An order can only be created by its authenticated owner (`incoming().userId == request.auth.uid`) in initial state `orderStatus == 'Pending'`, with `createdAt == request.time` and `updatedAt == request.time`.
   - Line items under `/orders/{orderId}/items/{itemId}` enforce the **Master Gate**: the parent `/orders/{orderId}` must exist (`exists(...)` or `existsAfter(...)`) and its `userId` must match `request.auth.uid` (or `isAdmin()`).
   - Once an order reaches a terminal state (`Delivered`, `Cancelled`, `Refunded`), non-admin updates are locked. Only `isAdmin()` can update order status or payment status, and `userId` + `createdAt` remain strictly immutable.
5. **Review Moderation Gate (`reviews/{reviewId}`)**:
   - Customers can only create a review if `incoming().userId == request.auth.uid`, `incoming().status == 'pending'`, `incoming().featured == false`, and the target product `exists(/databases/$(database)/documents/products/$(incoming().productId))`.
   - Public `list` queries on `reviews` must filter `resource.data.status == 'approved'` (unless `isAdmin()` or owner `resource.data.userId == request.auth.uid`).
   - Only `isAdmin()` can approve, reject, feature, or delete reviews.
6. **PII Split Isolation (`users/{userId}` vs `users/{userId}/private/{docId}`)**:
   - Customer PII (`email`, `phone`, `address`, `pinCode`) is isolated inside `/users/{userId}/private/{docId}` and `/orders/{orderId}`, readable strictly by the owner (`request.auth.uid == userId`) or `isAdmin()`.

---

## 2. The "Dirty Dozen" Payloads

1. **Shadow Field Injection on Product (`isVerified: true`)**: Admin or user sends an extra undeclared property `isVerified: true` on `/products/prod-1`. Rejected by `.keys().hasOnly(...)`.
2. **Unverified Admin Email Spoof**: Attacker signs in with `email: 'subhasishdas1001@gmail.com'` and `email_verified: false`, attempting to write `/products/prod-1`. Rejected by `request.auth.token.email_verified == true`.
3. **Self-Approved Customer Review**: Customer creates `/reviews/rev-1` with `status: 'approved'` or `featured: true`. Rejected because customer `create` requires `incoming().status == 'pending' && incoming().featured == false`.
4. **Orphaned Review for Non-Existent Product**: Customer creates `/reviews/rev-2` referencing `productId: 'ghost-prod-999'` that does not exist in `/products`. Rejected by `exists(/databases/$(database)/documents/products/$(incoming().productId))`.
5. **Identity Spoofing on Order Creation**: Customer `uid_A` creates `/orders/ord-1` with `userId: 'uid_B'`. Rejected by `incoming().userId == request.auth.uid`.
6. **Order Status Shortcut on Creation**: Customer creates `/orders/ord-1` with `orderStatus: 'Delivered'` or `paymentStatus: 'Paid'` without admin privilege. Rejected by `incoming().orderStatus == 'Pending'`.
7. **PII Blanket Read on Another User's Private Info**: Authenticated user `uid_A` attempts `get` on `/users/uid_B/private/info`. Rejected because `userId != request.auth.uid && !isAdmin()`.
8. **Unfiltered Scraping of Orders (`list` without owner filter)**: Authenticated user `uid_A` runs an unfiltered `list` query on `/orders`. Rejected by Pillar 8 (`resource.data.userId == request.auth.uid || isAdmin()`).
9. **ID Poisoning Attack (2KB Document ID)**: Attacker attempts to create `/orders/{2000_char_id}`. Rejected by `isValidId(orderId)` (`id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
10. **Denial-of-Wallet Oversized Array on Product**: Attacker or faulty client sends `tags` with 500 strings on `/products/prod-1`. Rejected by `data.tags.size() <= 10`.
11. **Forged Client Timestamp (`createdAt` in the past)**: Client attempts to create `/orders/ord-1` with `createdAt: Timestamp(2020, 1, 1)`. Rejected by `incoming().createdAt == request.time`.
12. **Mutating Immutable Order Owner (`userId`) on Update**: Admin or user attempts to change `userId` or `createdAt` on an existing `/orders/ord-1`. Rejected by `incoming().userId == existing().userId && incoming().createdAt == existing().createdAt`.

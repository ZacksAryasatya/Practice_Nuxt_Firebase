# Product Requirements: Firebase Inventory Admin Panel

| Field | Value |
|---|---|
  | Project | Firebase Admin Panel |
| Version | 0.1.0-beta.1 |
| Status | Draft for learning MVP |
| Last updated | 2026-10-08 |

## 1. Overview

A responsive web panel for a small shop administrator to manage product and category records. This is a learning project for Nuxt, Tailwind CSS, Firebase Authentication, Cloud Firestore, and Firebase Security Rules, with a strict no-billing constraint.

## 2. Goals

- Learn a maintainable Nuxt application structure with TypeScript.
- Implement authenticated admin access and secure Firestore access.
- Deliver product and category CRUD with useful validation and feedback.
- Show data changes in real time where it improves the workflow.
- Keep the project on no-cost Firebase services and do not enable billing or upgrade to a paid plan.
- Use Cloud Firestore for data and client-side auto-compressed Base64 image storage, eliminating external storage dependencies and maintaining 100% Firebase architecture.

## 3. Non-goals for MVP

- Public storefront, checkout, payments, suppliers, or purchase orders.
- Analytics and exports for stock movement history.
- Multiple roles or organization/tenant support; one administrator is assumed.
- Custom REST API/backend or Firebase Admin SDK. The Nuxt client uses Firebase Web SDK.
- Bulk imports, notifications, Cloud Functions, and any feature requiring a billing upgrade.

## 4. Users

| User | Needs |
|---|---|
| Administrator | Sign in, manage categories and products, and see updates without manually refreshing. |

Account provisioning is performed outside public signup (for example, create the initial account in Firebase Console). The MVP does not expose an open registration page.

## 5. MVP scope and requirements

### Authentication

- Admin can sign in using the configured Firebase Authentication provider.
- Unauthenticated visitors cannot access protected dashboard pages or data.
- Admin can sign out; protected views return to sign-in after sign-out.
- No public account creation or password reset flow is included in the initial MVP.

### Categories

- List, create, edit, and delete categories.
- Category has a required name and optional description.
- Prevent deleting a category that is assigned to products, unless products are reassigned first.
- Category names are trimmed and unique according to a normalized comparison.

### Products

- List, create, view, edit, and delete products.
- Product fields: name, SKU, description, category, price, status, and timestamps. Stock balance is maintained only through movements.
- Name, SKU, category, and price are required; description is optional.
- SKU is unique; price must be non-negative and stored as integer IDR rupiah.
- New products start with zero stock; balance changes are append-only movement transactions.
- Product list supports text search, category filter, status filter, and pagination or bounded loading.
- Deletion requires confirmation.
- Product CRUD cannot directly change `stockQuantity`.
- Product create/edit validates on the client for usability and in trusted rules/server logic where possible. Firestore Rules must validate authorization and structural constraints; do not assume they can enforce cross-document uniqueness atomically by themselves.

### Product files

- Store product images directly inside Cloud Firestore using client-side auto-compressed Base64 data strings (`photoBase64`).
- Images are automatically scaled to max 600px and converted to WebP with target length <= 300.000 characters (~225 KB), keeping documents far below Firestore's 1 MiB limit.
- External cloud storage dependencies are removed to maintain 100% Firebase Spark zero-cost operations.

### Stock movements

- Admin records stock-in or stock-out with product, positive integer quantity, and required reason.
- A Firestore transaction updates the balance and appends a movement record atomically.
- Reject stock-out that would make the balance negative.
- Movement records include previous/new balance, server timestamp, and authenticated admin UID/email; clients cannot edit or delete records.
- Show the latest 50 movements.
- Movement history supports client-side search, type filtering, and pagination over the latest 50 loaded records.
- Admin can adjust the global low-stock threshold stored at `settings/inventory`; it applies consistently across admin devices and does not alter inventory data.
- Admin can export the currently filtered movement history as a formatted Excel `.xlsx` file generated in the browser.

### Realtime and UI states

- Use Firestore listeners for the product/category views where live updates are useful; unsubscribe when the view is disposed.
- Show loading, empty, success, and actionable error states.
- Keep forms accessible, responsive, keyboard operable, and clear about validation errors.

## 6. Product decisions and assumptions

- Application language: Indonesian UI; code identifiers and repository documentation use English.
- Currency: IDR, stored as integer rupiah.
- Time values: Firestore server timestamps; display in the user's local timezone.
- One admin role in MVP. Authorization is enforced by Firebase Security Rules, not by hiding UI controls.
- Cost guardrail: do not link a payment method, enable billing, upgrade Firebase to Blaze, or deploy a service that requires billing. Stop if prompted for a paid upgrade.
- No committed credentials. Firebase web configuration is supplied through public Nuxt runtime configuration/environment variables; it is not a secret. Admin SDK credentials, if added in a later server feature, must remain server-only.
- Development and production use separate Firebase projects. Do not test against production data.

## 7. Acceptance criteria

1. A signed-out user cannot read or write protected inventory data, even by calling Firebase directly.
2. An authorized admin can complete category and product CRUD and receives clear success/error feedback.
3. Invalid required fields, negative price/stock, invalid SKU, and invalid/oversized image files are rejected.
4. Product list can search/filter and reflects updates from another authorized client without manual refresh.
5. Product images are stored directly in Cloud Firestore as compressed Base64 strings; external storage services are not required.
6. Category deletion is prevented while referenced by a product.
7. The app works on mobile and desktop widths, has keyboard-accessible forms/actions, and does not expose secrets in client bundles.

## 8. Success measures

- Complete product/category CRUD manually using the UI.
- Security Rules tests demonstrate denied unauthenticated access and allowed authorized access.
- No production credentials/data are used during development.
- Learner can explain the collection model, auth flow, realtime subscription lifecycle, and authorization rules.

## 9. Risks and constraints

- Free-tier terms and quotas may change. Spark plan limits apply; avoid high-volume tests and do not upgrade to Blaze.
- Firestore is document-oriented, not relational. Avoid treating the conceptual ERD as a set of SQL tables.
- Uniqueness and referential integrity across documents need careful design; transactions/security-rule constraints or a trusted server may be needed as the app grows.
- Realtime listeners consume quota; query with limits and avoid unnecessary listeners. Free quotas can be exhausted, so avoid high-volume tests.

## 10. Later milestones

1. Server-side/export-all stock movement history beyond the latest loaded records.
2. Trusted server endpoints/Cloud Functions only if an explicitly approved no-cost option is verified; otherwise keep such features out of scope.
3. Role-based access and additional operational reporting.

# Security and Access

## Terminology

The project uses **Firestore Security Rules** for comprehensive server-side authorization. Direct client SDK operations against Firestore and Cloud Messaging are guarded strictly by rules and tokens.

## Identity and admin provisioning

- Use Firebase Authentication; disable public account creation for the MVP.
- Provision the initial admin account through a controlled Firebase Console process.
- Rules must check `request.auth` and an explicit admin authorization condition. Do not grant access to every authenticated account if arbitrary users could sign up.
- For a single-admin learning project, document the selected admin identity/claim setup. A UID allowlist is simple but requires careful environment-specific configuration; custom claims require trusted Admin SDK provisioning. Never let a client assign itself an admin role.
- Ensure development and production have distinct allowlists/configuration and identities.

## Rules requirements

### Firestore

- Deny access by default; explicitly allow only intended collections and operations.
- Require authenticated admin for product/category reads and writes.
- Validate allowed field names, field types, string bounds, enum values, non-negative numeric values, and immutable fields such as `createdAt` on update.
- Require server timestamps for creation/update fields where feasible.
- Product balance cannot change without a matching stock movement in the same atomic transaction; movement records are immutable.
- Before deploying those stricter rules to a database that already has products, run the one-time local `npm run migrate-stock-ledger` script to record opening balances. The script uses Admin SDK locally, refuses to run if movements already exist, and must never be deployed as a function.
- Do not trust client-side route middleware or disabled buttons as authorization.
- Avoid broad recursive allow rules and never deploy test-mode rules.

## Nuxt and Firebase practices

- Initialize Firebase Web SDK through a client-safe Nuxt plugin and typed runtime config. Public Firebase web config is not a secret, but privileged credentials are.
- Keep service-account keys and Firebase Admin SDK exclusively server-side and out of `runtimeConfig.public`, source control, and client bundles.
- Protect pages for UX with auth state; still rely on rules for actual data protection.
- Subscribe to auth state and realtime listeners using composables/services with lifecycle cleanup and error handling.
- Never log credentials, tokens, or sensitive data. Avoid placing user data in URLs.
- Use HTTPS in deployed environments and keep dependencies updated deliberately.

## Environments and operations

- Create separate Firebase projects for development/staging and production.
- Use `.env.example` with placeholders only; never commit `.env` or real credentials.
- Use Firebase Emulator Suite for Auth and Firestore rules development/tests where supported.
- Review deployed rules and indexes before release. Test both allowed and denied cases.
- Check current Firebase free-plan terms and quotas before deployment; do not activate billing for this project.

## Cost guardrail

- Use Firebase Spark free tier only. Do not enable Firebase Cloud Storage, link a payment method, or upgrade to Blaze.
- Product images are stored directly in Firestore as auto-compressed Base64, completely removing external object storage dependencies.

## Threat cases to test

1. Signed-out client reads or writes products/categories/movements.
2. Authenticated non-admin reads/writes data.
3. Admin attempts unsupported fields, invalid types, negative amounts, or forbidden timestamp changes.
4. Client attempts storing uncompressed/oversized Base64 image (> 350.000 characters).
5. Production app is accidentally configured against development project or vice versa.
6. Application unexpectedly initializes or requests a billing-dependent service.

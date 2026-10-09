# Testing Plan

## Test layers

1. **Unit/component:** field validation, formatting, reusable form states, and UI behavior.
2. **Authorization tests:** Firestore Rules and Supabase Storage policies, using Firebase Emulator Suite and a Supabase local/test project where practical.
3. **Integration:** Authentication state, CRUD service calls, realtime subscription cleanup, and Supabase upload/signed URL flow.
4. **Manual acceptance:** responsive layout, keyboard interaction, and complete admin workflows.

Do not use production data or credentials for tests.

## Rules test matrix

| Scenario | Expected |
|---|---|
| Signed out reads/writes product or category | Denied |
| Authenticated non-admin reads/writes | Denied |
| Authorized admin reads and validly writes data | Allowed |
| Admin writes invalid type, unknown field, negative price/stock | Denied |
| Admin changes immutable `createdAt` | Denied |
| Direct product stock edit without a matching movement | Denied |
| Admin creates valid movement with matching balance update in one transaction | Allowed |
| Stock-out exceeds current balance | Denied; neither write commits |
| Client updates/deletes a movement document | Denied |
| Admin uploads supported image within 5 MB under intended bucket/path | Allowed |
| Unsupported/oversized image or wrong bucket/path | Denied |
| Unauthenticated or non-admin Supabase Storage access | Denied |

## Functional acceptance checklist

- [ ] Login succeeds for provisioned admin; invalid credentials show a safe error.
- [ ] Unauthenticated visit to protected page redirects to login.
- [ ] Sign out clears access and redirects to login.
- [ ] Create/edit/delete category works; duplicate normalized name is handled.
- [ ] Category assigned to a product cannot be deleted.
- [ ] Create/edit product validates required values and non-negative integer price/stock.
- [ ] Product SKU duplicate is handled and uniqueness limitations are documented.
- [ ] New product starts at zero stock; stock changes only through movement form.
- [ ] Movement atomically updates balance and writes reason/admin attribution.
- [ ] Stock-out above available balance is rejected without partial writes.
- [ ] Movement history search and in/out filter return the expected rows.
- [ ] Movement pagination changes pages and resets when search/filter changes.
- [ ] Low-stock threshold is loaded from and saved to `settings/inventory`, applies after refresh/another device, and does not change product stock.
- [ ] Excel export includes the currently filtered movement rows with compact summary, styled table header, filters, frozen header, column widths, and stock type coloring; no report title banner.
- [ ] Search, category/status filters, and bounded pagination behave correctly.
- [ ] Delete requires confirmation.
- [ ] Realtime updates arrive from a second authorized client; listener is removed when leaving the view.
- [ ] Valid product image uploads to Supabase Storage and renders through a signed URL; invalid type/oversized file is rejected.
- [ ] Firebase ID token with `authenticated` and `admin` claims is accepted by registered Supabase integration; Storage RLS denies other identities.
- [ ] Product photo replace/delete works; partial failures are surfaced for cleanup.
- [ ] Empty, loading, success, and failure states are understandable.
- [ ] Keyboard-only navigation, focus visibility, labels, and dialog behavior are usable.
- [ ] Mobile and desktop layouts remain usable.
- [ ] Production build contains no service account or private key.

## Release checks

- Run lint, type-check, and build commands defined by the Nuxt project.
- Run emulator rules tests before deploying rules.
- Verify environment points at intended Firebase project and inspect rules/index changes.
- Confirm Firebase remains on Spark and Supabase remains on Free, with no paid upgrade or billing-dependent feature enabled.
- Back up/review existing inventory, run opening-balance migration once if products already exist, then publish the new Firestore rules.
- Check current free-plan quotas before deployment; stop before any paid upgrade.

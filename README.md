# Firebase Inventory Admin Panel

Learning project: a small-shop inventory admin panel built with Nuxt, Tailwind CSS, and Firebase.

## Planned stack

- Nuxt with TypeScript
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore (client SDK and selected realtime listeners)
- Supabase Storage Free for product images (private bucket and access policies)
- Firestore Security Rules

## MVP

Admin sign-in and CRUD for products/categories, search/filter, realtime list updates, and product image upload to Supabase Storage Free using Supabase's Firebase third-party Auth integration. Firebase Cloud Storage is not used. Custom REST API, stock ledger, and multi-role access are later milestones.

## Documentation

See [`docs/`](docs/) for requirements, user flows, wireframes, Firestore model, security/access, and test plan.

## Setup

Requirements: Node.js 20 or later and npm.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and fill in Firebase web config plus Supabase URL/publishable key. These client keys are public identifiers; keep service-account and Supabase `service_role` keys out of the app.
3. In a dedicated Firebase development project, enable Email/Password Authentication and create the initial admin account manually. Do not enable public registration.
4. Create a Supabase Free project and configure Supabase Auth > Third-party Auth to trust the Firebase project. Create a private `product-images` bucket and apply least-privilege Storage RLS policies before upload is implemented.
5. Start Nuxt with `npm run dev`.

The scaffold provides Firebase admin sign-in, realtime Firestore CRUD for products/categories, stock-in/out tracking with an append-only movement history, and product photo upload to private Supabase Storage. Firestore rules are in `firestore.rules`; the Supabase project must have the Firebase third-party integration and restrictive Storage policies configured before uploads. Confirm Firebase Spark and Supabase Free remain selected.

Before publishing the updated stock rules, migrate existing product balances once using the trusted local service-account credential. Review `scripts/migrate-stock-ledger.mjs`; it refuses to run if the movement collection already contains records. Set `FIREBASE_SERVICE_ACCOUNT_PATH` and `FIREBASE_PROJECT_ID`, then run `npm run migrate-stock-ledger`. The script uses the Admin SDK locally and does not deploy a function.

Commands: `npm run dev`, `npm run typecheck`, and `npm run build`.

**No-billing constraint:** use Firebase Spark and Supabase Free only. Do not add a payment method or upgrade either service. Free quotas and terms can change; stop before a paid upgrade and check current limits before deployment.

## Version

See [`version.json`](version.json) and [`CHANGELOG.md`](CHANGELOG.md).

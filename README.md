# Firebase Inventory Admin Panel

Learning project: a small-shop inventory admin panel built with Nuxt, Tailwind CSS, and Firebase.

## Planned stack

- Nuxt with TypeScript
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore (client SDK, realtime listeners, atomic transactions, Base64 image storage)
- Firebase Cloud Messaging (FCM Web Push Notifications)
- Firestore Security Rules

## MVP

Admin sign-in and CRUD for products/categories, stock-in/out tracking with an append-only movement history, realtime list updates, compressed Base64 photo storage in Firestore, and FCM push notifications. Custom REST API and multi-role access are later milestones.

## Documentation

See [`docs/`](docs/) for requirements, user flows, wireframes, Firestore model, security/access, and test plan.

## Setup

Requirements: Node.js 20 or later and npm.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and fill in Firebase web config + VAPID key. These client keys are public identifiers; keep service-account keys out of the app.
3. In a dedicated Firebase development project, enable Email/Password Authentication and create the initial admin account manually. Do not enable public registration.
4. Set Firestore Security Rules from `firestore.rules` and publish them in the Firebase Console.
5. Start Nuxt with `npm run dev`.

The application provides Firebase admin sign-in, realtime Firestore CRUD for products/categories, stock-in/out tracking with an append-only movement history, and FCM Web Push Notifications.

## Free Deployment to Firebase Hosting

This project is configured for static SPA generation to run 100% free on Firebase Hosting (Spark Plan):

1. Generate static bundle:
   ```bash
   npm run generate
   ```
2. Login to Firebase CLI (one-time):
   ```bash
   npx firebase login
   ```
3. Deploy directly to Firebase Hosting:
   ```bash
   npx firebase deploy --only hosting
   ```

Commands: `npm run dev`, `npm run typecheck`, `npm run build`, and `npm run generate`.

**No-billing constraint:** use Firebase Spark only. Do not add a payment method or upgrade to Blaze. Free quotas and terms can change; stop before a paid upgrade.

## Version

See [`version.json`](version.json) and [`CHANGELOG.md`](CHANGELOG.md).

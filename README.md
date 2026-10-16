# Firebase Inventory Admin Panel

A modern, responsive web application for managing retail store inventory, tracking product stock movements, and receiving stock alerts. Built with Nuxt 3, Tailwind CSS, and Firebase.

Live Demo: [https://fir-admin-panel-dev.web.app](https://fir-admin-panel-dev.web.app)

---

## Overview

Firebase Inventory Admin Panel is designed to help small-to-medium retail owners oversee their catalog and stock operations in real-time. The application focuses on speed, simplicity, and zero-cost serverless hosting.

### Key Features

- **Authentication & Security**: Protected admin access via Email/Password and Google OAuth with Firebase Admin Custom Claims validation.
- **Product Management**: Complete CRUD operations for products with category assignments, SKU, pricing, low-stock alerts, and optimized photo uploads.
- **Category Management**: Organize items with customizable category names, codes, and color tags.
- **Stock Movements (In/Out)**: Record inbound restocks and outbound adjustments with an append-only transaction history to prevent stock discrepancies.
- **Realtime Dashboard**: Live metric counters for low-stock warnings, total inventory valuation, and recent activity logs.
- **Data Export**: Export inventory and stock logs directly to formatted Excel (.xlsx) files.
- **Push Notifications (FCM)**: Web push notification token registration for immediate stock alerts.

---

## Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3, Vite, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Google Firebase](https://firebase.google.com/)
  - Firebase Authentication (Email/Password & Google Sign-In)
  - Cloud Firestore (Realtime database & transactions)
  - Firebase Cloud Messaging (FCM Web Push)
  - Firebase Hosting (Static SPA deployment)
- **Spreadsheet Generation**: `xlsx-js-style`

---

## Project Structure

```text
├── assets/          # Global styles and static assets
├── components/      # Reusable Vue UI components
├── composables/     # Business logic and Firebase client state
├── docs/            # Architecture, data models, and specifications
├── public/          # Static files and Service Worker (FCM)
├── scripts/         # Administrative scripts (claim assignment, migrations)
├── types/           # TypeScript data interfaces
├── .env.example     # Environment template
├── firebase.json    # Firebase deployment rules
└── firestore.rules  # Firestore database access rules
```

---

## Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

- **Node.js**: Version 20.x or higher
- **Package Manager**: `npm`
- **Firebase Account**: Free tier (Spark plan) is sufficient

### 1. Clone Repository

```bash
git clone https://github.com/ZacksAryasatya/Practice_Nuxt_Firebase.git
cd Practice_Nuxt_Firebase
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Duplicate `.env.example` into `.env`:

```bash
cp .env.example .env
```

Fill in your Firebase project configuration values in `.env`:

```env
NUXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NUXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NUXT_PUBLIC_FIREBASE_VAPID_KEY=your_fcm_vapid_key
```

### 4. Firestore Security Rules

Deploy the rules from `firestore.rules` into your Firebase Console under **Firestore Database > Rules** to secure collection access.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local development server at `http://localhost:3000` |
| `npm run build` | Compiles and builds the production application |
| `npm run generate` | Generates pre-rendered static files in `.output/public` |
| `npm run typecheck` | Runs Vue TypeScript type diagnostics |
| `npm run deploy:hosting` | Builds static assets and deploys directly to Firebase Hosting |

---

## Deployment (Firebase Hosting)

The application is configured to deploy seamlessly to Firebase Hosting on the free Spark tier:

```bash
# 1. Login to Firebase (first time only)
npx firebase login

# 2. Build and deploy
npm run deploy:hosting
```

---

## Repository & Workflow Guidelines

In accordance with our engineering SOP:

- **Branching**:
  - `main`: Stable production branch. Direct pushes are restricted; updates must go through merge/pull requests.
  - `develop`: Primary integration branch for daily development.
  - Feature branches: `feat/*`, `fix/*`, `style/*`, `chore/*`.
- **Commit Convention**: `<type>: [Initials] description`  
  *(Example: `feat: [ZA] add stock export feature`)*
- **Security**: Never commit secrets or private service accounts. All sensitive keys are strictly managed through environment variables and ignored via `.gitignore`.

---

## Documentation & Changelog

- Project documentation and requirements: [`docs/`](docs/)
- Release history and updates: [`CHANGELOG.md`](CHANGELOG.md)
- Version details: [`version.json`](version.json)


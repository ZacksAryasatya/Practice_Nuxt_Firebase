# Changelog

All notable changes to this project are documented here.
This format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [v0.2.0-beta.1] - 2026-10-09
### Added
- Formatted `.xlsx` spreadsheet export with metadata, coloring, and autofilters using `xlsx-js-style`.
- Firestore-backed global low stock alert threshold stored at `settings/inventory`.
- Interactive photo preview lightbox with full-resolution open capability.
- Custom styled deletion confirmation dialogs replacing default browser alerts.
- Firestore cursor pagination (`startAfter`) for historical stock movements.
- Firebase Cloud Messaging (FCM) Web Push Notification integration with service worker.
- Client-side auto-compressed Base64 product image storage directly inside Cloud Firestore.

### Changed
- Migrated product image storage from Supabase to 100% Firebase (Firestore `photoBase64`), removing `@supabase/supabase-js` dependency.
- Standardized terminology from "Saldo" to "Stok Sebelum / Stok Sesudah" across the UI and Excel reports.
- Modularized monolithic Vue pages into separate single-responsibility components and composables (< 300 lines).

---

## [v0.1.0-beta.1] - 2026-10-08
### Added
- Initial MVP requirements, user flows, wireframes, Firestore data model, security guidance, and testing plan.
- Repository baseline files and Firebase client environment example.
- Responsive inventory admin interface with products, categories, Supabase product photos, and Firestore stock movement history.

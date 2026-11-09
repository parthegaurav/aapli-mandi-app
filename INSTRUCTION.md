# Aapli Mandi (आपली मंडी) — Project Architecture & Developer Instructions

> **IMPORTANT**: Read this document before making any changes to this repository. This document serves as the persistent memory and architecture reference for the project.

---

## 1. ⚠️ CRITICAL RULE: NO SQLITE IN PRODUCTION / REMOTE REPOS

- **Do NOT commit or push SQLite databases or native SQLite dependencies to GitHub / Vercel.**
  - `better-sqlite3` is a native C++ compiled binary. If placed in `dependencies`, Vercel cloud deployment **fails** during `npm install`.
  - `better-sqlite3` must remain strictly under `optionalDependencies` or local only.
  - All database files (`*.db`, `*.db-shm`, `*.db-wal`, `aaplimandi.db`) are ignored in `.gitignore`. **Never force-push `.db` files.**
- **Production Architecture**:
  - The production app on Vercel is a **100% static React + Vite Single Page Application (SPA)**.
  - All database queries communicate directly with **Supabase PostgreSQL** via `@supabase/supabase-js`.
  - There is **no Express backend server** running on Vercel. All `/api/...` endpoints have been migrated to client-side Supabase calls.

---

## 2. Tech Stack Overview

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18, Vite 6 |
| **Styling** | Tailwind CSS 3, Lucide React icons |
| **Cloud Database** | Supabase (PostgreSQL via `@supabase/supabase-js`) |
| **Hosting** | Vercel (Static Frontend) |
| **Languages** | Marathi (Default, `mr`), English (`en`) |
| **PWA Support** | `manifest.json`, ServiceWorker (`sw.js`), Apple Touch Icon |
| **Offline Resilience** | Automatic `localStorage` backup caching in `src/services/supabase.js` |

---

## 3. Environment Variables

Store credentials in `.env` (git-ignored). Template is provided in `.env.example`:

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

> **Note**: Both keys must use the `VITE_` prefix so Vite bundles them into client-side code safely.

---

## 4. Supabase Database Schema

All database interactions flow through [`src/services/supabase.js`](file:///d:/apliMandi/src/services/supabase.js).

### A. `products` Table
- `id` (int/text, PK)
- `name_mr` (text) — Marathi crop name
- `name_en` (text) — English crop name
- `category` (text) — `vegetable`, `leafy`, `fruit`, `exotic`
- `farmer_rate_per_kg` (numeric) — Farmer guaranteed purchase rate (₹/kg)
- `wholesaler_rate_per_crate` (numeric) — Wholesaler selling rate per crate (₹/crate)
- `crate_weight_kg` (numeric, default 20)
- `available_crates` (int)
- `mandi_comparison_badge` (text)
- `is_active` (boolean)
- `updated_at` (timestamp)

### B. `farmer_bookings` Table
- `id` (int, PK)
- `receipt_no` (text) — e.g. `AM-2026-FARM-XXXX`
- `farmer_name` (text)
- `phone` (text)
- `village_taluka` (text)
- `product_id` (int, FK -> products.id)
- `crop_name_snapshot` (text)
- `crates_count` (int)
- `locked_rate_per_kg` (numeric)
- `estimated_payout` (numeric)
- `pickup_type` (text) — `farm_gate` or `collection_center`
- `status` (text) — `confirmed`, `in_transit`, `delivered`, `cancelled`
- `created_at` (timestamp)

### C. `wholesaler_orders` Table
- `id` (int, PK)
- `wholesaler_name` (text)
- `gala_shop_no` (text)
- `market_yard` (text) — e.g. `Gultekdi Market Yard, Pune`
- `phone` (text)
- `product_id` (int, FK -> products.id)
- `crop_name_snapshot` (text)
- `crates_ordered` (int)
- `total_order_amount` (numeric)
- `delivery_slot` (text) — `morning_4am_6am`, etc.
- `order_status` (text) — `pending`, `confirmed`, `dispatched`, `delivered`, `cancelled`
- `created_at` (timestamp)

---

## 5. Key File Structure & Architecture Map

```
apliMandi/
├── public/
│   ├── apple-touch-icon.png        # iOS homescreen icon (180x180)
│   ├── pwa-192x192.png             # Android homescreen icon (192x192)
│   ├── pwa-512x512.png             # Splash & store icon (512x512)
│   ├── maskable-icon-512x512.png   # Adaptive Android maskable icon
│   ├── manifest.json               # Web App Manifest
│   └── sw.js                       # Offline service worker
├── src/
│   ├── services/
│   │   └── supabase.js             # Central Supabase client + query functions + offline localStorage fallback
│   ├── context/
│   │   └── AuthContext.jsx         # Client-side user auth & demo profiles
│   ├── components/
│   │   ├── Header.jsx              # Brand header, language toggle & role tabs
│   │   ├── FarmerView.jsx          # Farmer guaranteed rates, lock rate & booking
│   │   ├── WholesalerView.jsx      # Wholesaler catalog, cart, custom order modal
│   │   ├── AdminView.jsx           # Admin pricing control, booking/order management
│   │   ├── LogisticsView.jsx       # Truck live highway tracking
│   │   ├── WhatsAppFloatingButton.jsx # WhatsApp support launcher
│   │   └── DigitalPavtiModal.jsx   # Farmer digital receipt & WhatsApp receipt share
│   ├── data/
│   │   └── i18n.js                 # Marathi & English translations
│   ├── App.jsx                     # Root application container & crop data state
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Tailwind styles
├── server/                         # LOCAL ONLY (Not used in production Vercel build)
│   ├── index.js                    # Local Express development server
│   └── db.js                       # Local SQLite helpers
├── INSTRUCTION.md                  # This file
├── package.json                    # Project metadata & scripts
└── vite.config.js                  # Vite configuration
```

---

## 6. Development & Deployment Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Runs the Vite frontend only at `http://localhost:3000` (Default & Production-ready) |
| `npm run build` | Compiles the production bundle into `dist/` |
| `npm run preview` | Locally previews the compiled production build |
| `npm run dev:all` | (Local only) Concurrently runs local Express backend + Vite frontend |
| `npm run server` | (Local only) Runs the local Express server on port 5000 |

---

## 7. Guidelines for Future Updates

1. **Direct Supabase Integration**: When adding new features or tables, add client functions directly to `src/services/supabase.js`. Never write `/api/...` endpoints that expect an Express backend in production.
2. **Offline Fallback**: Maintain the `localStorage` fallback pattern in `src/services/supabase.js` so that network glitches never crash the UI.
3. **Localization**: Maintain both Marathi (`mr`) and English (`en`) strings in `src/data/i18n.js`.
4. **Git Commits**: Never force-add `.env`, `.env.txt`, `node_modules`, or `*.db` files. Keep `.env.example` up to date if new environment variables are added.

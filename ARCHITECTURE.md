# Hen N Slice — Architecture

## 1. Turborepo Folder Structure

```
hen-n-slice/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── apps/
│   ├── web/                          # Next.js 14 (App Router)
│   │   ├── app/
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx          # Home (landing)
│   │   │   │   ├── branches/
│   │   │   │   ├── menu/
│   │   │   │   ├── deals/
│   │   │   │   └── item/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (customer)/
│   │   │   │   ├── cart/
│   │   │   │   ├── checkout/
│   │   │   │   ├── orders/
│   │   │   │   └── profile/
│   │   │   └── (admin)/
│   │   │       ├── page.tsx
│   │   │       ├── branches/
│   │   │       ├── deals/
│   │   │       └── orders/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── public/
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   └── mobile/                       # Expo (React Native)
│       ├── app/                      # Expo Router
│       │   ├── _layout.tsx
│       │   ├── index.tsx
│       │   ├── branches/
│       │   ├── menu/
│       │   ├── deals/
│       │   ├── item/
│       │   ├── cart/
│       │   ├── checkout/
│       │   ├── orders/
│       │   ├── auth/
│       │   ├── profile/
│       │   └── admin/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── package.json
├── packages/
│   ├── types/                        # @hen-n-slice/types
│   │   └── src/
│   │       ├── index.ts
│   │       ├── user.ts
│   │       ├── branch.ts
│   │       ├── menu.ts
│   │       ├── deal.ts
│   │       ├── order.ts
│   │       ├── delivery.ts
│   │       └── cart.ts
│   ├── api-client/                   # @hen-n-slice/api-client
│   │   └── src/
│   │       ├── index.ts
│   │       ├── client.ts
│   │       ├── branches.ts
│   │       ├── menu.ts
│   │       ├── deals.ts
│   │       ├── orders.ts
│   │       ├── delivery.ts
│   │       └── auth.ts
│   ├── ui-tokens/                    # @hen-n-slice/ui-tokens
│   │   └── src/
│   │       ├── index.ts
│   │       ├── colors.ts
│   │       ├── spacing.ts
│   │       ├── typography.ts
│   │       ├── borders.ts
│   │       └── shadows.ts
│   ├── business-logic/               # @hen-n-slice/business-logic
│   │   └── src/
│   │       ├── index.ts
│   │       ├── branch-matching.ts
│   │       ├── delivery-check.ts
│   │       ├── pricing.ts
│   │       └── order-validators.ts
│   └── config/                       # @hen-n-slice/config
│       └── src/
│           ├── index.ts
│           ├── constants.ts
│           └── env.ts
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.json
└── .gitignore
```

---

## 2. Supabase Schema

### Prerequisite — Enable PostGIS

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Run once before creating any tables with `geography` or `geometry` columns (`branches.location`, `delivery_zones.boundary`).

### `users`

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` | references `auth.users` |
| `phone` | `text` | | nullable; primary login method |
| `email` | `text` | | nullable |
| `full_name` | `text` | | |
| `avatar_url` | `text` | | |
| `default_branch_id` | `uuid` FK → `branches.id` | | user's preferred branch |
| `role` | `text` | `'customer'` | `'customer'`, `'branch_admin'`, or `'super_admin'` |
| `default_address` | `jsonb` | | `{street, area, city, lat, lng, label}` |
| `created_at` | `timestamptz` | `now()` | |

### `branches`

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` | |
| `name` | `text` NOT NULL | | e.g. "Hen N Slice — Al Nahda" |
| `slug` | `text` UNIQUE NOT NULL | | URL-friendly identifier |
| `address` | `text` | | |
| `location` | `geography(Point, 4326)` | | for ST_DWithin proximity queries |
| `phone` | `text` | | |
| `opening_hours` | `jsonb` | | `{mon: {open: "09:00", close: "23:00"}, ...}` |
| `is_active` | `boolean` | `true` | |
| `image_url` | `text` | | branch photo |
| `delivery_radius_km` | `numeric` | | max delivery distance |
| `min_order_delivery` | `numeric` | | minimum for delivery |
| `min_order_pickup` | `numeric` | `0` | |

### `delivery_zones`

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` | |
| `branch_id` | `uuid` FK → `branches.id` NOT NULL | | |
| `name` | `text` | | e.g. "Zone A — Rashidiya" |
| `boundary` | `geometry(Polygon, 4326)` | | geofence polygon |
| `fee` | `numeric` | `0` | delivery charge |
| `min_order` | `numeric` | `0` | overrides branch min if higher |

### `categories`

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` | |
| `branch_id` | `uuid` FK → `branches.id` | nullable | null = shared across all branches |
| `name` | `text` NOT NULL | | "Crispy Chicken", "Sides", "Beverages" |
| `name_ar` | `text` | nullable | Arabic translation — cheap to add now, expensive later |
| `slug` | `text` NOT NULL | | URL-friendly |
| `icon_url` | `text` | | category icon |
| `sort_order` | `int2` | `0` | |
| `is_active` | `boolean` | `true` | |

### `menu_items`

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` | |
| `category_id` | `uuid` FK → `categories.id` NOT NULL | | |
| `branch_id` | `uuid` FK → `branches.id` | nullable | branch-specific pricing override |
| `name` | `text` NOT NULL | | |
| `name_ar` | `text` | nullable | Arabic translation |
| `description` | `text` | | |
| `description_ar` | `text` | nullable | Arabic translation |
| `price` | `numeric` NOT NULL | | |
| `discount_price` | `numeric` | nullable | sale price if active |
| `image_url` | `text` | | |
| `is_available` | `boolean` | `true` | toggle sold-out |
| `is_featured` | `boolean` | `false` | homepage featured grid |
| `is_popular` | `boolean` | `false` | popular badge |
| `sort_order` | `int2` | `0` | |
| `modifier_groups` | `jsonb` | `[]` | `[{name: "Dip", options: [...], max: 1}]` |

Index: `(branch_id, category_id, sort_order)`

### `deals`

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` | |
| `branch_id` | `uuid` FK → `branches.id` | nullable | null = all branches |
| `title` | `text` NOT NULL | | e.g. "Buy 9pc Bucket, Get 2 Free" |
| `title_ar` | `text` | nullable | Arabic translation |
| `description` | `text` | | |
| `description_ar` | `text` | nullable | Arabic translation |
| `image_url` | `text` | | carousel slide background |
| `discount_percent` | `int2` | | |
| `discount_price` | `numeric` | nullable | fixed price if set |
| `applicable_item_ids` | `uuid[]` | | items this deal applies to |
| `valid_from` | `timestamptz` NOT NULL | | |
| `valid_until` | `timestamptz` NOT NULL | | |
| `is_active` | `boolean` | `true` | |
| `sort_order` | `int2` | `0` | carousel order |

### `orders`

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` | |
| `user_id` | `uuid` FK → `users.id` NOT NULL | | |
| `branch_id` | `uuid` FK → `branches.id` NOT NULL | | |
| `type` | `text` NOT NULL | | `'delivery'` or `'pickup'` |
| `status` | `text` | `'pending'` | `pending → confirmed → preparing → ready/completed → cancelled` |
| `items` | `jsonb` NOT NULL | | `[{menu_item_id, name, qty, unit_price, modifiers, subtotal}]` |
| `subtotal` | `numeric` | | |
| `delivery_fee` | `numeric` | `0` | |
| `discount` | `numeric` | `0` | |
| `total` | `numeric` | | |
| `delivery_address` | `jsonb` | nullable | for delivery orders |
| `notes` | `text` | | |
| `payment_method` | `text` | `'cash'` | `'cash'`, `'card'`, `'wallet'` (placeholder — no gateway yet) |
| `payment_status` | `text` | `'pending'` | |
| `created_at` | `timestamptz` | `now()` | |
| `estimated_ready_at` | `timestamptz` | | |

Index: `(user_id, created_at DESC)`, `(branch_id, status)`

---

## 2b. Supabase Storage Buckets

| Bucket | Visibility | Purpose |
|---|---|---|
| `menu-images` | public read | Menu item photos |
| `branch-images` | public read | Branch exterior/interior photos |
| `deal-images` | public read | Deal carousel slide images |

All three buckets use a **public-read** policy (anyone can view), **authenticated-write** policy (only logged-in users can upload). Folder convention: `{bucket}/{branch_id}/{uuid}-{filename}`.

---

## 3. Shared Packages

### `packages/types` — `@hen-n-slice/types`

**Interfaces:**
- `User` — id, phone, email, full_name, avatar_url, default_branch_id, default_address, created_at
- `Branch` — id, name, slug, address, location (lat/lng), phone, opening_hours, is_active, image_url, delivery_radius_km, min_order_delivery, min_order_pickup
- `BranchWithDistance` — Branch + `distance_km: number`
- `DeliveryZone` — id, branch_id, name, fee, min_order
- `Category` — id, branch_id?, name, name_ar?, slug, icon_url, sort_order, is_active
- `MenuItem` — id, category_id, branch_id?, name, name_ar?, description, description_ar?, price, discount_price?, image_url, is_available, is_featured, is_popular, sort_order, modifier_groups
- `ModifierGroup` — name, options: ModifierOption[], max: number
- `ModifierOption` — name, price_adjustment
- `Deal` — id, branch_id?, title, title_ar?, description, description_ar?, image_url, discount_percent, discount_price?, applicable_item_ids, valid_from, valid_until, is_active, sort_order
- `Order` — id, user_id, branch_id, type, status, items, subtotal, delivery_fee, discount, total, delivery_address?, notes, payment_method, payment_status, created_at, estimated_ready_at
- `OrderItem` — menu_item_id, name, qty, unit_price, modifiers, subtotal
- `UserRole` = `'customer' | 'branch_admin' | 'super_admin'`
- `Address` — street, area, city, lat, lng, label

**Cart:** No cart table or interface in types. Cart is purely client-side Zustand state (store lives in each app's feature layer or in a lightweight `packages/cart-store`). It becomes an `orders` row only at checkout submission.

**Type Unions:**
- `OrderType` = `'delivery' | 'pickup'`
- `OrderStatus` = `'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'`
- `PaymentMethod` = `'cash' | 'card' | 'wallet'`
- `PaymentStatus` = `'pending' | 'paid' | 'failed' | 'refunded'`

**Dependencies:** none (pure TypeScript)

---

### `packages/api-client` — `@hen-n-slice/api-client`

**Exports:**
- `createClient()` — returns typed Supabase client (anon key + URL from env)
- `branches` module:
  - `getActiveBranches()` → `Branch[]`
  - `getBranchBySlug(slug)` → `Branch | null`
  - `findNearestBranches(lat, lng, radius?)` → `BranchWithDistance[]`
- `menu` module:
  - `getCategories(branchId)` → `Category[]`
  - `getMenuItems(branchId, categoryId?)` → `MenuItem[]`
  - `getFeaturedItems(branchId)` → `MenuItem[]`
  - `getPopularItems(branchId)` → `MenuItem[]`
- `deals` module:
  - `getActiveDeals(branchId?)` → `Deal[]`
- `realtime` module:
  - `subscribeToOrderStatus(orderId, callback)` → `UnsubscribeFn` — opens a Supabase Realtime channel on `orders` row, calls `callback(status)` on every `status` change. Returns `unsubscribe()` for cleanup.
- `orders` module:
  - `createOrder(data)` → `Order`
  - `getOrder(id)` → `Order`
  - `getUserOrders(userId)` → `Order[]`
  - `cancelOrder(id)` → `void`
- `delivery` module:
  - `checkDeliveryAvailability(branchId, lat, lng)` → `{available: boolean, zone?: DeliveryZone, fee?: number}`
- `auth` module:
  - `signInWithPhone(phone)` → sends OTP
  - `verifyOtp(phone, token)` → session
  - `signOut()` → void

**Dependencies:** `@supabase/supabase-js`, `@hen-n-slice/types`, `@hen-n-slice/config`

---

### `packages/ui-tokens` — `@hen-n-slice/ui-tokens`

**Exports:**

```typescript
// colors.ts
export const colors = {
  brand: {
    purple: '#4C1590',           // Primary — header, hero, why-choose bg
    purpleDeep: '#250764',       // Hero background variant
    gold: '#FEC11F',             // Headline accent, buttons
    orange: '#EE861B',           // Deal card
    promoYellow: '#FEDA83',      // Promo banner
  },
  surface: {
    background: '#FEFEFE',       // White/off-white bg
    card: '#FFFFFF',
  },
  text: {
    onBrand: '#FFFFFF',          // Text on purple backgrounds
    onLight: '#1A1A2E',          // Dark navy/near-black on light bg
    secondary: '#6B7280',
    muted: '#9CA3AF',
  },
  border: {
    default: '#E5E0EB',
    light: '#F0ECF5',
  },
  status: {
    success: '#22C55E',
    warning: '#EAB308',
    error: '#EF4444',
  },
} as const;

// spacing.ts — 4px base scale
export const spacing = {
  0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20,
  6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80,
} as const;

// typography.ts
export const typography = {
  fontFamily: {
    heading: "'Poppins', 'Inter', sans-serif",
    body: "'Inter', system-ui, sans-serif",
  },
  fontSize: {
    xs: 12, sm: 14, base: 16, lg: 18,
    xl: 20, '2xl': 24, '3xl': 30, '4xl': 36,
  },
  fontWeight: {
    regular: 400, medium: 500, semibold: 600,
    bold: 700, extrabold: 800,
  },
  lineHeight: {
    tight: 1.2, normal: 1.5, relaxed: 1.75,
  },
} as const;

// borders.ts
export const borderRadius = {
  none: 0, sm: 6, md: 12, lg: 16, full: 9999,
} as const;

export const borderWidth = {
  none: 0, thin: 1, normal: 2,
} as const;

// shadows.ts
export const shadows = {
  sm: '0 1px 3px rgba(76,21,144,0.08)',
  md: '0 4px 12px rgba(76,21,144,0.12)',
  lg: '0 8px 24px rgba(76,21,144,0.15)',
} as const;
```

**Dependencies:** none (pure constants, platform-agnostic)

---

### `packages/business-logic` — `@hen-n-slice/business-logic`

**Exports:**
- **branch-matching.ts**
  - `findNearestBranch(userLat, userLng, branches[])` → `BranchWithDistance | null` (Haversine, filters to within delivery radius)
- **delivery-check.ts**
  - `getDeliveryZone(branchId, lat, lng, zones[])` → `DeliveryZone | null` (point-in-polygon via ray-casting)
  - `calculateDeliveryFee(zone, subtotal)` → `number` (free if subtotal ≥ min_order, else zone.fee)
- **pricing.ts**
  - `calculateSubtotal(items[])` → `number`
  - `applyDealDiscount(subtotal, deal)` → `{discountedTotal, saved}`
  - `calculateTotal(subtotal, deliveryFee, discount)` → `number`
- **order-validators.ts**
  - `validateOrder({items, type, branchId, address?}, branch, zones?)` → `{valid, errors: string[]}` (checks min order, availability, branch hours, delivery zone)
  - `canDeliverTo(branch, lat, lng, zones)` → `boolean`

**Dependencies:** `@hen-n-slice/types`

---

### `packages/config` — `@hen-n-slice/config`

**Exports:**
- `const APP_NAME = 'Hen N Slice'`
- `const SUPPORTED_CURRENCY = 'PKR'`
- `const DEFAULT_LOCALE = 'en'`
- `const MIN_ORDER_SEARCH_RADIUS_KM = 15`
- `env` — typed accessor for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.

**Dependencies:** none

---

## 4. Design Tokens

### Brand Colors

| Token | Value | Usage |
|---|---|---|
| `brand.purple` | `#4C1590` | Header, hero section, "Why Choose Us" bg, nav, primary buttons |
| `brand.purpleDeep` | `#250764` | Hero background variant, gradient partner |
| `brand.gold` | `#FEC11F` | Headline accents, CTA buttons, rating stars, highlights |
| `brand.orange` | `#EE861B` | Deal cards, sale tags, promotional badges |
| `brand.promoYellow` | `#FEDA83` | Promo banners, deal card accents |
| `surface.background` | `#FEFEFE` | Main page backgrounds |
| `surface.card` | `#FFFFFF` | Cards, modals, containers |
| `text.onLight` | `#1A1A2E` | Body text, headings on light backgrounds |
| `text.onBrand` | `#FFFFFF` | Text on purple/orange backgrounds |

### Typography

| Element | Family | Size | Weight |
|---|---|---|---|
| **H1 (hero headline)** | Poppins | 36px | 800 (Extrabold) |
| **H2 (section title)** | Poppins | 30px | 700 (Bold) |
| **H3 (card title)** | Poppins | 20px | 600 (Semibold) |
| **Body** | Inter | 16px | 400 (Regular) |
| **Body small** | Inter | 14px | 400 |
| **Caption / price** | Inter | 12px | 500 (Medium) |
| **Button label** | Inter | 16px | 600 (Semibold) |
| **Deal badge** | Inter | 14px | 700 (Bold) |

### Spacing & Layout

| Token | Value |
|---|---|
| Base unit | 4px |
| Section padding Y | 48px (desktop), 32px (mobile) |
| Container max-width | 1200px |
| Grid gap | 16px |
| Columns | 2 (mobile), 3 (tablet), 4 (desktop) |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `sm` | 6px | Inputs, small tags |
| `md` | 12px | Cards, deal carousel, buttons |
| `lg` | 16px | Modals, bottom sheets |
| `full` | 9999px | Avatars, pill buttons, category icons |

### Shadows

| Token | Value |
|---|---|
| `sm` | `0 1px 3px rgba(76,21,144,0.08)` |
| `md` | `0 4px 12px rgba(76,21,144,0.12)` |
| `lg` | `0 8px 24px rgba(76,21,144,0.15)` |

### Button Styles

| Variant | Background | Text | Radius | Padding | Hover |
|---|---|---|---|---|---|
| **Primary (CTA)** | `#EE861B` | `#FFFFFF` | 12px | 12px 24px | `darken 10%` |
| **Secondary** | `#4C1590` | `#FFFFFF` | 12px | 12px 24px | `#3A0E70` |
| **Gold (accent)** | `#FEC11F` | `#1A1A2E` | 12px | 12px 24px | `#E5A91C` |
| **Outline** | transparent | `#4C1590` | 12px | 11px 23px | `bg #4C1590 8%` |
| **Ghost** | transparent | `#4C1590` | 12px | 12px 24px | `bg #4C1590 8%` |
| **Pill/icon** | `#FFFFFF` | `#4C1590` | 9999px | 12px | `bg #E5E0EB` |

---

## 5. Screen & Route List

### Web (Next.js App Router)

```
/                                             → Home
  ├── [first visit] BranchSelectorModal — captures location + delivery/pickup choice
  ├── Deals carousel (hero)
  ├── Order type toggle (Delivery / Pickup)
  ├── Category icons row
  └── Featured items grid

/branches                                     → Branch selector (list + map)
/branches/[slug]                              → Branch detail

/menu                                         → Full menu (category tabs + items)
/menu/[categorySlug]                          → Filtered to category

/deals                                        → All deals
/deals/[dealId]                               → Deal detail

/item/[itemId]                                → Item detail + modifiers

/cart                                         → Cart

/checkout                                     → Checkout flow
  ├── Delivery vs Pickup
  ├── Address form (delivery)
  ├── Pickup time (pickup)
  └── Payment confirmation

/orders                                       → Order history
/orders/[orderId]                             → Order tracking

/auth/login                                   → Phone OTP login
/auth/register                                → Register

/profile                                      → Profile
/profile/addresses                            → Saved addresses

/admin                                        → Dashboard
/admin/branches/[id]/menu                     → Menu editor
/admin/deals                                  → Deals manager
/admin/orders                                 → Live queue
```

### Mobile (Expo Router)

```
app/
├── _layout.tsx                         → Root (tabs: Home, Menu, Deals, Cart, Profile)
├── index.tsx                           → Home (carousel, categories, featured)
│   [first visit] → BranchSelectorModal before any content
├── branches/
│   ├── index.tsx                       → Branch list
│   └── [slug].tsx                      → Branch detail
├── menu/
│   ├── index.tsx                       → Menu with category tabs
│   └── [categorySlug].tsx              → Filtered
├── deals/
│   └── index.tsx                       → Deals list
├── item/
│   └── [itemId].tsx                    → Item + modifiers bottom sheet
├── cart/
│   └── index.tsx                       → Cart
├── checkout/
│   ├── index.tsx                       → Delivery vs Pickup
│   ├── address.tsx                     → Address form
│   ├── pickup.tsx                      → Time selection
│   └── payment.tsx                     → Confirm & pay
├── orders/
│   ├── index.tsx                       → Order history
│   └── [orderId].tsx                   → Live tracking
├── auth/
│   ├── login.tsx                       → Phone OTP
│   └── register.tsx                    → Register
├── profile/
│   ├── index.tsx                       → Profile
│   └── addresses.tsx                   → Saved addresses
└── admin/
    ├── _layout.tsx                     → Admin layout
    ├── index.tsx                       → Dashboard
    ├── menu.tsx                        → Menu editor
    ├── deals.tsx                       → Deals manager
    └── orders.tsx                      → Order queue
```

---

## 6. Key Conventions

- **Branch-first architecture** — every menu query, deal, and order is scoped to a branch. The app always resolves the user's branch (via nearest location or manual selection) before showing menu.
- **BranchSelectorModal** — triggers on first app open (web + mobile) before any menu content. Captures user location (or manual entry), selects nearest branch, and toggles delivery vs pickup. Choice stored in local state / persisted preference. Only re-shown if user wants to switch branch.
- **Pickup is the default** — if location permission is denied, default to pickup with branch selection.
- **Cart is client-side only** — no `carts` table. Zustand store holds `{ items: CartItem[], branchId, type }`. Flushed to `orders` table at checkout. Survives page refreshes via localStorage/AsyncStorage persistence middleware.
- **Row Level Security (RLS)** — Supabase policies enforce: users read their own data, branches read public data, admin roles manage CRUD.
- **Arabic columns** — `name_ar`, `description_ar` exist as nullable `text` on categories, menu_items, and deals. Add i18n switching later without migration.
- **Payment placeholder** — `cash | card | wallet` enum on orders. Actual gateway (Stripe, etc.) deferred.
- **Live order tracking** — `subscribeToOrderStatus()` via Supabase Realtime. Frontend subscribes on order detail/monitoring screens, updates status badge and estimated-ready timer in real time without polling.

# Event Tracking & Braze SDK — Deep Walkthrough

This guide follows the [README](../README.md) and explains **how events are tracked on the site** and **how the Braze SDK is wired** (how `js/events.js` ties to `js/products.js`, `js/cart.js`, `js/auth.js`, `js/user-profile.js`, and `js/app.js`).

---

## 1. Setup: What loads and in what order

### 1.1 Script load order (every page)

Each HTML page loads scripts in this order:

**In `<head>` (before body):**
1. **`js/braze-config.js`** — Sets `window.BRAZE_CONFIG` (e.g. `apiKey`, `baseUrl`, `enableLogging`). No API key = “console-only” mode.
2. **Braze CDN** — `https://js.appboycdn.com/web-sdk/4.10/braze.min.js` — Defines the global `braze` object. No initialization happens yet.

**At end of `<body>`:**
3. **`js/utils.js`** — Helpers (`getElement`, `Storage`, `formatCurrency`, etc.).
4. **`js/events.js`** — The **event tracking abstraction layer** and the only place that talks to Braze. Defines the global `EventTracker` object.
5. **`js/products.js`** — Product catalog, filters, product detail, add-to-cart UI. Calls `EventTracker` when user views products, applies filters, or adds to cart.
6. **`js/cart.js`** — Cart UI and checkout. Calls `EventTracker` when user views cart, starts checkout, or completes a purchase.
7. **`js/auth.js`** — Login, register, logout. Calls `EventTracker` for identify, login, registration, logout.
8. **`js/app.js`** — App bootstrap. Calls `EventTracker.trackPageView(...)` once per page load.

On **profile.html** the list is the same except `js/user-profile.js` is loaded (and it also calls `EventTracker`).

So: **every feature module (products, cart, auth, user-profile, app) only touches tracking through `EventTracker`**. Nothing else uses `braze` directly.

---

## 2. How the event layer works (`js/events.js`)

### 2.1 The `brazeReady()` gate

```javascript
function brazeReady() {
  return typeof braze !== 'undefined' && window.BRAZE_CONFIG && window.BRAZE_CONFIG.apiKey;
}
```

- **When `brazeReady()` is true:** Braze SDK is loaded and an API key is set → events are sent to Braze and (when enabled) logged by the SDK.
- **When `brazeReady()` is false:** Every tracking call still runs the **console.log** part, but no `braze.*` calls are made. So the site works in “manual learning” mode with no key.

So: **events are always “tracked” in the sense of being logged; they are only sent to Braze when the SDK is ready and configured.**

### 2.2 Initialization and session (on every page load)

When the DOM is ready, `events.js` runs:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  EventTracker.init();
  EventTracker.startSession();
});
```

- **`EventTracker.init()`**  
  - Logs `[EventTracker] Initialized`.  
  - If `brazeReady()`: calls `braze.initialize(apiKey, { baseUrl, enableLogging })` and `braze.automaticallyShowInAppMessages()`.  
  - If not: logs that Braze is disabled and to set `BRAZE_CONFIG.apiKey`.

- **`EventTracker.startSession()`**  
  - Logs `[EventTracker] Session started`.  
  - If `brazeReady()`: calls `braze.openSession()`.

So **session start** is tied to the event layer and only hits Braze when the SDK is configured.

### 2.3 Pattern of every tracking method

Each method in `EventTracker`:

1. **Always** does a `console.log` with a clear label (e.g. `[EventTracker] Product viewed:`, `[EventTracker] User identified:`).
2. **Optionally** calls Braze: `if (brazeReady()) { braze.... }`.

So you can always see what “would” be tracked in the console; Braze is an optional backend.

---

## 3. Where each event is triggered (events ↔ modules)

Below is a **per-event** map: which file and which user action triggers which `EventTracker` call, and what `events.js` does with it (and what Braze sees when enabled).

### 3.1 Session & page view

| Event | Where it’s called | What happens in `events.js` | Braze (when enabled) |
|-------|-------------------|-----------------------------|------------------------|
| **Session started** | `events.js` on `DOMContentLoaded` | `startSession()` → `braze.openSession()` | New session in Braze |
| **Page viewed** | `app.js` on `DOMContentLoaded`: `EventTracker.trackPageView(getCurrentPageName())` | Logs page name; sends custom event `page.viewed` with `page_name`, `timestamp` | Custom event for each page load |
| **Page viewed (profile)** | `user-profile.js` on profile page load: `EventTracker.trackPageView('profile')` | Same as above (extra profile-specific page view if you want it) | Same |

So: **every page** gets one session start (from `events.js`) and one generic page view (from `app.js`); the profile page can send an additional `page.viewed` for `'profile'`.

### 3.2 Product & catalog (tie to `js/products.js`)

| Event | Where it’s called | What happens in `events.js` | Braze (when enabled) |
|-------|-------------------|-----------------------------|------------------------|
| **Product viewed** | **products.js** in three places: (1) Homepage featured cards click → `EventTracker.trackProductView(getProductById(...))` then navigate to `product-detail.html?id=...`. (2) Products grid cards click → same. (3) **product-detail.html** when the detail is rendered → `displayProductDetail()` calls `EventTracker.trackProductView(product)` then builds the page. | `trackProductView(product)` builds an object with `product_id`, `product_name`, `variant_id`, `price`, `currency`, `brand`, `category`, `image_url`, `source: 'product_detail_page'`, logs it, and sends `ecommerce.product_viewed`. | Custom event with product payload |
| **Filter applied** | **products.js** in `setupFilters()`: when a filter button is clicked, `EventTracker.trackFilterApplied('category', category)` then `displayProducts(category)`. | Logs filter type and value; sends `filter.applied` with `filter_type`, `filter_value`. | Custom event for filtering |
| **Added to cart** | **products.js** in `displayProductDetail()`: the “Add to Cart” button handler calls `CartManager.addItem(product, quantity)` then `EventTracker.trackAddToCart(product, quantity)`. | Logs product + quantity; sends `ecommerce.cart_updated` with product_id, product_name, quantity, price, currency, brand. | Custom event for add-to-cart |

So **products.js** is the only place that triggers product view, filter applied, and add-to-cart; **events.js** standardizes the payload and sends to Braze when ready.

### 3.3 Cart & checkout (tie to `js/cart.js`)

| Event | Where it’s called | What happens in `events.js` | Braze (when enabled) |
|-------|-------------------|-----------------------------|------------------------|
| **Cart viewed** | **cart.js** in `displayCartItems()`: after rendering the cart list and summary, it calls `EventTracker.trackCartView()`. So every time the cart page shows (or cart content is re-rendered) this fires. | Logs; sends `ecommerce.cart_viewed` with `{}`. | Custom event |
| **Checkout started** | **cart.js** in `setupCheckout()`: when the user clicks “Proceed to Checkout”, after ensuring they’re logged in, it calls `EventTracker.trackCheckoutStarted(CartManager.getTotal())`. | Logs cart value; sends `ecommerce.checkout_started` with `cart_value`, `currency: 'CAD'`. | Custom event |
| **Purchase completed** | **cart.js** in the same checkout click handler: after creating the `order` object it calls `EventTracker.trackPurchase(order)`, `EventTracker.addToLifetimeValue(order.total)`, `EventTracker.incrementPurchaseCount()`. | `trackPurchase`: sends `ecommerce.order_placed` and `braze.logPurchase(...)`. `addToLifetimeValue` / `incrementPurchaseCount`: increment Braze custom user attributes. | Custom event + revenue event + user attributes updated |

So **cart.js** owns cart view, checkout start, and purchase; **events.js** turns those into Braze events and attribute increments.

### 3.4 Auth (tie to `js/auth.js`)

| Event | Where it’s called | What happens in `events.js` | Braze (when enabled) |
|-------|-------------------|-----------------------------|------------------------|
| **User identified** | **auth.js** in `AuthManager.login()`: after saving session and ensuring profile exists, it calls `EventTracker.identifyUser(user.id, { email, firstName, lastName })`. | Logs; calls `braze.changeUser(userId)` and sets email, first name, last name on `braze.getUser()`. | Braze “current user” is set; profile fields updated |
| **User logged in** | **auth.js** in the same `login()`: right after `identifyUser`, `EventTracker.trackUserLogin(user.id)`. | Logs; sends custom event `user.logged_in` with `user_id`. | Custom event |
| **User registered** | **auth.js** in the signup form submit handler: after `AuthManager.register()` and success, it calls `EventTracker.trackUserRegistration({ email: result.user.email, firstName: result.user.firstName })`. | Logs; sends `user.registered` with email, firstName. | Custom event |
| **User logged out** | **auth.js** in `AuthManager.logout()`: after clearing session it calls `EventTracker.logCustomEvent('user.logged_out', {})`. | Logs; sends custom event `user.logged_out`. | Custom event |

So **auth.js** drives identity and auth lifecycle; **events.js** maps that to Braze’s user identity and custom events.

### 3.5 Profile & preferences (tie to `js/user-profile.js`)

| Event | Where it’s called | What happens in `events.js` | Braze (when enabled) |
|-------|-------------------|-----------------------------|------------------------|
| **User attributes (preferences)** | **user-profile.js** in `UserProfile.updatePreferences()`: after saving preferences to the profile it calls `EventTracker.setUserAttributes(preferences)` (play_style, favorite_brand, skill_level). | Each key/value is set on Braze user via `setCustomUserAttribute`. | Custom attributes updated |
| **Rackets owned** | **user-profile.js** in `UserProfile.addRacket()` and `UserProfile.removeRacket()`: after updating the profile’s `rackets_owned` array it calls `EventTracker.setRacketsOwned(profile.rackets_owned)`. | Logs; sets custom user attribute `rackets_owned` (array of objects). | Nested/complex attribute in Braze |
| **Preferences updated (event)** | **user-profile.js** in `savePreferences()`: after `UserProfile.updatePreferences()` it calls `EventTracker.trackPreferenceUpdate(preferences)` and `EventTracker.trackProfileUpdate(user)`. | Logs; sends `user.preferences_updated` and `user.profile_updated` with name fields. | Two custom events |
| **Page viewed (profile)** | **user-profile.js** on profile DOMContentLoaded: when profile content is shown it calls `EventTracker.trackPageView('profile')`. | Same as other page views. | Custom event |

So **user-profile.js** owns profile data and UI; **events.js** syncs that to Braze as custom attributes and events.

---

## 4. End-to-end flow examples

### 4.1 User opens product, adds to cart, checks out

1. **products.html** loads → `utils` → `events` (init + startSession) → `products` → `cart` → `auth` → **app** (trackPageView).
2. User clicks a product card → **products.js** card click handler → `EventTracker.trackProductView(product)` → **events.js** logs and, if Braze ready, sends `ecommerce.product_viewed` → then navigates to `product-detail.html?id=...`.
3. **product-detail.html** loads → same script order; **products.js** `displayProductDetail()` runs → `EventTracker.trackProductView(product)` again (detail page view) → then “Add to Cart” is wired.
4. User clicks “Add to Cart” → **products.js** add-button handler → `CartManager.addItem(product, quantity)` then `EventTracker.trackAddToCart(product, quantity)` → **events.js** logs and sends `ecommerce.cart_updated`.
5. User goes to **cart.html** → **cart.js** `displayCartItems()` runs → `EventTracker.trackCartView()`.
6. User clicks “Proceed to Checkout” → **cart.js** `setupCheckout()` handler → (if logged in) `EventTracker.trackCheckoutStarted(CartManager.getTotal())`, then build order, then `EventTracker.trackPurchase(order)`, `addToLifetimeValue`, `incrementPurchaseCount` → **events.js** sends checkout + order + revenue + attribute increments.

So: **products.js** and **cart.js** drive the e‑commerce actions; **events.js** is the single place that formats and sends them to Braze.

### 4.2 User logs in and updates profile

1. User submits login → **auth.js** `AuthManager.login()` → stores session → `EventTracker.identifyUser(user.id, { email, firstName, lastName })` then `EventTracker.trackUserLogin(user.id)` → **events.js** sets Braze user and sends `user.logged_in`.
2. User opens **profile.html** → **user-profile.js** loads profile, calls `EventTracker.trackPageView('profile')`, and shows preferences/rackets.
3. User changes play style / brand / skill and clicks Save → **user-profile.js** `savePreferences()` → `UserProfile.updatePreferences()` (which calls `EventTracker.setUserAttributes(preferences)`) → then `EventTracker.trackPreferenceUpdate(preferences)` and `EventTracker.trackProfileUpdate(user)` → **events.js** updates Braze custom attributes and sends the two events.
4. User adds a racket → **user-profile.js** `UserProfile.addRacket()` → saves profile → `EventTracker.setRacketsOwned(profile.rackets_owned)` → **events.js** sets the `rackets_owned` custom attribute in Braze.

So: **auth.js** and **user-profile.js** drive identity and profile; **events.js** is the only module that talks to Braze.

---

## 5. Summary diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HTML pages (index, products, product-detail, cart, login, profile)     │
│  <head>: braze-config.js → Braze CDN                                     │
│  <body>: utils.js → events.js → products.js → cart.js → auth.js → app.js │
│          (profile has user-profile.js)                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │ products.js  │  │   cart.js    │  │   auth.js     │
            │ - product    │  │ - cart view  │  │ - identify   │
            │   view       │  │ - checkout   │  │ - login       │
            │ - filter     │  │ - purchase   │  │ - register   │
            │ - add to cart│  │              │  │ - logout      │
            └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                   │                 │                 │
                   │    ┌────────────┴────────────┐   │
                   │    │   user-profile.js       │   │
                   │    │   - preferences         │   │
                   │    │   - rackets_owned       │   │
                   │    │   - profile/pref events  │   │
                   │    └────────────┬────────────┘   │
                   │                 │                │
                   └─────────────────┼────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   events.js     │
                            │   EventTracker  │
                            │   - init()      │
                            │   - startSession│
                            │   - track*()    │
                            │   - set*()      │
                            │   brazeReady()  │
                            └────────┬────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
            ┌───────────────┐                 ┌───────────────┐
            │ console.log   │                 │ braze.* (if   │
            │ (always)      │                 │ brazeReady()) │
            └───────────────┘                 └───────────────┘
```

---

## 6. Quick reference: file → events

| File | EventTracker calls |
|------|--------------------|
| **events.js** | `init()`, `startSession()` on load; all other methods are definitions. |
| **app.js** | `trackPageView(getCurrentPageName())` once per page. |
| **products.js** | `trackProductView` (featured click, grid click, detail render), `trackFilterApplied` (filter click), `trackAddToCart` (Add to Cart button). |
| **cart.js** | `trackCartView()` in `displayCartItems()`, `trackCheckoutStarted`, `trackPurchase`, `addToLifetimeValue`, `incrementPurchaseCount` in checkout handler. |
| **auth.js** | `identifyUser`, `trackUserLogin` in `login()`, `trackUserRegistration` in signup success handler, `logCustomEvent('user.logged_out')` in `logout()`. |
| **user-profile.js** | `setUserAttributes` in `updatePreferences()`, `setRacketsOwned` in `addRacket`/`removeRacket`, `trackPreferenceUpdate`, `trackProfileUpdate` in `savePreferences()`, `trackPageView('profile')` on profile load. |

---

## 7. Enabling Braze (from README)

1. **Config:** Edit `js/braze-config.js` and set `apiKey` (and `baseUrl` if needed). Leave `apiKey` empty for console-only.
2. **No code changes** in products, cart, auth, or user-profile — they already call `EventTracker`; **events.js** decides whether to call Braze via `brazeReady()`.
3. **Test:** Use the site, watch console for `[EventTracker]` logs; in Braze dashboard, User Search → your user → verify events and attributes.

This matches the [README](../README.md) “Integrating Braze SDK” and “Event Tracking System” sections and explains exactly how **events.js** ties to **products.js**, **cart.js**, **auth.js**, **user-profile.js**, and **app.js** for a full learning path.

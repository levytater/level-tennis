# Level Tennis - E-Commerce Platform for Braze SDK Learning

A simple, vanilla JavaScript tennis e-commerce website built specifically as a learning environment for the **Braze SDK**. This site implements event tracking, user profiles, and cart management—everything you need to master Braze integration.

## 🎾 About

**Level Tennis** is a mock tennis equipment retailer offering:
- 10 premium tennis rackets
- 6 tennis bags
- 6 string packages
- 6 grip overgrips

## 🎯 Primary Purpose

This is **not** a production e-commerce site. It's a testbed for learning and implementing the Braze SDK. The site is structured to be "SDK-ready" with proper event tracking, user identification, and data architecture.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Data Storage**: `localStorage` (user sessions, cart, profiles)
- **Product Data**: JSON file (`data/products.json`)
- **Authentication**: Mock localStorage-based auth

### Key Features
✅ Product catalog with filtering
✅ Shopping cart with localStorage persistence
✅ User authentication (demo accounts)
✅ User profiles with custom attributes
✅ Event tracking abstraction layer (SDK-ready)
✅ Responsive mobile design
✅ Complex data structures (rackets owned as nested objects)

## 📁 Project Structure

```
level-tennis-web/
├── index.html                    # Homepage
├── products.html                 # Product catalog
├── product-detail.html           # Single product page
├── cart.html                     # Shopping cart
├── login.html                    # Auth page
├── profile.html                  # User profile
├── css/
│   ├── styles.css               # Global styles
│   ├── components.css           # Component styles
│   └── responsive.css           # Mobile responsive
├── js/
│   ├── app.js                   # Main initialization
│   ├── utils.js                 # Helper functions
│   ├── events.js                # Event tracking (SDK-ready)
│   ├── products.js              # Product logic
│   ├── cart.js                  # Cart management
│   ├── auth.js                  # Authentication
│   └── user-profile.js          # User profiles
├── data/
│   └── products.json            # Product catalog
└── assets/
    └── images/
        └── logo.svg             # Level Tennis logo
```

## 🚀 Getting Started

### 1. Start Local Development Server

**Option A: Using VS Code Live Server**
- Install the "Live Server" extension
- Right-click `index.html` → "Open with Live Server"
- Opens at `http://127.0.0.1:5500`

**Option B: Using Python**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open `http://localhost:8000`

**Option C: Using Node.js http-server**
```bash
npm install -g http-server
http-server
```

### 2. Test Demo Accounts

**Account 1:**
- Email: `john@example.com`
- Password: `password123`

**Account 2:**
- Email: `jane@example.com`
- Password: `password123`

Or create your own account!

### 3. Explore the Site

1. **Homepage** (`/index.html`) - View featured products
2. **Shop** (`/products.html`) - Browse and filter by category
3. **Product Details** - Click any product to see specs
4. **Cart** - Add items and manage quantities
5. **Login** - Sign in or register
6. **Profile** (`/profile.html`) - Set player preferences, manage rackets owned

## 📊 Event Tracking System

The site uses a **centralized event tracking abstraction layer** in `js/events.js`. All events are logged to the browser console.

### Current Events (Pre-Braze)

When you interact with the site, watch the browser console for event logs:

```javascript
[EventTracker] Product viewed: {product_id: "sku-001", ...}
[EventTracker] Added to cart: {product_id: "sku-001", quantity: 1}
[EventTracker] User logged in: "user-uuid"
[EventTracker] User attribute set: {key: "play_style", value: "aggressive"}
```

### Key Events to Test

| Event | Trigger |
|-------|---------|
| `Session started` | Page load |
| `Product viewed` | Click product → view detail page |
| `Category viewed` | Click category filter |
| `Added to cart` | Click "Add to Cart" button |
| `Cart viewed` | Visit cart page |
| `Checkout started` | Click "Proceed to Checkout" |
| `User registered` | Create new account |
| `User logged in` | Log in |
| `Preferences updated` | Save player preferences |
| `Rackets owned` | Add/remove rackets from profile |

## 🧬 User Profile Data Structure

### Standard Attributes
```json
{
  "firstName": "John",
  "lastName": "McEnroe",
  "email": "john@example.com"
}
```

### Custom Attributes
```json
{
  "play_style": "aggressive",           // String
  "favorite_brand": "Babolat",          // String
  "skill_level": "intermediate",        // String
  "preferred_grip_size": "L3",          // String
  "lifetime_value": 849.99,             // Float
  "purchase_count": 2                   // Integer
}
```

### Complex Objects (Nested Data)
```json
{
  "rackets_owned": [
    {
      "id": "uuid-1",
      "brand": "Babolat",
      "model": "Pure Aero 98",
      "string_tension": 55,
      "purchase_date": "2024-01-15"
    },
    {
      "id": "uuid-2",
      "brand": "Wilson",
      "model": "Pro Staff 97",
      "string_tension": 52,
      "purchase_date": "2023-06-20"
    }
  ]
}
```

## 🔌 Integrating Braze SDK

### Step 1: Braze is already wired

The Braze Web SDK script and event layer are integrated. All HTML pages load:

- `js/braze-config.js` – your API key and options
- Braze CDN script (v4.10)

Events are sent to Braze only when an API key is set.

### Step 2: Enable Braze

Edit `js/braze-config.js` and set your API key:

```javascript
window.BRAZE_CONFIG = {
  apiKey: 'your-braze-api-key-here',  // from Braze Dashboard → API Keys
  baseUrl: 'sdk.iad-01.braze.com',    // use your region's endpoint
  enableLogging: true
};
```

Leave `apiKey` empty to run in console-only mode (events still log, nothing sent to Braze).

### Step 3: Test

1. With `enableLogging: true`, Braze logs in the console. Add `?brazeLogging=true` to any URL for extra verbose Braze logging
2. Open browser console
3. Perform actions (login, view products, add to cart)
4. Check Braze dashboard → User Search → find your test user
5. Verify events appear in user activity timeline

## 📚 Learning Path

### Week 1: Site Familiarization
- [ ] Install and run site locally
- [ ] Test all pages and features
- [ ] Explore event tracking in browser console
- [ ] Create test accounts and profiles
- [ ] Add rackets and set preferences

### Week 2: Braze Documentation
- [ ] Create NotebookLM notebook with Braze docs
- [ ] Watch Braze Web SDK introduction videos
- [ ] Read E-commerce events guide
- [ ] Review custom attributes documentation

### Week 3: SDK Integration
- [ ] Add Braze CDN script to HTML files
- [ ] Initialize Braze SDK with your API key
- [ ] Uncomment SDK calls in `events.js`
- [ ] Test user identification on login
- [ ] Verify events in Braze dashboard

### Week 4: Advanced Features
- [ ] Upload product catalog to Braze
- [ ] Create triggered campaigns
- [ ] Test user segmentation
- [ ] Explore in-app messaging
- [ ] Test push notifications (mobile)

## 🔍 Testing Checklist

### Event Tracking
- [ ] Session starts on page load
- [ ] Product views tracked with all attributes
- [ ] Cart updates captured
- [ ] Purchase events logged with revenue
- [ ] User identification on login

### User Profiles
- [ ] Custom attributes sync to Braze
- [ ] Play style preference saved
- [ ] Rackets owned array persists
- [ ] Lifetime value calculates correctly

### Cart & Checkout
- [ ] Cart persists across page reloads
- [ ] Quantities update correctly
- [ ] Cart total calculates with tax
- [ ] Checkout clears cart after purchase

### Authentication
- [ ] Demo accounts work
- [ ] New registration creates profile
- [ ] Profile preferences persist
- [ ] Logout clears session

## 🐛 Troubleshooting

**Events not appearing in console?**
- Open DevTools (F12 or Cmd+Option+I)
- Check Console tab
- Refresh page

**Cart not persisting?**
- Check browser localStorage (DevTools → Application → localStorage)
- Ensure localStorage is enabled
- Check browser privacy settings

**Products not loading?**
- Verify `data/products.json` exists
- Check Network tab in DevTools for 404 errors
- Ensure serving from local server (not file://)

**Braze SDK not initializing?**
- Verify API key is correct
- Check SDK endpoint matches your region
- Look for SDK errors in console

## 📖 Documentation Files

- **README.md** — This file (overview, getting started, learning path).
- **docs/EVENT_TRACKING_AND_BRAZE_WALKTHROUGH.md** — Deep walkthrough: how events are tracked on the site, how the Braze SDK is wired, and how `js/events.js` ties to `js/products.js`, `js/cart.js`, `js/auth.js`, `js/user-profile.js`, and `js/app.js`.

## 🎓 Learning Resources

**Braze Official:**
- [Developer Guide](https://www.braze.com/docs/developer_guide/home)
- [Web SDK Documentation](https://www.braze.com/docs/developer_guide/sdk_integration)
- [E-Commerce Events](https://www.braze.com/docs/user_guide/data/activation/custom_data/recommended_events/ecommerce_events)
- [Custom Attributes](https://www.braze.com/docs/user_guide/data/activation/custom_data/custom_attributes)

**Learning Tools:**
- [NotebookLM](https://notebooklm.google.com/) - Synthesize documentation
- [Braze Learning Center](https://learning.braze.com/path/developer) - Interactive courses

## 🚀 Next Steps

After mastering the Web SDK:

1. **Android App** - Build native Android app with Braze Android SDK
2. **Backend Integration** - Add Node.js backend with real database
3. **Catalogs** - Upload product data to Braze Catalogs
4. **Campaigns** - Create triggered email/push campaigns
5. **Advanced** - A/B testing, personalization, segments

## 📝 Notes

- This is a **learning project**, not production-ready
- All data stored locally in `localStorage`
- Demo accounts are pre-seeded in `js/auth.js`
- Event tracking works **with or without** Braze SDK installed
- Easy to extend with real backend later

## 🎯 Success Criteria

✅ Site fully functional without Braze SDK
✅ Event tracking logs to console
✅ User profiles with complex attributes work
✅ Cart and checkout complete
✅ Integrates cleanly with Braze SDK when added
✅ Serves as a realistic learning environment

---

**Built for Braze SDK Learning**
Last Updated: March 2026

/**
 * EVENT TRACKING ABSTRACTION LAYER
 *
 * Works with or without Braze SDK. When BRAZE_CONFIG.apiKey is set and the
 * Braze script is loaded, events are sent to Braze; otherwise they only log
 * to the console (manual learning mode).
 */

// Only call Braze when SDK is loaded and we have an API key
function brazeReady() {
  return typeof braze !== 'undefined' && window.BRAZE_CONFIG && window.BRAZE_CONFIG.apiKey;
}

const EventTracker = {
  // Initialize tracking system and Braze if configured
  init() {
    console.log('[EventTracker] Initialized');
    if (brazeReady()) {
      const cfg = window.BRAZE_CONFIG;
      braze.initialize(cfg.apiKey, {
        baseUrl: cfg.baseUrl || 'sdk.iad-01.braze.com',
        enableLogging: cfg.enableLogging !== false
      });
      braze.automaticallyShowInAppMessages();
      console.log('[EventTracker] Braze SDK enabled');
    } else {
      console.log('[EventTracker] Braze disabled — set BRAZE_CONFIG.apiKey in js/braze-config.js to enable');
    }
  },

  // SESSION TRACKING
  startSession() {
    console.log('[EventTracker] Session started');
    if (brazeReady()) braze.openSession();
  },

  // USER IDENTIFICATION
  identifyUser(userId, userAttributes = {}) {
    console.log('[EventTracker] User identified:', { userId, ...userAttributes });
    if (!brazeReady()) return;
    braze.changeUser(userId);
    const u = braze.getUser();
    if (userAttributes.email) u.setEmail(userAttributes.email);
    if (userAttributes.firstName) u.setFirstName(userAttributes.firstName);
    if (userAttributes.lastName) u.setLastName(userAttributes.lastName);
  },

  // PRODUCT VIEWED EVENT
  trackProductView(product) {
    const eventData = {
      product_id: product.id,
      product_name: product.name,
      variant_id: product.id,
      price: product.price,
      currency: product.currency || 'CAD',
      brand: product.brand,
      category: product.category,
      image_url: product.image_url,
      source: 'product_detail_page'
    };
    console.log('[EventTracker] Product viewed:', eventData);
    if (brazeReady()) braze.logCustomEvent('ecommerce.product_viewed', eventData);
  },

  // CATEGORY VIEWED EVENT
  trackCategoryView(category) {
    console.log('[EventTracker] Category viewed:', category);
    if (brazeReady()) braze.logCustomEvent('ecommerce.category_viewed', { category });
  },

  // ADD TO CART EVENT
  trackAddToCart(product, quantity = 1) {
    const eventData = {
      product_id: product.id,
      product_name: product.name,
      quantity,
      price: product.price,
      currency: product.currency || 'CAD',
      brand: product.brand
    };
    console.log('[EventTracker] Added to cart:', eventData);
    if (brazeReady()) braze.logCustomEvent('ecommerce.cart_updated', eventData);
  },

  // CART VIEWED EVENT
  trackCartView() {
    console.log('[EventTracker] Cart viewed');
    if (brazeReady()) braze.logCustomEvent('ecommerce.cart_viewed', {});
  },

  // CHECKOUT STARTED EVENT
  trackCheckoutStarted(cartValue) {
    const eventData = { cart_value: cartValue, currency: 'CAD' };
    console.log('[EventTracker] Checkout started:', eventData);
    if (brazeReady()) braze.logCustomEvent('ecommerce.checkout_started', eventData);
  },

  // PURCHASE EVENT
  trackPurchase(order) {
    const eventData = {
      order_id: order.id,
      order_total: order.total,
      currency: order.currency || 'CAD',
      items: order.items,
      timestamp: new Date().toISOString()
    };
    console.log('[EventTracker] Purchase completed:', eventData);
    if (brazeReady()) {
      braze.logCustomEvent('ecommerce.order_placed', eventData);
      if (order.items && order.items.length) {
        const pricePerItem = order.total / order.items.length;
        braze.logPurchase(order.items[0].id, pricePerItem, order.currency || 'CAD', order.items.length);
      }
    }
  },

  // USER REGISTERED EVENT
  trackUserRegistration(user) {
    console.log('[EventTracker] User registered:', { email: user.email, firstName: user.firstName });
    if (brazeReady()) braze.logCustomEvent('user.registered', { email: user.email, firstName: user.firstName });
  },

  // USER LOGIN EVENT
  trackUserLogin(userId) {
    console.log('[EventTracker] User logged in:', userId);
    if (brazeReady()) braze.logCustomEvent('user.logged_in', { user_id: userId });
  },

  // SET CUSTOM USER ATTRIBUTE
  setUserAttribute(key, value) {
    console.log('[EventTracker] User attribute set:', { key, value });
    if (brazeReady()) braze.getUser().setCustomUserAttribute(key, value);
  },

  // SET MULTIPLE USER ATTRIBUTES
  setUserAttributes(attributes) {
    console.log('[EventTracker] User attributes set:', attributes);
    if (brazeReady()) {
      Object.entries(attributes).forEach(([key, value]) => braze.getUser().setCustomUserAttribute(key, value));
    }
  },

  setPlayStyle(playStyle) {
    console.log('[EventTracker] Play style set:', playStyle);
    if (brazeReady()) braze.getUser().setCustomUserAttribute('play_style', playStyle);
  },

  setFavoriteBrand(brand) {
    console.log('[EventTracker] Favorite brand set:', brand);
    if (brazeReady()) braze.getUser().setCustomUserAttribute('favorite_brand', brand);
  },

  setSkillLevel(level) {
    console.log('[EventTracker] Skill level set:', level);
    if (brazeReady()) braze.getUser().setCustomUserAttribute('skill_level', level);
  },

  setRacketsOwned(racketsArray) {
    console.log('[EventTracker] Rackets owned set:', racketsArray);
    if (brazeReady()) braze.getUser().setCustomUserAttribute('rackets_owned', racketsArray);
  },

  setPreferredGripSize(gripSize) {
    console.log('[EventTracker] Preferred grip size set:', gripSize);
    if (brazeReady()) braze.getUser().setCustomUserAttribute('preferred_grip_size', gripSize);
  },

  addToLifetimeValue(amount) {
    console.log('[EventTracker] Lifetime value increment:', amount);
    if (brazeReady()) braze.getUser().incrementCustomUserAttribute('lifetime_value', amount);
  },

  incrementPurchaseCount() {
    console.log('[EventTracker] Purchase count incremented');
    if (brazeReady()) braze.getUser().incrementCustomUserAttribute('purchase_count', 1);
  },

  trackProfileUpdate(user) {
    console.log('[EventTracker] Profile updated:', user);
    if (brazeReady()) braze.logCustomEvent('user.profile_updated', { firstName: user.firstName, lastName: user.lastName });
  },

  trackPreferenceUpdate(preferences) {
    console.log('[EventTracker] Preferences updated:', preferences);
    if (brazeReady()) braze.logCustomEvent('user.preferences_updated', preferences);
  },

  trackPageView(pageName) {
    console.log('[EventTracker] Page viewed:', pageName);
    if (brazeReady()) braze.logCustomEvent('page.viewed', { page_name: pageName, timestamp: new Date().toISOString() });
  },

  trackSearch(searchQuery, resultsCount) {
    console.log('[EventTracker] Search performed:', { query: searchQuery, results: resultsCount });
    if (brazeReady()) braze.logCustomEvent('search.performed', { query: searchQuery, results_count: resultsCount });
  },

  trackFilterApplied(filterType, filterValue) {
    console.log('[EventTracker] Filter applied:', { type: filterType, value: filterValue });
    if (brazeReady()) braze.logCustomEvent('filter.applied', { filter_type: filterType, filter_value: filterValue });
  },

  logCustomEvent(eventName, properties = {}) {
    console.log(`[EventTracker] Custom event: ${eventName}`, properties);
    if (brazeReady()) braze.logCustomEvent(eventName, properties);
  }
};

// Initialize on script load
document.addEventListener('DOMContentLoaded', () => {
  EventTracker.init();
  EventTracker.startSession();
});

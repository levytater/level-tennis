/**
 * EVENT TRACKING ABSTRACTION LAYER
 *
 * This module provides a clean abstraction for event tracking
 * Works standalone WITHOUT Braze SDK
 * Ready for Braze SDK integration - just uncomment SDK calls marked with "Future:"
 *
 * When Braze SDK is added:
 * 1. Include Braze script in HTML head
 * 2. Initialize with braze.initialize() in app.js
 * 3. Uncomment all "Future:" SDK calls below
 * 4. No changes needed in components - they already call EventTracker methods
 */

const EventTracker = {
  // Initialize tracking system
  init() {
    console.log('[EventTracker] Initialized');
    console.log('[EventTracker] Tip: To integrate Braze SDK, uncomment SDK calls marked with "Future:"');

    // Future: braze.initialize('YOUR-API-KEY-HERE', {
    //   baseUrl: 'sdk.iad-01.braze.com',
    //   enableLogging: true
    // });
    // Future: braze.automaticallyShowInAppMessages();
  },

  // SESSION TRACKING
  startSession() {
    console.log('[EventTracker] Session started');
    // Future: braze.openSession();
  },

  // USER IDENTIFICATION
  identifyUser(userId, userAttributes = {}) {
    console.log('[EventTracker] User identified:', {
      userId,
      ...userAttributes
    });

    // Future: braze.changeUser(userId);
    // Future: braze.getUser().setEmail(userAttributes.email);
    // Future: braze.getUser().setFirstName(userAttributes.firstName);
    // Future: braze.getUser().setLastName(userAttributes.lastName);
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

    // Future: braze.logCustomEvent('ecommerce.product_viewed', eventData);
  },

  // CATEGORY VIEWED EVENT
  trackCategoryView(category) {
    console.log('[EventTracker] Category viewed:', category);
    // Future: braze.logCustomEvent('ecommerce.category_viewed', {
    //   category: category
    // });
  },

  // ADD TO CART EVENT
  trackAddToCart(product, quantity = 1) {
    const eventData = {
      product_id: product.id,
      product_name: product.name,
      quantity: quantity,
      price: product.price,
      currency: product.currency || 'CAD',
      brand: product.brand
    };

    console.log('[EventTracker] Added to cart:', eventData);

    // Future: braze.logCustomEvent('ecommerce.cart_updated', eventData);
  },

  // CART VIEWED EVENT
  trackCartView() {
    console.log('[EventTracker] Cart viewed');
    // Future: braze.logCustomEvent('ecommerce.cart_viewed', {});
  },

  // CHECKOUT STARTED EVENT
  trackCheckoutStarted(cartValue) {
    const eventData = {
      cart_value: cartValue,
      currency: 'CAD'
    };

    console.log('[EventTracker] Checkout started:', eventData);

    // Future: braze.logCustomEvent('ecommerce.checkout_started', eventData);
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

    // Future: braze.logCustomEvent('ecommerce.order_placed', eventData);
    // Future: braze.logPurchase(
    //   order.items[0].id,
    //   order.total / order.items.length,
    //   order.currency || 'CAD',
    //   order.items.length
    // );
  },

  // USER REGISTERED EVENT
  trackUserRegistration(user) {
    console.log('[EventTracker] User registered:', {
      email: user.email,
      firstName: user.firstName
    });

    // Future: braze.logCustomEvent('user.registered', {
    //   email: user.email,
    //   firstName: user.firstName
    // });
  },

  // USER LOGIN EVENT
  trackUserLogin(userId) {
    console.log('[EventTracker] User logged in:', userId);
    // Future: braze.logCustomEvent('user.logged_in', {
    //   user_id: userId
    // });
  },

  // SET CUSTOM USER ATTRIBUTE
  setUserAttribute(key, value) {
    console.log('[EventTracker] User attribute set:', { key, value });

    // Future: braze.getUser().setCustomUserAttribute(key, value);
  },

  // SET MULTIPLE USER ATTRIBUTES
  setUserAttributes(attributes) {
    console.log('[EventTracker] User attributes set:', attributes);

    Object.entries(attributes).forEach(([key, value]) => {
      // Future: braze.getUser().setCustomUserAttribute(key, value);
    });
  },

  // PLAY STYLE PREFERENCE
  setPlayStyle(playStyle) {
    console.log('[EventTracker] Play style set:', playStyle);
    // Future: braze.getUser().setCustomUserAttribute('play_style', playStyle);
  },

  // FAVORITE BRAND
  setFavoriteBrand(brand) {
    console.log('[EventTracker] Favorite brand set:', brand);
    // Future: braze.getUser().setCustomUserAttribute('favorite_brand', brand);
  },

  // SKILL LEVEL
  setSkillLevel(level) {
    console.log('[EventTracker] Skill level set:', level);
    // Future: braze.getUser().setCustomUserAttribute('skill_level', level);
  },

  // RACKETS OWNED (Complex Object - Testing Nested Data)
  setRacketsOwned(racketsArray) {
    console.log('[EventTracker] Rackets owned set:', racketsArray);

    // Future: braze.getUser().setCustomUserAttribute('rackets_owned', racketsArray);
  },

  // PREFERRED GRIP SIZE
  setPreferredGripSize(gripSize) {
    console.log('[EventTracker] Preferred grip size set:', gripSize);
    // Future: braze.getUser().setCustomUserAttribute('preferred_grip_size', gripSize);
  },

  // LIFETIME VALUE (Incrementable)
  addToLifetimeValue(amount) {
    console.log('[EventTracker] Lifetime value increment:', amount);

    // Future: braze.getUser().incrementCustomUserAttribute('lifetime_value', amount);
  },

  // PURCHASE COUNT (Incrementable)
  incrementPurchaseCount() {
    console.log('[EventTracker] Purchase count incremented');

    // Future: braze.getUser().incrementCustomUserAttribute('purchase_count', 1);
  },

  // PROFILE UPDATED EVENT
  trackProfileUpdate(user) {
    console.log('[EventTracker] Profile updated:', user);

    // Future: braze.logCustomEvent('user.profile_updated', {
    //   firstName: user.firstName,
    //   lastName: user.lastName
    // });
  },

  // PREFERENCE UPDATED EVENT
  trackPreferenceUpdate(preferences) {
    console.log('[EventTracker] Preferences updated:', preferences);

    // Future: braze.logCustomEvent('user.preferences_updated', preferences);
  },

  // PAGE VIEW (Generic)
  trackPageView(pageName) {
    console.log('[EventTracker] Page viewed:', pageName);

    // Future: braze.logCustomEvent('page.viewed', {
    //   page_name: pageName,
    //   timestamp: new Date().toISOString()
    // });
  },

  // SEARCH EVENT
  trackSearch(searchQuery, resultsCount) {
    console.log('[EventTracker] Search performed:', {
      query: searchQuery,
      results: resultsCount
    });

    // Future: braze.logCustomEvent('search.performed', {
    //   query: searchQuery,
    //   results_count: resultsCount
    // });
  },

  // FILTER APPLIED
  trackFilterApplied(filterType, filterValue) {
    console.log('[EventTracker] Filter applied:', {
      type: filterType,
      value: filterValue
    });

    // Future: braze.logCustomEvent('filter.applied', {
    //   filter_type: filterType,
    //   filter_value: filterValue
    // });
  },

  // CUSTOM EVENT
  logCustomEvent(eventName, properties = {}) {
    console.log(`[EventTracker] Custom event: ${eventName}`, properties);

    // Future: braze.logCustomEvent(eventName, properties);
  }
};

// Initialize on script load
document.addEventListener('DOMContentLoaded', () => {
  EventTracker.init();
  EventTracker.startSession();
});

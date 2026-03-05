/**
 * PRODUCTS MODULE
 * Handles product catalog display, filtering, and detail views
 */

let productsData = null;
let currentCategory = 'all';

// Load products data
async function loadProducts() {
  productsData = await fetchProducts();
  return productsData;
}

// Display featured products on homepage
async function displayFeaturedProducts() {
  const container = getElement('#featured-products');
  if (!container) return;

  if (!productsData) await loadProducts();

  const allProducts = getAllProductsArray(productsData);
  const rackets = allProducts.filter(p => p.category === 'rackets').slice(0, 6);

  container.innerHTML = rackets.map(product => createProductCard(product)).join('');

  // Add event listeners
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const productId = card.dataset.productId;
      EventTracker.trackProductView(getProductById(productId, productsData));
      window.location.href = `product-detail.html?id=${productId}`;
    });
  });
}

// Display products on products page
async function displayProducts(category = 'all') {
  const container = getElement('#products-grid');
  if (!container) return;

  if (!productsData) await loadProducts();

  let products = getAllProductsArray(productsData);
  products = filterProducts(products, category);

  container.innerHTML = products.map(product => createProductCard(product)).join('');

  // Add event listeners
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const productId = card.dataset.productId;
      const product = getProductById(productId, productsData);
      EventTracker.trackProductView(product);
      window.location.href = `product-detail.html?id=${productId}`;
    });
  });
}

// Create product card HTML
function createProductCard(product) {
  return `
    <div class="product-card" data-product-id="${product.id}">
      <img src="${product.image_url}" alt="${product.name}" class="product-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22250%22 height=%22250%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22250%22 height=%22250%22/%3E%3C/svg%3E'">
      <div class="product-content">
        <div class="product-brand">${product.brand}</div>
        <h3 class="product-name">${product.name}</h3>
        ${product.color ? `<div class="product-category">${product.color}</div>` : ''}
        <div class="product-price">${formatCurrency(product.price)}</div>
      </div>
    </div>
  `;
}

// Display product detail
async function displayProductDetail() {
  const container = getElement('#product-detail');
  if (!container) return;

  if (!productsData) await loadProducts();

  const productId = getQueryParam('id');
  const product = getProductById(productId, productsData);

  if (!product) {
    container.innerHTML = '<p>Product not found</p>';
    return;
  }

  // Track product view
  EventTracker.trackProductView(product);

  // Build HTML based on product type
  let optionsHTML = '';
  if (product.grip_sizes) {
    optionsHTML = `
      <div class="option-group">
        <label class="option-label">Grip Size</label>
        <div class="option-buttons">
          ${product.grip_sizes.map(size => `
            <button class="option-btn" data-option="grip" data-value="${size}">${size}</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  let specsHTML = '';
  if (product.specs) {
    specsHTML = `
      <div class="product-specs">
        <h3>Specifications</h3>
        ${Object.entries(product.specs).map(([key, value]) => `
          <div class="spec-item">
            <div class="spec-label">${formatSpecKey(key)}</div>
            <div class="spec-value">${value}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="product-detail">
      <div class="product-image-container">
        <img src="${product.image_url}" alt="${product.name}" style="max-width: 100%; border-radius: 0.5rem;">
      </div>
      <div class="product-details-section">
        <div class="product-brand-detail">${product.brand}</div>
        <h1>${product.name}</h1>
        <div class="product-price-detail">${formatCurrency(product.price)}</div>

        <p class="product-description">${product.description}</p>

        ${specsHTML}

        <div class="product-options">
          ${optionsHTML}
          <div class="option-group">
            <label class="option-label">Quantity</label>
            <div class="quantity-selector">
              <button class="quantity-btn" id="qty-minus">−</button>
              <input type="number" class="quantity-input" id="qty-input" value="1" min="1" max="100">
              <button class="quantity-btn" id="qty-plus">+</button>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-lg add-to-cart-btn" id="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  `;

  // Setup quantity controls
  setupQuantityControls();

  // Setup grip size selection
  setupOptionSelection();

  // Setup add to cart button
  const addBtn = getElement('#add-to-cart-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const quantity = parseInt(getElement('#qty-input').value) || 1;
      CartManager.addItem(product, quantity);
      EventTracker.trackAddToCart(product, quantity);
      showAlert('Added to cart!', 'success');
    });
  }
}

// Format specification keys for display
function formatSpecKey(key) {
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Setup quantity controls
function setupQuantityControls() {
  const input = getElement('#qty-input');
  const minusBtn = getElement('#qty-minus');
  const plusBtn = getElement('#qty-plus');

  if (!input || !minusBtn || !plusBtn) return;

  minusBtn.addEventListener('click', () => {
    let value = parseInt(input.value) || 1;
    if (value > 1) input.value = value - 1;
  });

  plusBtn.addEventListener('click', () => {
    let value = parseInt(input.value) || 1;
    input.value = value + 1;
  });

  input.addEventListener('change', () => {
    let value = parseInt(input.value) || 1;
    if (value < 1) input.value = 1;
    if (value > 100) input.value = 100;
  });
}

// Setup option selection (grip size, color, etc)
function setupOptionSelection() {
  const optionBtns = getAllElements('.option-btn');
  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.parentElement;
      group.querySelectorAll('.option-btn').forEach(b => removeClass(b, 'selected'));
      addClass(btn, 'selected');
    });

    // Select first option by default
    if (btn === optionBtns[0]) {
      addClass(btn, 'selected');
    }
  });
}

// Setup filter buttons
function setupFilters() {
  const filterBtns = getAllElements('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => removeClass(b, 'active'));
      addClass(btn, 'active');

      const category = btn.dataset.category;
      currentCategory = category;

      EventTracker.trackFilterApplied('category', category);
      displayProducts(category);
    });
  });

  // Check for category in URL
  const categoryParam = getQueryParam('category');
  if (categoryParam) {
    const btn = getElement(`[data-category="${categoryParam}"]`);
    if (btn) {
      filterBtns.forEach(b => removeClass(b, 'active'));
      addClass(btn, 'active');
      currentCategory = categoryParam;
      displayProducts(categoryParam);
    }
  } else {
    displayProducts('all');
  }
}

// Initialize products page
document.addEventListener('DOMContentLoaded', async () => {
  // On homepage - display featured
  if (getElement('#featured-products')) {
    await displayFeaturedProducts();
  }

  // On products page - display all with filters
  if (getElement('#products-grid')) {
    await loadProducts();
    setupFilters();
  }

  // On product detail page
  if (getElement('#product-detail')) {
    await displayProductDetail();
  }
});

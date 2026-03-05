/**
 * CART MODULE
 * Handles shopping cart management
 */

const CartManager = {
  // Get cart from storage
  getCart() {
    return Storage.get('cart') || [];
  },

  // Save cart to storage
  saveCart(cart) {
    Storage.set('cart', cart);
    updateCartCountUI();
  },

  // Add item to cart
  addItem(product, quantity = 1) {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image_url: product.image_url,
        quantity: quantity
      });
    }

    this.saveCart(cart);
  },

  // Remove item from cart
  removeItem(productId) {
    const cart = this.getCart();
    const filtered = cart.filter(item => item.id !== productId);
    this.saveCart(filtered);
  },

  // Update item quantity
  updateQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.find(item => item.id === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveCart(cart);
      }
    }
  },

  // Clear cart
  clear() {
    Storage.set('cart', []);
    updateCartCountUI();
  },

  // Get cart total
  getTotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  // Get subtotal
  getSubtotal() {
    return this.getTotal();
  },

  // Get tax (5%)
  getTax() {
    return this.getSubtotal() * 0.05;
  },

  // Get grand total
  getGrandTotal() {
    return this.getSubtotal() + this.getTax();
  },

  // Get item count
  getItemCount() {
    const cart = this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  }
};

// Display cart items
function displayCartItems() {
  const container = getElement('#cart-content');
  const summaryEl = getElement('#cart-summary');
  const emptyEl = getElement('#empty-cart');

  if (!container) return;

  const cart = CartManager.getCart();

  if (cart.length === 0) {
    container.innerHTML = '';
    if (summaryEl) summaryEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }

  // Show summary and hide empty message
  if (summaryEl) summaryEl.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';

  // Build cart items HTML
  container.innerHTML = `
    <div class="cart-items">
      ${cart.map(item => `
        <div class="cart-item">
          <img src="${item.image_url}" alt="${item.name}" class="cart-item-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'">
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-brand">${item.brand}</div>
          </div>
          <div class="cart-item-quantity">
            <button class="qty-btn qty-minus" data-product-id="${item.id}">−</button>
            <input type="number" class="qty-input" value="${item.quantity}" min="1" data-product-id="${item.id}">
            <button class="qty-btn qty-plus" data-product-id="${item.id}">+</button>
          </div>
          <div class="cart-item-price">${formatCurrency(item.price * item.quantity)}</div>
          <button class="cart-item-remove" data-product-id="${item.id}">Remove</button>
        </div>
      `).join('')}
    </div>
  `;

  // Setup event listeners
  setupCartItemControls();

  // Update summary
  updateCartSummary();

  // Track cart view
  EventTracker.trackCartView();
}

// Setup cart item control listeners
function setupCartItemControls() {
  // Quantity buttons
  const minusBtns = getAllElements('.qty-minus');
  const plusBtns = getAllElements('.qty-plus');
  const qtyInputs = getAllElements('.qty-input');
  const removeBtns = getAllElements('.cart-item-remove');

  minusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      const cart = CartManager.getCart();
      const item = cart.find(i => i.id === productId);
      if (item && item.quantity > 1) {
        CartManager.updateQuantity(productId, item.quantity - 1);
        displayCartItems();
      }
    });
  });

  plusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      const cart = CartManager.getCart();
      const item = cart.find(i => i.id === productId);
      if (item) {
        CartManager.updateQuantity(productId, item.quantity + 1);
        displayCartItems();
      }
    });
  });

  qtyInputs.forEach(input => {
    input.addEventListener('change', () => {
      const productId = input.dataset.productId;
      const quantity = parseInt(input.value) || 1;
      CartManager.updateQuantity(productId, quantity);
      displayCartItems();
    });
  });

  removeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      CartManager.removeItem(productId);
      displayCartItems();
      showAlert('Item removed from cart', 'success');
    });
  });
}

// Update cart summary
function updateCartSummary() {
  const subtotal = CartManager.getSubtotal();
  const tax = CartManager.getTax();
  const total = CartManager.getGrandTotal();

  const subtotalEl = getElement('#subtotal');
  const taxEl = getElement('#tax');
  const totalEl = getElement('#total');

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (taxEl) taxEl.textContent = formatCurrency(tax);
  if (totalEl) totalEl.textContent = formatCurrency(total);
}

// Setup checkout button
function setupCheckout() {
  const checkoutBtn = getElement('#checkout-btn');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const user = getCurrentUser();

      if (!user) {
        showAlert('Please log in to checkout', 'error');
        redirect('login.html');
        return;
      }

      // Track checkout start
      EventTracker.trackCheckoutStarted(CartManager.getTotal());

      // Create order
      const cart = CartManager.getCart();
      const order = {
        id: generateUUID(),
        userId: user.id,
        items: cart,
        subtotal: CartManager.getSubtotal(),
        tax: CartManager.getTax(),
        total: CartManager.getGrandTotal(),
        currency: 'CAD',
        createdAt: new Date().toISOString()
      };

      // Track purchase
      EventTracker.trackPurchase(order);
      EventTracker.addToLifetimeValue(order.total);
      EventTracker.incrementPurchaseCount();

      // Save order to user profile
      const orders = Storage.get('orders') || [];
      orders.push(order);
      Storage.set('orders', orders);

      // Clear cart
      CartManager.clear();

      showAlert('Order placed successfully!', 'success');
      setTimeout(() => {
        redirect('profile.html');
      }, 1500);
    });
  }
}

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
  if (getElement('#cart-content')) {
    displayCartItems();
    setupCheckout();
  }
});

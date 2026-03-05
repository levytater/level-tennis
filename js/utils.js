/* UTILITY FUNCTIONS */

// UUID Generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// LocalStorage Helper
const Storage = {
  get(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  }
};

// URL Query Parameter Parser
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Format Currency
function formatCurrency(value) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(value);
}

// Format Date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Clone Object (Deep Copy)
function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Get Element Safely
function getElement(selector) {
  return document.querySelector(selector);
}

// Get All Elements
function getAllElements(selector) {
  return document.querySelectorAll(selector);
}

// Create Element Helper
function createElement(tag, className = '', content = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content) element.textContent = content;
  return element;
}

// Debounce Function
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Throttle Function
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Fetch Products Data
async function fetchProducts() {
  try {
    const response = await fetch('./data/products.json');
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('[Error] Fetching products:', error);
    return null;
  }
}

// Add Event Listener Safely
function addEventListener(selector, event, callback) {
  const element = getElement(selector);
  if (element) {
    element.addEventListener(event, callback);
  }
}

// Add Multiple Event Listeners
function addEventListeners(selector, events, callback) {
  const elements = getAllElements(selector);
  elements.forEach(element => {
    events.forEach(event => {
      element.addEventListener(event, callback);
    });
  });
}

// Update Cart Count in UI
function updateCartCountUI() {
  const cart = Storage.get('cart') || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCounts = getAllElements('#cart-count');
  cartCounts.forEach(element => {
    element.textContent = totalItems;
  });
}

// Update Navigation Auth Links
function updateNavAuth() {
  const user = Storage.get('currentUser');
  const navAuth = getElement('#nav-auth');

  if (!navAuth) return;

  if (user) {
    navAuth.innerHTML = `
      <div class="nav-auth-menu">
        <span class="user-name">${user.firstName}</span>
        <a href="profile.html" class="nav-link">Profile</a>
        <a href="#" class="nav-link" id="logout-link">Logout</a>
      </div>
    `;
    const logoutLink = getElement('#logout-link');
    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        Storage.remove('currentUser');
        window.location.href = 'login.html';
      });
    }
  } else {
    navAuth.innerHTML = '<a href="login.html" class="nav-link">Login</a>';
  }
}

// Check if User is Logged In
function isUserLoggedIn() {
  return Storage.get('currentUser') !== null;
}

// Get Current User
function getCurrentUser() {
  return Storage.get('currentUser');
}

// Validate Email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Show Modal/Alert
function showAlert(message, type = 'info') {
  const alertDiv = createElement('div', `alert alert-${type}`);
  alertDiv.textContent = message;
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem;
    background-color: ${type === 'error' ? '#ef4444' : '#10b981'};
    color: white;
    border-radius: 0.5rem;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}

// Redirect
function redirect(path) {
  window.location.href = path;
}

// Parse Products into Flat Array
function getAllProductsArray(productsData) {
  if (!productsData || !productsData.products) return [];

  const allProducts = [];
  Object.keys(productsData.products).forEach(category => {
    const categoryProducts = productsData.products[category];
    if (Array.isArray(categoryProducts)) {
      categoryProducts.forEach(product => {
        product.category = category;
        allProducts.push(product);
      });
    }
  });
  return allProducts;
}

// Get Product by ID
function getProductById(productId, productsData) {
  const allProducts = getAllProductsArray(productsData);
  return allProducts.find(p => p.id === productId);
}

// Filter Products
function filterProducts(products, category) {
  if (category === 'all') return products;
  return products.filter(p => p.category === category);
}

// Sort Products
function sortProducts(products, sortBy = 'featured') {
  const sorted = cloneObject(products);

  switch(sortBy) {
    case 'price-low':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }

  return sorted;
}

// CSS Class Helpers
function addClass(element, className) {
  if (element) element.classList.add(className);
}

function removeClass(element, className) {
  if (element) element.classList.remove(className);
}

function toggleClass(element, className) {
  if (element) element.classList.toggle(className);
}

function hasClass(element, className) {
  return element ? element.classList.contains(className) : false;
}

/**
 * AUTHENTICATION MODULE
 * Handles user login, registration, and session management
 */

const AuthManager = {
  // Demo users for testing
  demoUsers: [
    {
      id: '1',
      email: 'john@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'McEnroe'
    },
    {
      id: '2',
      email: 'jane@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Williams'
    }
  ],

  // Login user
  login(email, password) {
    // Validate input
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }

    if (!validateEmail(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Find user (demo only - in real app, validate against backend)
    const user = this.demoUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Save user session
    const userSession = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      loginTime: new Date().toISOString()
    };

    Storage.set('currentUser', userSession);

    // Initialize user profile if not exists
    const userProfile = Storage.get(`user_profile_${user.id}`);
    if (!userProfile) {
      Storage.set(`user_profile_${user.id}`, {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        preferences: {
          play_style: null,
          favorite_brand: null,
          skill_level: null
        },
        rackets_owned: []
      });
    }

    // Track login
    EventTracker.identifyUser(user.id, {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });
    EventTracker.trackUserLogin(user.id);

    return { success: true, user: userSession };
  },

  // Register new user
  register(firstName, lastName, email, password) {
    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return { success: false, message: 'All fields are required' };
    }

    if (!validateEmail(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Check if user exists
    const existingUser = this.demoUsers.find(u => u.email === email);
    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }

    // Create new user
    const newUser = {
      id: generateUUID(),
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName
    };

    // In real app, this would be sent to backend
    this.demoUsers.push(newUser);

    // Auto login after registration
    return this.login(email, password);
  },

  // Logout user
  logout() {
    Storage.remove('currentUser');
    EventTracker.logCustomEvent('user.logged_out', {});
  },

  // Get current user
  getCurrentUser() {
    return Storage.get('currentUser');
  },

  // Check if user is logged in
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }
};

// Setup login form
function setupLoginForm() {
  const loginForm = getElement('#login-form');
  const signupLink = getElement('#signup-link');
  const signupForm = getElement('#signup-form');
  const loginLink = getElement('#login-link');

  if (!loginForm) return;

  // Toggle between login and signup
  if (signupLink) {
    signupLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      signupForm.style.display = 'block';
    });
  }

  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      signupForm.style.display = 'none';
      loginForm.style.display = 'block';
    });
  }

  // Handle login submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = getElement('#email').value;
    const password = getElement('#password').value;

    const result = AuthManager.login(email, password);

    if (result.success) {
      showAlert('Login successful!', 'success');
      setTimeout(() => {
        redirect('index.html');
      }, 1000);
    } else {
      showAlert(result.message, 'error');
    }
  });

  // Handle signup submission
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const firstName = getElement('#signup-firstname').value;
      const lastName = getElement('#signup-lastname').value;
      const email = getElement('#signup-email').value;
      const password = getElement('#signup-password').value;

      const result = AuthManager.register(firstName, lastName, email, password);

      if (result.success) {
        showAlert('Registration successful! Welcome, ' + result.user.firstName, 'success');

        // Track registration
        EventTracker.trackUserRegistration({
          email: result.user.email,
          firstName: result.user.firstName
        });

        setTimeout(() => {
          redirect('index.html');
        }, 1500);
      } else {
        showAlert(result.message, 'error');
      }
    });
  }
}

// Redirect to login if not logged in (for protected pages)
function requireLogin() {
  if (!AuthManager.isLoggedIn()) {
    redirect('login.html');
  }
}

// Setup auth on page load
document.addEventListener('DOMContentLoaded', () => {
  setupLoginForm();

  // Check if on profile page and not logged in
  if (getElement('#profile-content') && !AuthManager.isLoggedIn()) {
    const profileContent = getElement('#profile-content');
    const notLoggedIn = getElement('#not-logged-in');
    if (profileContent) profileContent.style.display = 'none';
    if (notLoggedIn) notLoggedIn.style.display = 'block';
  }
});

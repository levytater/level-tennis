/**
 * USER PROFILE MODULE
 * Handles user profile preferences, rackets owned, and settings
 */

const UserProfile = {
  // Get user profile
  getProfile(userId) {
    return Storage.get(`user_profile_${userId}`) || null;
  },

  // Save user profile
  saveProfile(userId, profile) {
    Storage.set(`user_profile_${userId}`, profile);
  },

  // Update preferences
  updatePreferences(userId, preferences) {
    const profile = this.getProfile(userId);
    if (profile) {
      profile.preferences = { ...profile.preferences, ...preferences };
      this.saveProfile(userId, profile);

      // Track preference update in Braze
      EventTracker.setUserAttributes(preferences);

      return true;
    }
    return false;
  },

  // Add racket
  addRacket(userId, racket) {
    const profile = this.getProfile(userId);
    if (profile) {
      if (!profile.rackets_owned) {
        profile.rackets_owned = [];
      }
      racket.id = generateUUID();
      profile.rackets_owned.push(racket);
      this.saveProfile(userId, profile);

      // Track racket addition
      EventTracker.setRacketsOwned(profile.rackets_owned);

      return true;
    }
    return false;
  },

  // Remove racket
  removeRacket(userId, racketId) {
    const profile = this.getProfile(userId);
    if (profile && profile.rackets_owned) {
      profile.rackets_owned = profile.rackets_owned.filter(r => r.id !== racketId);
      this.saveProfile(userId, profile);

      // Track update
      EventTracker.setRacketsOwned(profile.rackets_owned);

      return true;
    }
    return false;
  },

  // Get rackets
  getRackets(userId) {
    const profile = this.getProfile(userId);
    return profile ? profile.rackets_owned || [] : [];
  }
};

// Display profile information
function displayProfileInfo() {
  const user = getCurrentUser();
  if (!user) return;

  const nameEl = getElement('#profile-name');
  const emailEl = getElement('#profile-email');

  if (nameEl) nameEl.textContent = `${user.firstName} ${user.lastName}`;
  if (emailEl) emailEl.textContent = user.email;

  // Display preferences
  loadPreferences(user.id);

  // Display rackets
  displayRackets(user.id);
}

// Load and display preferences
function loadPreferences(userId) {
  const profile = UserProfile.getProfile(userId);
  if (!profile) return;

  const playStyle = getElement('#play-style');
  const favBrand = getElement('#favorite-brand');
  const skillLevel = getElement('#skill-level');

  if (playStyle && profile.preferences.play_style) {
    playStyle.value = profile.preferences.play_style;
  }

  if (favBrand && profile.preferences.favorite_brand) {
    favBrand.value = profile.preferences.favorite_brand;
  }

  if (skillLevel && profile.preferences.skill_level) {
    skillLevel.value = profile.preferences.skill_level;
  }
}

// Save preferences
function savePreferences() {
  const user = getCurrentUser();
  if (!user) return;

  const playStyle = getElement('#play-style').value;
  const favBrand = getElement('#favorite-brand').value;
  const skillLevel = getElement('#skill-level').value;

  const preferences = {
    play_style: playStyle || null,
    favorite_brand: favBrand || null,
    skill_level: skillLevel || null
  };

  UserProfile.updatePreferences(user.id, preferences);

  // Track profile update
  EventTracker.trackPreferenceUpdate(preferences);
  EventTracker.trackProfileUpdate(user);

  showAlert('Preferences saved!', 'success');
}

// Display rackets owned
function displayRackets(userId) {
  const container = getElement('#rackets-list');
  if (!container) return;

  const rackets = UserProfile.getRackets(userId);

  if (rackets.length === 0) {
    container.innerHTML = '<div class="no-rackets">No rackets added yet</div>';
    return;
  }

  container.innerHTML = rackets.map(racket => `
    <div class="racket-item">
      <div class="racket-details">
        <div class="racket-name">${racket.brand} ${racket.model}</div>
        <div class="racket-detail">String Tension: ${racket.string_tension} lbs</div>
        <div class="racket-detail">Purchased: ${formatDate(racket.purchase_date)}</div>
      </div>
      <button class="remove-racket-btn" data-racket-id="${racket.id}">Remove</button>
    </div>
  `).join('');

  // Setup remove buttons
  const removeButtons = getAllElements('.remove-racket-btn');
  removeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const racketId = btn.dataset.racketId;
      UserProfile.removeRacket(userId, racketId);
      displayRackets(userId);
      showAlert('Racket removed', 'success');
    });
  });
}

// Setup add racket form
function setupAddRacketForm() {
  const user = getCurrentUser();
  if (!user) return;

  const addBtn = getElement('#add-racket-btn');
  const form = getElement('#add-racket-form');
  const submitBtn = getElement('#submit-racket-btn');
  const cancelBtn = getElement('#cancel-racket-btn');

  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    form.style.display = 'block';
    addBtn.style.display = 'none';
  });

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      form.style.display = 'none';
      addBtn.style.display = 'block';
      clearAddRacketForm();
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const brand = getElement('#racket-brand').value;
      const model = getElement('#racket-model').value;
      const tension = getElement('#string-tension').value;
      const date = getElement('#purchase-date').value;

      if (!brand || !model || !tension || !date) {
        showAlert('Please fill in all fields', 'error');
        return;
      }

      const racket = {
        brand: brand,
        model: model,
        string_tension: parseInt(tension),
        purchase_date: date
      };

      UserProfile.addRacket(user.id, racket);
      displayRackets(user.id);
      showAlert('Racket added!', 'success');

      form.style.display = 'none';
      addBtn.style.display = 'block';
      clearAddRacketForm();
    });
  }
}

// Clear add racket form
function clearAddRacketForm() {
  getElement('#racket-brand').value = '';
  getElement('#racket-model').value = '';
  getElement('#string-tension').value = '';
  getElement('#purchase-date').value = '';
}

// Setup preferences save button
function setupPreferencesButton() {
  const saveBtn = getElement('#save-preferences');
  if (saveBtn) {
    saveBtn.addEventListener('click', savePreferences);
  }
}

// Setup logout button
function setupLogoutButton() {
  const logoutBtn = getElement('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      AuthManager.logout();
      showAlert('Logged out successfully', 'success');
      setTimeout(() => {
        redirect('index.html');
      }, 1000);
    });
  }
}

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
  if (getElement('#profile-content')) {
    if (AuthManager.isLoggedIn()) {
      getElement('#profile-content').style.display = 'block';
      getElement('#not-logged-in').style.display = 'none';

      displayProfileInfo();
      setupPreferencesButton();
      setupAddRacketForm();
      setupLogoutButton();

      // Track profile view
      EventTracker.trackPageView('profile');
    }
  }
});

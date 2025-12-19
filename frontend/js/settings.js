// Settings Modal Management for Main Page

function openSettingsModal() {
  const modal = document.getElementById('mainSettingsModal');
  if (!modal) return;
  
  // Inject settings modal HTML if not already present
  if (!modal.innerHTML) {
    modal.innerHTML = getSettingsModalHTML();
  }
  
  modal.classList.add('active');
  modal.style.display = 'flex';
  
  // Load profile data after a short delay to ensure DOM is ready
  setTimeout(loadUserProfileData, 100);
}

function closeSettingsModal() {
  const modal = document.getElementById('mainSettingsModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

function showSettingsSectionMain(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll('.settings-section');
  sections.forEach(section => section.classList.remove('active'));
  
  // Remove active from all menu items
  const menuItems = document.querySelectorAll('.settings-menu-item');
  menuItems.forEach(item => item.classList.remove('active'));
  
  // Show selected section
  const selectedSection = document.getElementById(sectionName + '-section');
  if (selectedSection) {
    selectedSection.classList.add('active');
  }
  
  // Highlight selected menu item
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
}

function getSettingsModalHTML() {
  return `
    <div class="settings-container">
      <div class="settings-sidebar">
        <div class="settings-title">Settings</div>
        <div class="settings-menu-item active" onclick="showSettingsSectionMain('account')">
          <i class='bx bx-user'></i>
          <span>1. Account Settings</span>
        </div>
        <div class="settings-menu-item" onclick="showSettingsSectionMain('reading')">
          <i class='bx bx-book-open'></i>
          <span>2. Reading Preferences</span>
        </div>
        <div class="settings-menu-item" onclick="showSettingsSectionMain('display')">
          <i class='bx bx-palette'></i>
          <span>3. Display & Theme</span>
        </div>
        <div class="settings-menu-item" onclick="showSettingsSectionMain('notifications')">
          <i class='bx bx-bell'></i>
          <span>4. Notifications & Privacy</span>
        </div>
        <div class="settings-menu-item" onclick="showSettingsSectionMain('system')">
          <i class='bx bx-cog'></i>
          <span>5. App / System Settings</span>
        </div>
      </div>
      
      <div class="settings-content">
        <button class="settings-close-btn" onclick="closeSettingsModal()">&times;</button>
        
        <!-- Account Settings Section -->
        <div class="settings-section active" id="account-section">
          <h2>🧑 1. Account Settings</h2>
          <p>These control the user's personal profile and login options.</p>
          
          <div class="settings-group">
            <h3>Profile Information</h3>
            <div class="settings-item">
              <label>Change Name</label>
              <input type="text" id="changeNameInput" placeholder="Enter new name">
              <p id="nameChangeStatus" style="font-size: 12px; color: #6b7280; margin-top: 4px;"></p>
              <button class="btn-profile btn-primary" style="margin-top: 8px;" onclick="changeUserName(event)">Update Name</button>
            </div>
            <div class="settings-item">
              <label>Profile Picture</label>
              <input type="file" id="profilePictureInput" accept="image/*" onchange="previewProfilePicture(event)">
              <div id="profilePicturePreview" style="margin-top: 10px;"></div>
            </div>
            <div class="settings-item">
              <button class="btn-profile btn-primary" style="margin-top: 8px;" onclick="saveProfilePicture(event)">Save Profile Picture</button>
            </div>
          </div>

          <div class="settings-group">
            <h3>Change Password / Reset Password</h3>
            <div class="settings-item">
              <label>Old Password</label>
              <input type="password" placeholder="Enter old password">
            </div>
            <div class="settings-item">
              <label>New Password</label>
              <input type="password" placeholder="Enter new password">
            </div>
            <div class="settings-item">
              <button class="btn-profile btn-primary" style="margin-top: 8px;">Change Password</button>
            </div>
          </div>

          <div class="settings-group">
            <h3>Manage Devices</h3>
            <div class="settings-item">
              <label>See where the account is logged in</label>
              <button class="btn-profile btn-secondary" style="margin-top: 8px;">View Devices</button>
            </div>
          </div>

          <div class="settings-group">
            <h3>Logout Option</h3>
            <div class="settings-item">
              <label>Sign out from this device</label>
              <button class="btn-profile btn-danger" style="margin-top: 8px;">Logout</button>
            </div>
          </div>

          <div class="settings-group">
            <h3>Delete Account</h3>
            <div class="settings-item">
              <label>Permanently remove your account</label>
              <button class="btn-profile btn-danger" style="margin-top: 8px;">Delete Account</button>
            </div>
          </div>
        </div>

        <!-- Reading Preferences Section -->
        <div class="settings-section" id="reading-section">
          <h2>📖 2. Reading Preferences</h2>
          <p>Customize how you read and interact with books.</p>
          
          <div class="settings-group">
            <h3>Default Font Size</h3>
            <div class="settings-item">
              <label>Select default font size for reading</label>
              <select>
                <option>Small</option>
                <option selected>Medium</option>
                <option>Large</option>
                <option>Extra Large</option>
              </select>
            </div>
          </div>

          <div class="settings-group">
            <h3>Font Style / Type</h3>
            <div class="settings-item">
              <label>Choose your preferred font</label>
              <select>
                <option selected>Serif</option>
                <option>Sans-serif</option>
                <option>Monospace</option>
              </select>
            </div>
          </div>

          <div class="settings-group">
            <h3>Reading Mode</h3>
            <div class="settings-item">
              <label>
                <input type="radio" name="readingMode" checked> Single Page
              </label>
            </div>
            <div class="settings-item">
              <label>
                <input type="radio" name="readingMode"> Scroll Mode
              </label>
            </div>
            <div class="settings-item">
              <label>
                <input type="radio" name="readingMode"> Two-Page Spread
              </label>
            </div>
          </div>

          <div class="settings-group">
            <h3>Auto-Bookmark</h3>
            <div class="settings-item">
              <label>
                <input type="checkbox" checked> Automatically save reading progress
              </label>
            </div>
          </div>

          <div class="settings-group">
            <h3>Highlight Color</h3>
            <div class="settings-item">
              <label>Default color for text highlights</label>
              <input type="color" value="#ffff00">
            </div>
          </div>
        </div>

        <!-- Display & Theme Section -->
        <div class="settings-section" id="display-section">
          <h2>🎨 3. Display & Theme</h2>
          <p>Personalize the appearance of the app.</p>
          
          <div class="settings-group">
            <h3>Theme Mode</h3>
            <div class="settings-item">
              <label>
                <input type="radio" name="theme" checked> Light Mode
              </label>
            </div>
            <div class="settings-item">
              <label>
                <input type="radio" name="theme"> Dark Mode
              </label>
            </div>
            <div class="settings-item">
              <label>
                <input type="radio" name="theme"> Auto (System Default)
              </label>
            </div>
          </div>

          <div class="settings-group">
            <h3>Background Color</h3>
            <div class="settings-item">
              <label>Reading background color</label>
              <input type="color" value="#ffffff">
            </div>
          </div>

          <div class="settings-group">
            <h3>Text Color</h3>
            <div class="settings-item">
              <label>Default text color</label>
              <input type="color" value="#000000">
            </div>
          </div>

          <div class="settings-group">
            <h3>Animations</h3>
            <div class="settings-item">
              <label>
                <input type="checkbox" checked> Enable page turn animations
              </label>
            </div>
          </div>

          <div class="settings-group">
            <h3>Sidebar Position</h3>
            <div class="settings-item">
              <label>
                <input type="radio" name="sidebar" checked> Left
              </label>
            </div>
            <div class="settings-item">
              <label>
                <input type="radio" name="sidebar"> Right
              </label>
            </div>
          </div>
        </div>

        <!-- Notifications & Privacy Section -->
        <div class="settings-section" id="notifications-section">
          <h2>🔔 4. Notifications & Privacy</h2>
          <p>Control notifications and privacy settings.</p>
          
          <div class="settings-group">
            <h3>Email Notifications</h3>
            <div class="settings-item">
              <label>
                <input type="checkbox" checked> New book releases
              </label>
            </div>
            <div class="settings-item">
              <label>
                <input type="checkbox"> Reading reminders
              </label>
            </div>
            <div class="settings-item">
              <label>
                <input type="checkbox" checked> Recommendations
              </label>
            </div>
          </div>

          <div class="settings-group">
            <h3>Push Notifications</h3>
            <div class="settings-item">
              <label>
                <input type="checkbox"> Enable push notifications
              </label>
            </div>
          </div>

          <div class="settings-group">
            <h3>Reading Activity Visibility</h3>
            <div class="settings-item">
              <label>
                <input type="radio" name="privacy" checked> Public
              </label>
            </div>
            <div class="settings-item">
              <label>
                <input type="radio" name="privacy"> Friends Only
              </label>
            </div>
            <div class="settings-item">
              <label>
                <input type="radio" name="privacy"> Private
              </label>
            </div>
          </div>

          <div class="settings-group">
            <h3>Data Collection</h3>
            <div class="settings-item">
              <label>
                <input type="checkbox"> Allow analytics
              </label>
            </div>
            <div class="settings-item">
              <label>
                <input type="checkbox" checked> Improve recommendations
              </label>
            </div>
          </div>

          <div class="settings-group">
            <h3>Blocked Users</h3>
            <div class="settings-item">
              <label>Manage blocked users list</label>
              <button class="btn-profile btn-secondary" style="margin-top: 8px;">Manage Blocked List</button>
            </div>
          </div>
        </div>

        <!-- App / System Settings Section -->
        <div class="settings-section" id="system-section">
          <h2>⚙️ 5. App / System Settings</h2>
          <p>Configure app behavior and system preferences.</p>
          
          <div class="settings-group">
            <h3>Language</h3>
            <div class="settings-item">
              <label>Select app language</label>
              <select>
                <option selected>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>

          <div class="settings-group">
            <h3>Download Quality</h3>
            <div class="settings-item">
              <label>
                <input type="radio" name="quality"> Standard
              </label>
            </div>
            <div class="settings-item">
              <label>
                <input type="radio" name="quality" checked> High
              </label>
            </div>
            <div class="settings-item">
              <label>
                <input type="radio" name="quality"> Original
              </label>
            </div>
          </div>

          <div class="settings-group">
            <h3>Storage</h3>
            <div class="settings-item">
              <label>Downloaded books storage location</label>
              <button class="btn-profile btn-secondary" style="margin-top: 8px;">Choose Location</button>
            </div>
            <div class="settings-item">
              <label>Clear cache</label>
              <button class="btn-profile btn-secondary" style="margin-top: 8px;">Clear Cache</button>
            </div>
          </div>

          <div class="settings-group">
            <h3>Auto-Update</h3>
            <div class="settings-item">
              <label>
                <input type="checkbox" checked> Automatically update app
              </label>
            </div>
          </div>

          <div class="settings-group">
            <h3>Accessibility</h3>
            <div class="settings-item">
              <label>
                <input type="checkbox"> High contrast mode
              </label>
            </div>
            <div class="settings-item">
              <label>
                <input type="checkbox"> Screen reader support
              </label>
            </div>
          </div>

          <div class="settings-group">
            <h3>About</h3>
            <div class="settings-item">
              <label>App Version: 1.0.0</label>
              <button class="btn-profile btn-secondary" style="margin-top: 8px;">Check for Updates</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  const modal = document.getElementById('mainSettingsModal');
  const container = modal ? modal.querySelector('.settings-container') : null;
  
  if (modal && event.target === modal && container && !container.contains(event.target)) {
    closeSettingsModal();
  }
});

// Profile Picture Functions
let selectedProfilePicture = null;

function previewProfilePicture(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file');
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB');
    return;
  }
  
  selectedProfilePicture = file;
  
  // Show preview
  const reader = new FileReader();
  reader.onload = function(e) {
    const previewDiv = document.getElementById('profilePicturePreview');
    previewDiv.innerHTML = `
      <img src="${e.target.result}" alt="Profile Preview" 
           style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 2px solid #4a90e2;">
    `;
  };
  reader.readAsDataURL(file);
}

async function saveProfilePicture(event) {
  if (!selectedProfilePicture) {
    alert('Please select a profile picture first');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('profilePicture', selectedProfilePicture);
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }
    
    // Show loading state
    const saveBtn = event?.target || document.querySelector('button[onclick*="saveProfilePicture"]');
    const originalText = saveBtn?.textContent || 'Save Profile Picture';
    if (saveBtn) {
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;
    }
    
    const response = await fetch('http://localhost:5000/api/user/profile-picture', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Server returned non-JSON response:', text);
      throw new Error('Server error: Unable to upload profile picture. Please make sure the backend server is running.');
    }
    
    if (response.ok) {
      alert('Profile picture updated successfully!');
      
      // Update all avatar displays on the page
      const userAvatars = document.querySelectorAll('#userAvatar, .user-avatar, #navUserAvatar');
      userAvatars.forEach(avatar => {
        if (data.profilePicture) {
          avatar.innerHTML = `<img src="http://localhost:5000${data.profilePicture}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        }
      });
      
      // Reset file input
      document.getElementById('profilePictureInput').value = '';
      document.getElementById('profilePicturePreview').innerHTML = '';
      selectedProfilePicture = null;
    } else {
      alert(data.message || 'Failed to update profile picture');
    }
    
    if (saveBtn) {
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    }
    
  } catch (error) {
    console.error('Error updating profile picture:', error);
    alert(error.message || 'An error occurred while updating profile picture. Please make sure the backend server is running on http://localhost:5000');
    const saveBtn = event?.target || document.querySelector('button[onclick*="saveProfilePicture"]');
    if (saveBtn) {
      saveBtn.textContent = 'Save Profile Picture';
      saveBtn.disabled = false;
    }
  }
}

// Load user profile data and check name change eligibility
async function loadUserProfileData() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const response = await fetch('http://localhost:5000/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      
      // Populate name input with current name
      const nameInput = document.getElementById('changeNameInput');
      if (nameInput && userData.profile && userData.profile.name) {
        nameInput.value = userData.profile.name;
      }
      
      // Check if user can change name
      const statusElement = document.getElementById('nameChangeStatus');
      if (statusElement && userData.profile && userData.profile.lastNameChange) {
        const lastChange = new Date(userData.profile.lastNameChange);
        const daysSinceChange = Math.floor((Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceChange < 30) {
          const daysRemaining = 30 - daysSinceChange;
          statusElement.textContent = `⚠️ You can change your name again in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
          statusElement.style.color = '#f59e0b';
        } else {
          statusElement.textContent = '✅ You can change your name now';
          statusElement.style.color = '#10b981';
        }
      } else if (statusElement) {
        statusElement.textContent = '✅ You can change your name now';
        statusElement.style.color = '#10b981';
      }
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
}

// Change user name with 1-month restriction
async function changeUserName(event) {
  const nameInput = document.getElementById('changeNameInput');
  const newName = nameInput?.value?.trim();
  
  if (!newName) {
    alert('Please enter a name');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }
    
    // Show loading state
    const saveBtn = event?.target || document.querySelector('button[onclick*="changeUserName"]');
    const originalText = saveBtn?.textContent || 'Update Name';
    if (saveBtn) {
      saveBtn.textContent = 'Updating...';
      saveBtn.disabled = true;
    }
    
    const response = await fetch('http://localhost:5000/api/user/change-name', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newName })
    });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, likely an error page
      const text = await response.text();
      console.error('Server returned non-JSON response:', text);
      throw new Error('Server error: Unable to change name. Please make sure the backend server is running.');
    }
    
    if (response.ok) {
      alert('✅ Name updated successfully!');
      
      // Update status message
      const statusElement = document.getElementById('nameChangeStatus');
      if (statusElement) {
        statusElement.textContent = '⚠️ You can change your name again in 30 days';
        statusElement.style.color = '#f59e0b';
      }
      
      // Update displayed name in header/navbar if exists
      const userNameElements = document.querySelectorAll('.user-name, #userName');
      userNameElements.forEach(elem => {
        elem.textContent = newName;
      });
      
    } else {
      // Show error message (including days remaining if applicable)
      alert(data.message || 'Failed to update name');
      
      // If there's a restriction, update the status
      if (data.daysRemaining) {
        const statusElement = document.getElementById('nameChangeStatus');
        if (statusElement) {
          statusElement.textContent = `⚠️ You can change your name again in ${data.daysRemaining} day${data.daysRemaining !== 1 ? 's' : ''}`;
          statusElement.style.color = '#f59e0b';
        }
      }
    }
    
    if (saveBtn) {
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    }
    
  } catch (error) {
    console.error('Error changing name:', error);
    alert(error.message || 'An error occurred while updating name. Please make sure the backend server is running on http://localhost:5000');
    const saveBtn = event?.target || document.querySelector('button[onclick*="changeUserName"]');
    if (saveBtn) {
      saveBtn.textContent = 'Update Name';
      saveBtn.disabled = false;
    }
  }
}

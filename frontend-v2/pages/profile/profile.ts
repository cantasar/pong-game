import { getApiUrl, API_CONFIG } from '../../config.js';

export async function init() {
  console.log('Profile page loaded');
  
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    alert('Please login first!');
    router.navigate('login');
    return;
  }

  try {
    const userNameElement = document.getElementById('userName');
    if (userNameElement) userNameElement.textContent = 'Loading...';

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const cachedUserData = JSON.parse(storedUser);
      updateProfileUI(cachedUserData);
      console.log('Showing cached user data for quick loading');
    }

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.USER.ME), {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        alert('Session expired. Please login again.');
        router.navigate('login');
        return;
      }
      throw new Error('Failed to fetch user data');
    }

    const freshUserData = await response.json();
    console.log('Fresh user data from API:', freshUserData);
    
    if (!storedUser || JSON.stringify(freshUserData) !== storedUser) {
      localStorage.setItem('user', JSON.stringify(freshUserData));
      updateProfileUI(freshUserData);
      console.log('Updated with fresh data from API');
    } else {
      console.log('Data unchanged, no UI update needed');
    }
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    alert('Error loading profile data');
  }

  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn?.addEventListener('click', handleLogout);
}

function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  alert('Logged out successfully!');
  router.navigate('login');
}

function updateProfileUI(userData: any) {
  console.log('Updating UI with user data:', userData);
  
  const user = userData.user || userData;
  console.log('Actual user object:', user);

  const userNameElement = document.getElementById('userName');
  if (userNameElement) {
    const displayName = user.username || user.name || user.email || 'Unknown User';
    userNameElement.textContent = displayName;
    console.log('Updated username to:', displayName);
  } else {
    console.error('userName element not found');
  }

  const userInitialsElement = document.getElementById('userInitials');
  if (userInitialsElement) {
    const displayName = user.username || user.name || user.email || 'U';
    userInitialsElement.textContent = displayName.charAt(0).toUpperCase();
  }

  const userWinsElement = document.getElementById('userWins');
  if (userWinsElement) {
    userWinsElement.textContent = (user.wins || 0).toString();
  }

  const userLossesElement = document.getElementById('userLosses');
  if (userLossesElement) {
    userLossesElement.textContent = (user.losses || 0).toString();
  }

}

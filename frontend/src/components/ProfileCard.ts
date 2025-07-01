import { getFriends, clearToken, sendFriendRequest, getFriendRequests, acceptOrRejectFriendRequest, getUserByUsername } from '../api';

export function ProfileCard(username: string = 'Username', onLogout?: () => void, onFriendSelect?: (friend: any) => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 flex flex-col h-full';

  // Profile section - fixed height
  const profileSection = document.createElement('div');
  profileSection.className = 'p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50';

  // Profile header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between mb-3';

  const title = document.createElement('h2');
  title.className = 'text-lg font-bold text-gray-800';
  title.textContent = 'Profile';
  header.appendChild(title);

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors shadow-sm';
  logoutBtn.textContent = 'Logout';
  logoutBtn.onclick = () => {
    clearToken();
    if (onLogout) onLogout();
  };
  header.appendChild(logoutBtn);

  profileSection.appendChild(header);

  // User info - compact
  const userInfo = document.createElement('div');
  userInfo.className = 'flex items-center gap-3 mb-3';

  const avatar = document.createElement('img');
  avatar.src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;
  avatar.className = 'w-12 h-12 rounded-full border-2 border-white shadow-sm';
  avatar.alt = 'Avatar';
  userInfo.appendChild(avatar);

  const userDetails = document.createElement('div');
  const usernameEl = document.createElement('p');
  usernameEl.className = 'text-base font-semibold text-gray-800';
  usernameEl.textContent = username;
  userDetails.appendChild(usernameEl);

  const status = document.createElement('p');
  status.className = 'text-sm text-green-600 font-medium flex items-center gap-1';
  status.innerHTML = '<div class="w-2 h-2 bg-green-500 rounded-full"></div> Online';
  userDetails.appendChild(status);

  userInfo.appendChild(userDetails);
  profileSection.appendChild(userInfo);

  // Stats - compact
  const stats = document.createElement('div');
  stats.className = 'grid grid-cols-2 gap-2';

  const winsCard = document.createElement('div');
  winsCard.className = 'bg-green-100 rounded-lg p-2 text-center border border-green-200';
  winsCard.innerHTML = `
    <div class="text-base font-bold text-green-600">12</div>
    <div class="text-xs text-green-700">Wins</div>
  `;
  stats.appendChild(winsCard);

  const lossesCard = document.createElement('div');
  lossesCard.className = 'bg-red-100 rounded-lg p-2 text-center border border-red-200';
  lossesCard.innerHTML = `
    <div class="text-base font-bold text-red-600">8</div>
    <div class="text-xs text-red-700">Losses</div>
  `;
  stats.appendChild(lossesCard);

  profileSection.appendChild(stats);
  card.appendChild(profileSection);

  // Main content area with tabs
  const mainSection = document.createElement('div');
  mainSection.className = 'flex flex-col flex-1 p-4';

  // Tab buttons
  const tabButtons = document.createElement('div');
  tabButtons.className = 'flex gap-2 mb-4';

  const friendsTabBtn = document.createElement('button');
  friendsTabBtn.className = 'px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors';
  friendsTabBtn.textContent = 'Friends';

  const requestsTabBtn = document.createElement('button');
  requestsTabBtn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors hover:bg-gray-300';
  requestsTabBtn.textContent = 'Requests';

  const addFriendTabBtn = document.createElement('button');
  addFriendTabBtn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors hover:bg-gray-300';
  addFriendTabBtn.textContent = 'Add Friend';

  tabButtons.appendChild(friendsTabBtn);
  tabButtons.appendChild(requestsTabBtn);
  tabButtons.appendChild(addFriendTabBtn);
  mainSection.appendChild(tabButtons);

  // Content area
  const contentArea = document.createElement('div');
  contentArea.className = 'flex-1 overflow-y-auto';
  mainSection.appendChild(contentArea);

  // Tab switching logic
  let activeTab = 'friends';

  const switchTab = (tab: string) => {
    activeTab = tab;
    
    // Update button styles
    [friendsTabBtn, requestsTabBtn, addFriendTabBtn].forEach(btn => {
      btn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors hover:bg-gray-300';
    });

    if (activeTab === 'friends') {
      friendsTabBtn.className = 'px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors';
      loadFriends();
    } else if (activeTab === 'requests') {
      requestsTabBtn.className = 'px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors';
      loadFriendRequests();
    } else if (activeTab === 'addFriend') {
      addFriendTabBtn.className = 'px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors';
      showAddFriendForm();
    }
  };

  friendsTabBtn.onclick = () => switchTab('friends');
  requestsTabBtn.onclick = () => switchTab('requests');
  addFriendTabBtn.onclick = () => switchTab('addFriend');

  card.appendChild(mainSection);

  // Load friends function
  const loadFriends = async () => {
    contentArea.innerHTML = '<div class="text-gray-500 text-center py-4 text-sm">Loading friends...</div>';
    
    try {
      const response = await getFriends();
      const friends = response?.friendsList || [];
      
      if (friends.length > 0) {
        contentArea.innerHTML = '';
        friends.forEach((friend: any) => {
          const friendItem = createFriendItem(friend, onFriendSelect);
          contentArea.appendChild(friendItem);
        });
      } else {
        contentArea.innerHTML = '<div class="text-gray-400 text-center py-4 text-sm">No friends yet.</div>';
      }
    } catch (error) {
      contentArea.innerHTML = '<div class="text-red-500 text-center py-4 text-sm">Failed to load friends.</div>';
    }
  };

  // Load friend requests function
  const loadFriendRequests = async () => {
    contentArea.innerHTML = '<div class="text-gray-500 text-center py-4 text-sm">Loading requests...</div>';
    
    try {
      const response = await getFriendRequests();
      const requests = response?.incomingRequests || [];
      
      if (requests.length > 0) {
        contentArea.innerHTML = '';
        requests.forEach((request: any) => {
          const requestItem = createRequestItem(request, loadFriendRequests);
          contentArea.appendChild(requestItem);
        });
      } else {
        contentArea.innerHTML = '<div class="text-gray-400 text-center py-4 text-sm">No pending requests.</div>';
      }
    } catch (error) {
      contentArea.innerHTML = '<div class="text-red-500 text-center py-4 text-sm">Failed to load requests.</div>';
    }
  };

  // Show add friend form
  const showAddFriendForm = () => {
    contentArea.innerHTML = `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Friend's Username</label>
          <input type="text" id="friendInput" placeholder="Enter username" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>
        <button id="sendRequestBtn" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Send Friend Request
        </button>
        <div id="addFriendResult" class="text-sm text-center"></div>
      </div>
    `;

    const input = contentArea.querySelector('#friendInput') as HTMLInputElement;
    const button = contentArea.querySelector('#sendRequestBtn') as HTMLButtonElement;
    const result = contentArea.querySelector('#addFriendResult') as HTMLElement;

    button.onclick = async () => {
      const usernameToFind = input.value.trim();
      if (!usernameToFind) {
        result.className = 'text-sm text-center text-red-500';
        result.textContent = 'Please enter a username';
        return;
      }

      // Kendine arkadaşlık isteği gönderme kontrolü
      if (usernameToFind.toLowerCase() === username.toLowerCase()) {
        result.className = 'text-sm text-center text-red-500';
        result.textContent = 'You cannot send a friend request to yourself';
        return;
      }

      button.disabled = true;
      button.textContent = 'Searching...';
      result.textContent = '';

      try {
        // Kullanıcıyı ara
        console.log('Searching for user:', usernameToFind);
        const response = await getUserByUsername(usernameToFind);
        console.log('Search response:', response);
        
        // Response yapısını API'ye göre düzenle
        let user = null;
        if (response?.users && Array.isArray(response.users) && response.users.length > 0) {
          user = response.users[0];
        } else if (Array.isArray(response) && response.length > 0) {
          user = response[0];
        } else if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          user = response.data[0];
        } else if (response?.id) {
          user = response;
        }
        
        if (!user || !user.id) {
          result.className = 'text-sm text-center text-red-500';
          result.textContent = 'User not found';
          return;
        }

        button.textContent = 'Sending Request...';

        // Arkadaşlık isteği gönder
        console.log('Sending friend request to user ID:', user.id);
        const friendRequestResponse = await sendFriendRequest(user.id);
        console.log('Friend request response:', friendRequestResponse);
        
        result.className = 'text-sm text-center text-green-500';
        result.textContent = `Friend request sent to ${user.username || user.name || usernameToFind}!`;
        input.value = '';
      } catch (error: any) {
        console.error('Friend request error:', error);
        result.className = 'text-sm text-center text-red-500';
        
        // Daha spesifik hata mesajları
        if (error?.message) {
          if (error.message.includes('already friends')) {
            result.textContent = 'You are already friends with this user';
          } else if (error.message.includes('already sent')) {
            result.textContent = 'Friend request already sent to this user';
          } else if (error.message.includes('not found')) {
            result.textContent = 'User not found';
          } else {
            result.textContent = error.message;
          }
        } else if (error?.error) {
          result.textContent = error.error;
        } else if (typeof error === 'string') {
          result.textContent = error;
        } else {
          result.textContent = 'Failed to send friend request. Please try again.';
        }
      } finally {
        button.disabled = false;
        button.textContent = 'Send Friend Request';
      }
    };
  };

  // Initialize with friends tab
  loadFriends();

  return card;
}

// Create friend item component
function createFriendItem(friend: any, onFriendSelect?: (friend: any) => void): HTMLElement {
  const friendItem = document.createElement('div');
  friendItem.className = 'flex items-center gap-3 p-3 rounded-lg hover:bg-white/80 transition-all cursor-pointer border border-transparent hover:border-blue-200 hover:shadow-sm group';
  
  friendItem.onclick = () => {
    if (onFriendSelect) {
      onFriendSelect(friend);
    }
  };
  
  const avatar = document.createElement('img');
  avatar.src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(friend.username || friend.name)}`;
  avatar.className = 'w-10 h-10 rounded-full border-2 border-white shadow-sm';
  avatar.alt = friend.username || friend.name;
  
  const avatarContainer = document.createElement('div');
  avatarContainer.className = 'relative';
  avatarContainer.appendChild(avatar);
  
  // Status indicator
  const statusDot = document.createElement('div');
  statusDot.className = 'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-green-400';
  avatarContainer.appendChild(statusDot);
  
  const nameAndStatus = document.createElement('div');
  nameAndStatus.className = 'flex-1 min-w-0';
  
  const name = document.createElement('div');
  name.className = 'text-sm font-medium text-gray-800 truncate';
  name.textContent = friend.username || friend.name;
  nameAndStatus.appendChild(name);
  
  const activity = document.createElement('div');
  activity.className = 'text-xs text-gray-500 truncate';
  activity.textContent = 'Online';
  nameAndStatus.appendChild(activity);
  
  // Message button
  const messageBtn = document.createElement('button');
  messageBtn.className = 'w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100';
  messageBtn.innerHTML = `
    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.681L3 21l2.681-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
    </svg>
  `;
  
  messageBtn.onclick = (e) => {
    e.stopPropagation();
    if (onFriendSelect) {
      onFriendSelect(friend);
    }
  };
  
  friendItem.appendChild(avatarContainer);
  friendItem.appendChild(nameAndStatus);
  friendItem.appendChild(messageBtn);
  
  return friendItem;
}

// Create friend request item component
function createRequestItem(request: any, onUpdate: () => void): HTMLElement {
  const requestItem = document.createElement('div');
  requestItem.className = 'flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50';
  
  const requester = request.requester || request.sender;
  const requesterUsername = requester?.username || 'Unknown User';
  
  const avatar = document.createElement('img');
  avatar.src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(requesterUsername)}`;
  avatar.className = 'w-10 h-10 rounded-full border-2 border-white shadow-sm';
  avatar.alt = requesterUsername;
  
  const userInfo = document.createElement('div');
  userInfo.className = 'flex-1 min-w-0';
  
  const name = document.createElement('div');
  name.className = 'text-sm font-medium text-gray-800';
  name.textContent = requesterUsername;
  userInfo.appendChild(name);
  
  const timeAgo = document.createElement('div');
  timeAgo.className = 'text-xs text-gray-500';
  timeAgo.textContent = 'Friend request';
  userInfo.appendChild(timeAgo);
  
  const buttons = document.createElement('div');
  buttons.className = 'flex gap-2';
  
  const acceptBtn = document.createElement('button');
  acceptBtn.className = 'w-8 h-8 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-colors';
  acceptBtn.innerHTML = `
    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
  `;
  
  const rejectBtn = document.createElement('button');
  rejectBtn.className = 'w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors';
  rejectBtn.innerHTML = `
    <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  `;
  
  acceptBtn.onclick = async () => {
    try {
      await acceptOrRejectFriendRequest(request.id, "accept");
      onUpdate();
    } catch (error) {
      // Handle error silently or show user feedback
    }
  };
  
  rejectBtn.onclick = async () => {
    try {
      await acceptOrRejectFriendRequest(request.id, "reject");
      onUpdate();
    } catch (error) {
      // Handle error silently or show user feedback
    }
  };
  
  buttons.appendChild(acceptBtn);
  buttons.appendChild(rejectBtn);
  
  requestItem.appendChild(avatar);
  requestItem.appendChild(userInfo);
  requestItem.appendChild(buttons);
  
  return requestItem;
}
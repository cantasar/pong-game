import { getFriends, clearToken, sendFriendRequest, getFriendRequests, acceptOrRejectFriendRequest, getUserByUsername } from '../api';

export function ProfileCard(
  username: string = 'Username', 
  onLogout?: () => void, 
  onFriendSelect?: (friend: any) => void
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 flex flex-col h-full';

  card.innerHTML = `
    <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-bold text-gray-800">Profile</h2>
        <button id="logout-btn" class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors">
          Logout
        </button>
      </div>
      
      <div class="flex items-center gap-3 mb-3">
        <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}" 
             class="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="Avatar" />
        <div>
          <div class="text-base font-semibold text-gray-800">${username}</div>
          <div class="text-sm text-green-600 flex items-center gap-1">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <div class="text-xs text-gray-500">Online</div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-green-100 rounded-lg p-2 text-center border border-green-200">
          <div class="text-base font-bold text-green-600">12</div>
          <div class="text-xs text-green-700">Wins</div>
        </div>
        <div class="bg-red-100 rounded-lg p-2 text-center border border-red-200">
          <div class="text-base font-bold text-red-600">8</div>
          <div class="text-xs text-red-700">Losses</div>
        </div>
      </div>
    </div>

    <div class="flex flex-col flex-1 p-4">
      <div class="flex gap-2 mb-4">
        <button id="friends-tab" class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          Friends
        </button>
        
        <button id="requests-tab" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors hover:bg-gray-300">
          Requests
        </button>
        
        <button id="add-tab" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors hover:bg-gray-300">
          Add Friend
        </button>
      </div>
      
      <div id="content-area" class="flex-1 overflow-y-auto">
        <div class="text-gray-500 text-center py-4 text-sm">Loading friends...</div>
      </div>
    </div>
  `;

  // Event listeners
  const logoutBtn = card.querySelector('#logout-btn');
  logoutBtn?.addEventListener('click', () => {
    clearToken();
    if (onLogout) onLogout();
  });

  const friendsTab = card.querySelector('#friends-tab');
  const requestsTab = card.querySelector('#requests-tab');
  const addTab = card.querySelector('#add-tab');
  const contentArea = card.querySelector('#content-area') as HTMLElement;

  // Tab switching
  function setActiveTab(activeTab: Element) {
    [friendsTab, requestsTab, addTab].forEach(tab => {
      tab?.classList.remove('bg-blue-500', 'text-white');
      tab?.classList.add('bg-gray-200', 'text-gray-700');
    });
    activeTab.classList.remove('bg-gray-200', 'text-gray-700');
    activeTab.classList.add('bg-blue-500', 'text-white');
  }

  // Load friends
  async function loadFriends() {
    contentArea.innerHTML = '<div class="text-gray-500 text-center py-4 text-sm">Loading friends...</div>';
    try {
      const response = await getFriends();
      const friends = response?.friendsList || [];
      
      if (friends.length > 0) {
        contentArea.innerHTML = '';
        friends.forEach((friend: any) => {
          const friendDiv = document.createElement('div');
          friendDiv.className = 'flex items-center gap-3 p-3 rounded-lg hover:bg-white/80 transition-all cursor-pointer border border-transparent hover:border-blue-200';
          friendDiv.innerHTML = `
            <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(friend.username)}" 
                 class="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="${friend.username}" />
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-800">${friend.username}</div>
              <div class="text-xs text-gray-500">Online</div>
            </div>
            <div>
              <button class="text-xs text-gray-500 hover:underline">Message</button>
            </div>
          `;
          friendDiv.addEventListener('click', () => {
            if (onFriendSelect) onFriendSelect(friend);
          });
          contentArea.appendChild(friendDiv);
        });
      } else {
        contentArea.innerHTML = '<div class="text-gray-400 text-center py-4 text-sm">No friends yet.</div>';
      }
    } catch {
      contentArea.innerHTML = '<div class="text-red-500 text-center py-4 text-sm">Failed to load friends.</div>';
    }
  }

  // Load friend requests
  async function loadRequests() {
    contentArea.innerHTML = '<div class="text-gray-500 text-center py-4 text-sm">Loading requests...</div>';
    try {
      const response = await getFriendRequests();
      const requests = response?.incomingRequests || [];
      
      if (requests.length > 0) {
        contentArea.innerHTML = '';
        requests.forEach((request: any) => {
          const requestDiv = document.createElement('div');
          requestDiv.className = 'bg-white rounded-lg p-3 border border-gray-200 shadow-sm mb-2';
          requestDiv.innerHTML = `
            <div class="flex items-center gap-3 mb-2">
              <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(request.fromUser.username)}" 
                   class="w-8 h-8 rounded-full border border-gray-300" alt="${request.fromUser.username}" />
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-800">${request.fromUser.username}</div>
                <div class="text-xs text-gray-500">wants to be friends</div>
              </div>
            </div>
            <div class="flex gap-2">
              <button class="accept-btn flex-1 bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-xs transition-colors">
                Accept
              </button>
              <button class="reject-btn flex-1 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-xs transition-colors">
                Reject
              </button>
            </div>
          `;
          
          const acceptBtn = requestDiv.querySelector('.accept-btn');
          const rejectBtn = requestDiv.querySelector('.reject-btn');
          
          // istegi kabul et
          acceptBtn?.addEventListener('click', async () => {
            try {
              await acceptOrRejectFriendRequest(request.id, 'accept');
              loadRequests();
            } catch (err: any) {
              alert('Failed to accept request: ' + err.message);
            }
          });
          
          // istegi reddet
          rejectBtn?.addEventListener('click', async () => {
            try {
              await acceptOrRejectFriendRequest(request.id, 'reject');
              loadRequests();
            } catch (err: any) {
              alert('Failed to reject request: ' + err.message);
            }
          });
          
          contentArea.appendChild(requestDiv);
        });
      } else {
        contentArea.innerHTML = '<div class="text-gray-400 text-center py-4 text-sm">No pending requests.</div>';
      }
    } catch {
      contentArea.innerHTML = '<div class="text-red-500 text-center py-4 text-sm">Failed to load requests.</div>';
    }
  }

  // Show add friend form
  function showAddForm() {
    contentArea.innerHTML = `
      <div class="space-y-4">
        <input id="friend-input" type="text" placeholder="Enter username" 
               class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <button id="send-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Send Friend Request
        </button>
        <div id="add-result" class="text-sm text-center"></div>
      </div>
    `;

    const input = contentArea.querySelector('#friend-input') as HTMLInputElement;
    const button = contentArea.querySelector('#send-btn') as HTMLButtonElement;
    const result = contentArea.querySelector('#add-result') as HTMLElement;

    // add button
    button.addEventListener('click', async () => {
      const friendUsername = input.value.trim();
      if (!friendUsername) return;

      button.textContent = 'Sending...';
      result.textContent = '';

      try {
        const user = await getUserByUsername(friendUsername);
        await sendFriendRequest(user.id);
        result.className = 'text-sm text-center text-green-600';
        result.textContent = 'Friend request sent!';
        input.value = '';
      } catch (err: any) {
        result.className = 'text-sm text-center text-red-600';
        result.textContent = err.message || 'Failed to send request';
      } finally {
        button.textContent = 'Send Friend Request';
      }
    });
  }

  // friends menu
  friendsTab?.addEventListener('click', () => {
    setActiveTab(friendsTab);
    loadFriends();
  });

  // requests menu
  requestsTab?.addEventListener('click', () => {
    setActiveTab(requestsTab);
    loadRequests();
  });

  // add friend menu
  addTab?.addEventListener('click', () => {
    setActiveTab(addTab);
    showAddForm();
  });

  // Load friends by default
  loadFriends();

  return card;
}

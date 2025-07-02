import { getFriends, sendFriendRequest, getFriendRequests, acceptOrRejectFriendRequest, getUserByUsername } from '../../lib/friends-api';
import { clearToken } from '../../lib/auth-api';
import { userStatusService } from '../../lib/user-status.service';
import type { UserStatusHandler } from '../../lib/user-status.service';

export function ProfileCard(
  username: string = 'Username',
  onLogout?: () => void,
  onFriendSelect?: (friend: any) => void
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden';

  // State for the current view
  let currentView = 'friends'; // 'friends', 'requests', 'add'
  let statusHandler: UserStatusHandler | null = null;

  function getStatusIndicator(isOnline: boolean) {
    return `<div class="w-3 h-3 ${isOnline ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white"></div>`;
  }

  function renderHeader() {
    return `
      <div class="p-6 border-b border-gray-100 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="5" width="2" height="14" rx="1"/>
                <rect x="19" y="5" width="2" height="14" rx="1"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900 tracking-wide">PONG PLAYER</h2>
          </div>
          <button id="logout-btn" class="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-sm hover:shadow-md">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
        
        <div class="flex flex-col items-center mb-6">
          <div class="relative mb-4">
            <div class="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 p-1">
              <div class="w-full h-full rounded-full overflow-hidden bg-white">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6366f1&color=ffffff&size=72&bold=true" 
                     alt="${username}" class="w-full h-full object-cover" />
              </div>
            </div>
            <div id="user-status" class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
              <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <div class="text-xl font-bold text-gray-900 mb-1">${username}</div>
          <div class="text-sm text-green-600 font-medium flex items-center gap-1">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Online & Ready</span>
          </div>
        </div>
        
        <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="space-y-1">
              <div class="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">12</div>
              <div class="text-xs text-gray-600 uppercase tracking-wide font-medium">Wins</div>
              <div class="w-full bg-gray-200 rounded-full h-1">
                <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-1 rounded-full" style="width: 60%"></div>
              </div>
            </div>
            <div class="space-y-1">
              <div class="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">8</div>
              <div class="text-xs text-gray-600 uppercase tracking-wide font-medium">Losses</div>
              <div class="w-full bg-gray-200 rounded-full h-1">
                <div class="bg-gradient-to-r from-red-500 to-pink-500 h-1 rounded-full" style="width: 40%"></div>
              </div>
            </div>
            <div class="space-y-1">
              <div class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">60%</div>
              <div class="text-xs text-gray-600 uppercase tracking-wide font-medium">Win Rate</div>
              <div class="w-full bg-gray-200 rounded-full h-1">
                <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full" style="width: 60%"></div>
              </div>
            </div>
          </div>
          
          <div class="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span class="font-medium">Rank: Pong Master</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderNavigation() {
    return `
      <div class="px-6 py-4 border-b border-gray-100">
        <div class="flex gap-1 bg-gray-50 rounded-lg p-1">
          <button id="nav-friends" class="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${currentView === 'friends' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}">
            Friends
          </button>
          <button id="nav-requests" class="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${currentView === 'requests' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}">
            Requests
          </button>
          <button id="nav-add" class="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${currentView === 'add' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}">
            Add
          </button>
        </div>
      </div>
    `;
  }

  function renderContent() {
    switch (currentView) {
      case 'friends':
        return `
          <div id="friends-content" class="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            <div class="text-center text-gray-500 text-sm py-8">Loading friends...</div>
          </div>
        `;
      case 'requests':
        return `
          <div id="requests-content" class="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            <div class="text-center text-gray-500 text-sm py-8">Loading requests...</div>
          </div>
        `;
      case 'add':
        return `
          <div id="add-content" class="flex-1 p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Add New Friend</label>
                <div class="space-y-3">
                  <input type="text" id="username-input" placeholder="Enter username" 
                         class="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <button id="send-request-btn" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Send Friend Request
                  </button>
                </div>
                <div id="add-friend-message" class="mt-3 text-sm"></div>
              </div>
            </div>
          </div>
        `;
      default:
        return '';
    }
  }

  function render() {
    card.innerHTML = renderHeader() + renderNavigation() + renderContent();
    attachEventListeners();
    loadCurrentViewData();
  }

  async function loadFriends() {
    const friendsContent = card.querySelector('#friends-content');
    if (!friendsContent) return;

    try {
      const friends = await getFriends();

      if (friends.length === 0) {
        friendsContent.innerHTML = '<div class="text-center text-gray-500 text-sm py-8">No friends yet</div>';
        return;
      }

      // Set up status handler
      if (!statusHandler) {
        statusHandler = {
          onUserStatusChange: (userId: number, isOnline: boolean) => {
            const friendElement = friendsContent.querySelector(`[data-friend-id="${userId}"]`);
            if (friendElement) {
              const statusIndicator = friendElement.querySelector('.status-indicator');
              if (statusIndicator) {
                statusIndicator.innerHTML = getStatusIndicator(isOnline);
              }
              const statusText = friendElement.querySelector('.status-text');
              if (statusText) {
                statusText.textContent = isOnline ? 'online' : 'offline';
              }
            }
          }
        };
        userStatusService.addHandler(statusHandler);
      }

      friendsContent.innerHTML = friends.map((friend: any) => `
        <div class="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group" data-friend-id="${friend.id}">
          <div class="relative">
            <div class="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
              <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(friend.username)}&background=random&color=ffffff&size=40&bold=true" 
                   alt="${friend.username}" class="w-full h-full object-cover" />
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 status-indicator">
              ${getStatusIndicator(friend.status === 'online')}
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-900 text-sm truncate">${friend.username}</div>
            <div class="text-xs text-gray-500 status-text">${friend.status || 'offline'}</div>
          </div>
          <div class="text-gray-400 group-hover:text-gray-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      `).join('');

      // Add click listeners
      friendsContent.querySelectorAll('[data-friend-id]').forEach(element => {
        element.addEventListener('click', () => {
          const friendId = element.getAttribute('data-friend-id');
          const friend = friends.find((f: any) => f.id.toString() === friendId);
          if (friend && onFriendSelect) {
            onFriendSelect(friend);
          }
        });
      });

    } catch (error) {
      console.error('Error loading friends:', error);
      friendsContent.innerHTML = '<div class="text-center text-red-500 text-sm py-4">Error loading friends</div>';
    }
  }

  async function loadRequests() {
    const requestsContent = card.querySelector('#requests-content');
    if (!requestsContent) return;

    try {
      const requests = await getFriendRequests();

      if (requests.length === 0) {
        requestsContent.innerHTML = '<div class="text-center text-gray-500 text-sm py-8">No requests</div>';
        return;
      }

      requestsContent.innerHTML = requests.map((request: any) => `
        <div class="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(request.requester.username)}&background=random&color=ffffff&size=40&bold=true" 
                     alt="${request.requester.username}" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 text-sm truncate">${request.requester.username}</div>
                <div class="text-xs text-gray-500">wants to be friends</div>
              </div>
            </div>
            <div class="flex gap-2">
              <button class="accept-btn w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors" data-request-id="${request.id}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
              <button class="reject-btn w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors" data-request-id="${request.id}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `).join('');

      // Add event listeners
      requestsContent.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const requestId = btn.getAttribute('data-request-id');
          if (requestId) {
            try {
              await acceptOrRejectFriendRequest(parseInt(requestId), 'accept');
              loadRequests();
              if (currentView === 'friends') loadFriends(); // Refresh friends list
            } catch (error) {
              console.error('Error accepting friend request:', error);
            }
          }
        });
      });

      requestsContent.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const requestId = btn.getAttribute('data-request-id');
          if (requestId) {
            try {
              await acceptOrRejectFriendRequest(parseInt(requestId), 'reject');
              loadRequests();
            } catch (error) {
              console.error('Error rejecting friend request:', error);
            }
          }
        });
      });

    } catch (error) {
      console.error('Error loading friend requests:', error);
      requestsContent.innerHTML = '<div class="text-center text-red-500 text-sm py-4">Error loading</div>';
    }
  }

  async function sendFriendRequestByUsername() {
    const usernameInput = card.querySelector('#username-input') as HTMLInputElement;
    const messageDiv = card.querySelector('#add-friend-message') as HTMLElement;
    if (!usernameInput || !messageDiv) return;

    const username = usernameInput.value.trim();
    if (!username) {
      showMessage('Please enter a username', 'error');
      return;
    }

    // Disable button and show loading
    const sendBtn = card.querySelector('#send-request-btn') as HTMLButtonElement;
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';
    }

    try {
      const user = await getUserByUsername(username);
      await sendFriendRequest(user.id);
      showMessage('Friend request sent successfully!', 'success');
      usernameInput.value = '';
    } catch (error: any) {
      showMessage(error.message || 'Error sending friend request', 'error');
    } finally {
      // Re-enable button
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send Friend Request';
      }
    }
  }

  function showMessage(text: string, type: 'success' | 'error') {
    const messageDiv = card.querySelector('#add-friend-message') as HTMLElement;
    if (!messageDiv) return;

    messageDiv.textContent = text;
    messageDiv.className = `mt-2 text-sm ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
    messageDiv.classList.remove('hidden');

    // Auto hide after 3 seconds
    setTimeout(() => {
      messageDiv.classList.add('hidden');
    }, 3000);
  }

  function loadCurrentViewData() {
    switch (currentView) {
      case 'friends':
        loadFriends();
        break;
      case 'requests':
        loadRequests();
        break;
    }
  }

  function attachEventListeners() {
    // Logout button
    const logoutBtn = card.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearToken();
        if (onLogout) onLogout();
      });
    }

    // Navigation buttons
    const navButtons = {
      friends: card.querySelector('#nav-friends'),
      requests: card.querySelector('#nav-requests'),
      add: card.querySelector('#nav-add')
    };

    Object.entries(navButtons).forEach(([view, btn]) => {
      if (btn) {
        btn.addEventListener('click', () => {
          currentView = view;
          render();
        });
      }
    });

    // Send request button
    const sendBtn = card.querySelector('#send-request-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', sendFriendRequestByUsername);
    }

    // Enter key on username input
    const usernameInput = card.querySelector('#username-input');
    if (usernameInput) {
      usernameInput.addEventListener('keypress', (e: any) => {
        if (e.key === 'Enter') {
          sendFriendRequestByUsername();
        }
      });
    }
  }

  // Cleanup function
  const cleanup = () => {
    if (statusHandler) {
      userStatusService.removeHandler(statusHandler);
    }
  };

  window.addEventListener('beforeunload', cleanup);
  (card as any).cleanup = cleanup;

  // Initial render
  render();

  return card;
}

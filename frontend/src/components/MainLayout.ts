import { ProfileCard } from './ProfileCard';
import { GameArea } from './GameArea';
import { Tournament } from './Tournament';
import { GeneralChat } from './GeneralChat';
import { sendMessage, getMessages } from '../api';

export function MainLayout(user: { username: string; id?: number }, onLogout?: () => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'w-full h-screen flex bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden relative';

  // Chat popup state - only one active chat
  let activeChatPopup: HTMLElement | null = null;
  let currentChatFriend: any = null; // Changed to store full friend object

  // Function to load chat messages from API
  const loadChatMessages = async (messagesContainer: HTMLElement, friend: any) => {
    try {
      const receiverId = friend.id || friend.userId; // Use actual friend ID
      const chatMessages = await getMessages(receiverId);
      
      // Clear loading message
      const loadingMsg = messagesContainer.querySelector('.text-center:last-child');
      if (loadingMsg) loadingMsg.remove();
      
      // Add messages to UI
      if (chatMessages && chatMessages.length > 0) {
        chatMessages.forEach((msg: any) => {
          const messageEl = document.createElement('div');
          const isFromCurrentUser = msg.senderId === user.id;
          
          messageEl.className = isFromCurrentUser 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-2xl rounded-br-sm max-w-[80%] ml-auto shadow-md'
            : 'bg-white p-3 rounded-2xl rounded-bl-sm max-w-[80%] shadow-md border border-gray-200';
          
          messageEl.innerHTML = `
            <div class="text-sm ${isFromCurrentUser ? 'text-white' : 'text-gray-800'}">${msg.content}</div>
            <div class="text-xs ${isFromCurrentUser ? 'opacity-70' : 'text-gray-500'} mt-1">
              ${new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          `;
          messagesContainer.appendChild(messageEl);
        });
      } else {
        // No messages yet
        const noMessagesEl = document.createElement('div');
        noMessagesEl.className = 'text-center text-gray-400 text-sm py-4';
        noMessagesEl.textContent = 'No messages yet. Start the conversation!';
        messagesContainer.appendChild(noMessagesEl);
      }
      
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
      const errorEl = document.createElement('div');
      errorEl.className = 'text-center text-red-400 text-sm py-4';
      errorEl.textContent = 'Failed to load messages. Please try again.';
      messagesContainer.appendChild(errorEl);
    }
  };

  // Handle browser back button for chat navigation
  const handlePopState = (event: PopStateEvent) => {
    if (event.state && event.state.type === 'chat') {
      const friend = event.state.friend;
      if (friend && friend.id !== currentChatFriend?.id) {
        openChatPopup(friend, false); // Don't push to history again
      }
    } else if (event.state && event.state.type === 'main') {
      // Close chat when going back to main
      if (activeChatPopup) {
        container.removeChild(activeChatPopup);
        activeChatPopup = null;
        currentChatFriend = null;
      }
    }
  };

  // Add event listener for browser back button
  window.addEventListener('popstate', handlePopState);

  // Sol sidebar - Profil ve Arkadaşlar
  const leftSidebar = document.createElement('div');
  leftSidebar.className = 'w-80 flex flex-col gap-4 p-4 bg-white/50 backdrop-blur-sm border-r border-gray-200';

  // Profil kartı - arkadaş seçme callback'i ile
  const profile = ProfileCard(user.username, onLogout, (friend: any) => {
    openChatPopup(friend);
  });
  leftSidebar.appendChild(profile);

  // Ana içerik alanı - Tam ekran oyun
  const mainContent = document.createElement('div');
  mainContent.className = 'flex-1 flex flex-col p-6';

  const game = GameArea();
  game.className = 'bg-white/80 rounded-2xl shadow-lg flex items-center justify-center flex-1 border border-gray-200 backdrop-blur-sm';
  mainContent.appendChild(game);

  // Sağ sidebar - Turnuva ve Genel Chat
  const rightSidebar = document.createElement('div');
  rightSidebar.className = 'w-80 flex flex-col gap-4 p-4 bg-white/50 backdrop-blur-sm border-l border-gray-200';

  // Turnuva
  const tournament = Tournament();
  tournament.className = 'bg-white/70 rounded-xl shadow-sm p-4 min-h-[250px] border border-gray-200 flex flex-col';
  rightSidebar.appendChild(tournament);

  // Genel chat
  const generalChat = GeneralChat();
  generalChat.className = 'bg-white/70 rounded-xl shadow-sm p-4 min-h-[200px] border border-gray-200 flex flex-col flex-1';
  rightSidebar.appendChild(generalChat);

  // Chat popup creation function
  const openChatPopup = (friend: any, pushToHistory: boolean = true) => {
    // If clicking the same friend, just close the chat
    if (currentChatFriend && currentChatFriend.id === friend.id) {
      // Close the chat
      if (activeChatPopup) {
        container.removeChild(activeChatPopup);
        activeChatPopup = null;
        currentChatFriend = null;
      }
      
      if (pushToHistory) {
        // Go back in history instead of pushing a new state
        history.back();
      }
      return;
    }

    // If there's already a chat open, close it first
    if (activeChatPopup) {
      container.removeChild(activeChatPopup);
      activeChatPopup = null;
      currentChatFriend = null;
    }

    // Add to browser history if not already there
    if (pushToHistory) {
      history.pushState({ type: 'chat', friend: friend }, '', window.location.pathname + window.location.search);
    }

    const friendName = friend.username || friend.name || 'Unknown';

    // Create new chat popup
    const popup = document.createElement('div');
    popup.className = 'fixed bg-white rounded-t-3xl shadow-2xl border border-gray-200/50 transition-all duration-300 ease-out transform translate-y-full backdrop-blur-lg';
    popup.style.width = '380px';
    popup.style.height = '500px';
    popup.style.bottom = '90px';
    popup.style.left = '20px';
    popup.style.zIndex = '1000';
    popup.style.background = 'rgba(255, 255, 255, 0.95)';
    popup.style.backdropFilter = 'blur(20px)';

    // Chat header
    const header = document.createElement('div');
    header.className = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-3xl flex items-center justify-between select-none';
    header.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="relative">
          <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(friendName)}" class="w-10 h-10 rounded-full border-2 border-white/70 shadow-sm" alt="Avatar" />
          <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
        </div>
        <div>
          <span class="font-semibold text-lg">${friendName}</span>
          <div class="text-xs text-blue-100">Online</div>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="minimize-btn hover:bg-white/20 p-2 rounded-lg text-lg transition-colors duration-200">−</button>
        <button class="close-btn hover:bg-white/20 p-2 rounded-lg text-lg transition-colors duration-200">×</button>
      </div>
    `;

    // Chat body
    const chatBody = document.createElement('div');
    chatBody.className = 'flex flex-col h-full';
    
    const messages = document.createElement('div');
    messages.className = 'flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 space-y-3';
    messages.innerHTML = `
      <div class="text-center text-gray-500 text-sm mb-4 flex items-center justify-center gap-2">
        <div class="w-8 h-px bg-gray-300"></div>
        <span>Chat with ${friendName}</span>
        <div class="w-8 h-px bg-gray-300"></div>
      </div>
      <div class="text-center text-gray-400 text-sm">Loading messages...</div>
    `;
    
    // Load messages from API
    loadChatMessages(messages, friend);

    const inputArea = document.createElement('div');
    inputArea.className = 'p-4 border-t border-gray-200 bg-white';
    inputArea.innerHTML = `
      <div class="flex gap-2">
        <input type="text" placeholder="Type a message..." class="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
          Send
        </button>
      </div>
    `;

    chatBody.appendChild(messages);
    chatBody.appendChild(inputArea);
    popup.appendChild(header);
    popup.appendChild(chatBody);

    // Event listeners
    const closeBtn = header.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => {
      container.removeChild(popup);
      activeChatPopup = null;
      currentChatFriend = null;
      
      // Simply go back in browser history
      history.back();
    });

    const minimizeBtn = header.querySelector('.minimize-btn');
    let isMinimized = false;
    minimizeBtn?.addEventListener('click', () => {
      if (isMinimized) {
        popup.style.height = '500px';
        chatBody.style.display = 'flex';
        minimizeBtn.textContent = '−';
        isMinimized = false;
      } else {
        popup.style.height = '60px';
        chatBody.style.display = 'none';
        minimizeBtn.textContent = '□';
        isMinimized = true;
      }
    });

    // Send message functionality
    const input = inputArea.querySelector('input') as HTMLInputElement;
    const sendBtn = inputArea.querySelector('button') as HTMLButtonElement;
    
    const sendMessageFunc = async () => {
      const message = input.value.trim();
      if (message) {
        // Disable input while sending
        input.disabled = true;
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
        
        try {
          // Send message to API using friend's ID
          const receiverId = friend.id || friend.userId;
          await sendMessage(receiverId, message);
          
          // Add message to UI immediately
          const messageEl = document.createElement('div');
          messageEl.className = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-2xl rounded-br-sm max-w-[80%] ml-auto shadow-md';
          messageEl.innerHTML = `
            <div class="text-sm">${message}</div>
            <div class="text-xs opacity-70 mt-1 flex items-center gap-1">
              <span>now</span>
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
            </div>
          `;
          messages.appendChild(messageEl);
          messages.scrollTop = messages.scrollHeight;
          input.value = '';
        } catch (error) {
          // Show user feedback via UI instead of alert
        } finally {
          // Re-enable input
          input.disabled = false;
          sendBtn.disabled = false;
          sendBtn.textContent = 'Send';
        }
      }
    };

    sendBtn.addEventListener('click', sendMessageFunc);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessageFunc();
      }
    });

    activeChatPopup = popup;
    currentChatFriend = friend; // Store the full friend object
    container.appendChild(popup);

    // Animate in
    setTimeout(() => {
      popup.style.transform = 'translateY(0)';
    }, 10);
  };

  container.appendChild(leftSidebar);
  container.appendChild(mainContent);
  container.appendChild(rightSidebar);
  
  // Cleanup function for event listener (if needed)
  const cleanup = () => {
    window.removeEventListener('popstate', handlePopState);
  };
  
  // Store cleanup function on container for potential use
  (container as any).cleanup = cleanup;
  
  return container;
}
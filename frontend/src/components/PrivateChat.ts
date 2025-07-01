export function PrivateChat(selectedFriend?: string, onClose?: () => void): HTMLElement {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
  
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden border border-gray-200';
  
  // Close modal when clicking overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay && onClose) {
      onClose();
    }
  });
  
  // Close modal with ESC key
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };
  
  document.addEventListener('keydown', handleKeyPress);
  
  // Clean up event listener when modal is removed
  overlay.addEventListener('remove', () => {
    document.removeEventListener('keydown', handleKeyPress);
  });
  
  // Prevent modal from closing when clicking inside
  modal.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  if (!selectedFriend) {
    // Empty state when no friend is selected
    modal.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center p-6">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.681L3 21l2.681-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Private Messages</h3>
        <p class="text-sm text-gray-500 mb-4">Select a friend to start chatting</p>
        <button class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors" onclick="(${onClose?.toString() || 'function(){}'})()">
          Close
        </button>
      </div>
    `;
  } else {
    // Chat interface when friend is selected
    modal.innerHTML = `
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(selectedFriend)}" 
               class="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="${selectedFriend}" />
          <div>
            <h3 class="font-semibold text-gray-800">${selectedFriend}</h3>
            <p class="text-sm text-green-600 flex items-center gap-1">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              Online
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors" title="Voice Call">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
          </button>
          <button class="w-8 h-8 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors" title="Video Call">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </button>
          <button class="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors" title="Close Chat" id="close-chat-btn">
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 space-y-3" id="messages-container">
        <div class="text-center text-xs text-gray-400 py-2">
          Start of conversation with ${selectedFriend}
        </div>
        <!-- Messages will appear here -->
      </div>
      
      <div class="p-4 border-t border-gray-200 bg-gray-50/50">
        <div class="flex gap-2">
          <input type="text" 
                 placeholder="Type a message to ${selectedFriend}..." 
                 class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                 id="message-input" />
          <button class="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                  id="send-button">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    // Add close button event listener
    const closeBtn = modal.querySelector('#close-chat-btn');
    if (closeBtn && onClose) {
      closeBtn.addEventListener('click', onClose);
    }
    
    // Add enter key support for message input
    const messageInput = modal.querySelector('#message-input') as HTMLInputElement;
    const sendButton = modal.querySelector('#send-button');
    
    if (messageInput && sendButton) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendButton.dispatchEvent(new Event('click'));
        }
      });
    }
  }
  
  overlay.appendChild(modal);
  return overlay;
}
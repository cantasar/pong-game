export function PrivateChat(selectedFriend?: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col h-full';
  
  if (!selectedFriend) {
    // Arkadaş seçilmediğinde gösterilecek durum
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center p-6">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.681L3 21l2.681-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Özel Mesajlar</h3>
        <p class="text-sm text-gray-500 mb-4">Bir arkadaşınızı seçin ve mesajlaşmaya başlayın</p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          💡 Sol panelden bir arkadaşınıza tıklayarak mesajlaşabilirsiniz
        </div>
      </div>
    `;
    return container;
  }

  // Arkadaş seçildiğinde chat arayüzü
  container.innerHTML = `
    <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(selectedFriend)}" 
             class="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="${selectedFriend}" />
        <div>
          <h3 class="font-semibold text-gray-800">${selectedFriend}</h3>
          <p class="text-sm text-green-600 flex items-center gap-1">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            Çevrimiçi
          </p>
        </div>
        <div class="ml-auto flex gap-2">
          <button class="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors" title="Sesli Arama">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
          </button>
          <button class="w-8 h-8 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors" title="Video Arama">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto p-4 space-y-3" id="messages-container">
      <!-- Mesajlar buraya gelecek -->
    </div>
    
    <div class="p-4 border-t border-gray-200 bg-gray-50/50">
      <div class="flex gap-2">
        <input type="text" 
               placeholder="${selectedFriend} ile mesajlaşın..." 
               class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

  // Mock mesajlar ekle
  const messagesContainer = container.querySelector('#messages-container') as HTMLElement;
  const mockMessages = [
    { sender: selectedFriend, text: 'Merhaba! Nasılsın?', time: '14:32', isOwn: false },
    { sender: 'Ben', text: 'İyiyim, teşekkürler! Sen nasılsın?', time: '14:33', isOwn: true },
    { sender: selectedFriend, text: 'Ben de iyiyim. Oyun oynamak ister misin?', time: '14:35', isOwn: false },
    { sender: 'Ben', text: 'Tabii ki! Hemen başlayalım 🎮', time: '14:36', isOwn: true }
  ];

  mockMessages.forEach(message => {
    const messageEl = createMessageElement(message);
    messagesContainer.appendChild(messageEl);
  });

  // Mesaj gönderme işlevi
  const messageInput = container.querySelector('#message-input') as HTMLInputElement;
  const sendButton = container.querySelector('#send-button') as HTMLButtonElement;

  const sendMessage = () => {
    const text = messageInput.value.trim();
    if (text) {
      const newMessage = {
        sender: 'Ben',
        text: text,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      
      const messageEl = createMessageElement(newMessage);
      messagesContainer.appendChild(messageEl);
      messageInput.value = '';
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // Mock cevap (2 saniye sonra)
      setTimeout(() => {
        const replyMessage = {
          sender: selectedFriend,
          text: getRandomReply(),
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          isOwn: false
        };
        const replyEl = createMessageElement(replyMessage);
        messagesContainer.appendChild(replyEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 2000);
    }
  };

  sendButton.onclick = sendMessage;
  messageInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Scroll to bottom initially
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 100);

  return container;
}

function createMessageElement(message: any): HTMLElement {
  const messageEl = document.createElement('div');
  messageEl.className = `flex ${message.isOwn ? 'justify-end' : 'justify-start'}`;
  
  const bubble = document.createElement('div');
  bubble.className = `max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
    message.isOwn 
      ? 'bg-blue-500 text-white rounded-br-md' 
      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
  } shadow-sm`;
  
  const textEl = document.createElement('div');
  textEl.className = 'text-sm';
  textEl.textContent = message.text;
  bubble.appendChild(textEl);
  
  const timeEl = document.createElement('div');
  timeEl.className = `text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-500'}`;
  timeEl.textContent = message.time;
  bubble.appendChild(timeEl);
  
  if (!message.isOwn) {
    const avatarEl = document.createElement('img');
    avatarEl.src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(message.sender)}`;
    avatarEl.className = 'w-8 h-8 rounded-full mr-2 mt-1';
    avatarEl.alt = message.sender;
    messageEl.appendChild(avatarEl);
  }
  
  messageEl.appendChild(bubble);
  
  return messageEl;
}

function getRandomReply(): string {
  const replies = [
    'Harika! 😊',
    'Anladım, teşekkürler!',
    'Çok iyi fikir!',
    'Tabii ki! 👍',
    'Hemen geliyorum!',
    'Super, başlayalım!',
    'Mükemmel timing! 🎯',
    'Bende hazırım! 🚀'
  ];
  const randomIndex = Math.floor(Math.random() * replies.length);
  return replies[randomIndex] || 'Harika! 😊';
} 
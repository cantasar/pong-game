import { getToken, getCurrentUserId } from './utils.js';
import { sendMessage as sendWebSocketMessage, markAsRead as markAsReadWebSocket } from './websocket.js';

interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    isRead: boolean;
    createdAt: string;
}

let currentDmFriendId: number | null = null;
let currentDmFriendName: string = '';

export function openDmBox(friendId: number, friendName: string): void {
    currentDmFriendId = friendId;
    currentDmFriendName = friendName;
    
    const dmContainer = document.getElementById('dmContainer') as HTMLDivElement;
    const dmFriendName = document.getElementById('dmFriendName') as HTMLSpanElement;
    const selectedFriend = document.getElementById('selectedFriend') as HTMLDivElement;
    
    // UI güncelle
    dmContainer.style.display = 'block';
    dmFriendName.textContent = friendName;
    selectedFriend.textContent = `Chat opened with ${friendName}`;
    
    // Eski mesajları yükle
    loadMessages(friendId);
    
    // Okundu bilgisi gönder
    markMessagesAsRead(friendId);
}

export function closeDmBox(): void {
    const dmContainer = document.getElementById('dmContainer') as HTMLDivElement;
    const selectedFriend = document.getElementById('selectedFriend') as HTMLDivElement;
    
    dmContainer.style.display = 'none';
    selectedFriend.textContent = 'Select a friend to start messaging';
    currentDmFriendId = null;
    currentDmFriendName = '';
}

export async function loadMessages(friendId: number): Promise<void> {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(`http://localhost:3000/chat/history/${friendId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error('Failed to fetch messages');
            return;
        }

        const data = await response.json();
        displayMessages(data.data?.messages || []);
    } catch (error) {
        console.error('Error loading messages:', error);
        const dmMessages = document.getElementById('dmMessages') as HTMLDivElement;
        dmMessages.innerHTML = '<div style="color: red; text-align: center;">Error loading messages</div>';
    }
}

export async function sendDmMessage(content: string): Promise<void> {
    if (!currentDmFriendId || !content.trim()) {
        alert('No friend selected or empty message!');
        return;
    }

    // WebSocket üzerinden mesaj gönder
    sendWebSocketMessage(currentDmFriendId, content.trim());

    // Kendi mesajımızı hemen DM kutusuna ekle
    addMessageToDisplay({
        id: Date.now(), // Geçici ID
        senderId: getCurrentUserId(getToken()),
        receiverId: currentDmFriendId,
        content: content.trim(),
        isRead: false,
        createdAt: new Date().toISOString()
    });

    // Input'u temizle
    const dmMessageText = document.getElementById('dmMessageText') as HTMLInputElement;
    dmMessageText.value = '';
}

async function markMessagesAsRead(friendId: number): Promise<void> {
    // WebSocket üzerinden okundu bilgisi gönder
    markAsReadWebSocket(friendId);
}

function displayMessages(messages: Message[]): void {
    const dmMessages = document.getElementById('dmMessages') as HTMLDivElement;
    const currentUserId = getCurrentUserId(getToken());
    
    if (messages.length === 0) {
        dmMessages.innerHTML = '<div style="text-align: center; color: gray;">No messages yet. Start the conversation!</div>';
        return;
    }
    
    dmMessages.innerHTML = '';
    
    messages.forEach(message => {
        addMessageToDisplay(message);
    });
}

function addMessageToDisplay(message: Message): void {
    const dmMessages = document.getElementById('dmMessages') as HTMLDivElement;
    const currentUserId = getCurrentUserId(getToken());
    
    const messageDiv = document.createElement('div');
    const isMyMessage = message.senderId === currentUserId;
    const time = new Date(message.createdAt).toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.style.cssText = `
        margin: 8px 0;
        padding: 8px;
        border-radius: 8px;
        max-width: 80%;
        ${isMyMessage ? 
            'background: #007bff; color: white; margin-left: auto; text-align: right;' : 
            'background: #e9ecef; color: black; margin-right: auto;'
        }
    `;
    
    messageDiv.innerHTML = `
        <div style="font-size: 14px;">${message.content}</div>
        <div style="font-size: 11px; opacity: 0.7; margin-top: 4px;">
            ${time}${isMyMessage && message.isRead ? ' ✓✓' : ''}
        </div>
    `;
    
    dmMessages.appendChild(messageDiv);
    
    // En alta scroll
    dmMessages.scrollTop = dmMessages.scrollHeight;
}

export function initializeDmBox(): void {
    const closeDmBtn = document.getElementById('closeDm') as HTMLButtonElement;
    const dmSendButton = document.getElementById('dmSendButton') as HTMLButtonElement;
    const dmMessageText = document.getElementById('dmMessageText') as HTMLInputElement;
    
    // Kapat butonu
    closeDmBtn.addEventListener('click', closeDmBox);
    
    // Gönder butonu
    dmSendButton.addEventListener('click', () => {
        sendDmMessage(dmMessageText.value);
    });
    
    // Enter tuşu ile gönder
    dmMessageText.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendDmMessage(dmMessageText.value);
        }
    });
}

// Yeni mesaj geldiğinde DM kutusu açıksa mesajları güncelle
export function handleNewMessage(message: any): void {
    // Eğer type message ise ve DM kutusu açıksa
    if (message.type === 'message' && currentDmFriendId) {
        const senderId = message.from;
        
        // Eğer mesaj şu an açık olan arkadaştan geliyorsa
        if (senderId === currentDmFriendId) {
            // Mesajı direkt olarak DM kutusuna ekle
            addMessageToDisplay({
                id: message.id,
                senderId: message.from,
                receiverId: getCurrentUserId(getToken()), // Ben alıcıyım
                content: message.content,
                isRead: false,
                createdAt: message.createdAt
            });
            
            // Okundu olarak işaretle
            markMessagesAsRead(currentDmFriendId);
        }
    }
}

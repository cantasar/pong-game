import type { ChatMessage } from './websocket.service';

// Chat konuşması arayüzü
export interface ChatConversation {
  friendId: number;
  friendName: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export class ChatStore {
  private conversations: Map<number, ChatConversation> = new Map();
  private listeners: Array<() => void> = [];

  // Belirli bir arkadaşın konuşmasını alma
  public getConversation(friendId: number): ChatConversation | null {
    return this.conversations.get(friendId) || null;
  }

  // Tüm konuşmaları alma (son mesaja göre sıralı)
  public getAllConversations(): ChatConversation[] {
    return Array.from(this.conversations.values()).sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || '0';
      const bTime = b.lastMessage?.createdAt || '0';
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }

  // Konuşma oluşturma veya güncelleme
  public createOrUpdateConversation(friendId: number, friendName: string): ChatConversation {
    let conversation = this.conversations.get(friendId);
    
    if (!conversation) {
      conversation = {
        friendId,
        friendName,
        messages: [],
        unreadCount: 0
      };
      this.conversations.set(friendId, conversation);
    } else {
      // İsim güncellemesi
      if (friendName && conversation.friendName !== friendName) {
        conversation.friendName = friendName;
      }
    }
    
    return conversation;
  }

  // Mesaj ekleme
  public addMessage(message: ChatMessage, currentUserId: number) {
    let friendId: number;
    let isIncoming: boolean;

    if (message.from === currentUserId) {
      // Gönderilen mesaj
      friendId = message.to!;
      isIncoming = false;
    } else {
      // Alınan mesaj
      friendId = message.from;
      isIncoming = true;
    }

    let conversation = this.conversations.get(friendId);
    if (!conversation) {
      conversation = this.createOrUpdateConversation(friendId, `User ${friendId}`);
    }

    // Aynı mesajın tekrar gönderilmesini engelle
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (lastMessage && 
        lastMessage.from === message.from && 
        lastMessage.content === message.content &&
        Math.abs(new Date(lastMessage.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000) {
      return;
    }

    // Mesajı konuşmaya ekle
    conversation.messages.push(message);
    conversation.lastMessage = message;
    
    // Gelen mesajlar için okunmadı sayısını arttır
    if (isIncoming && !message.isRead) {
      conversation.unreadCount++;
    }

    this.notifyListeners();
  }

  // Konuşmayı okundu olarak işaretle
  public markConversationAsRead(friendId: number) {
    const conversation = this.conversations.get(friendId);
    if (conversation) {
      conversation.unreadCount = 0;
      // Tüm mesajları okundu olarak işaretle
      conversation.messages.forEach(msg => {
        if (msg.from === friendId) {
          msg.isRead = true;
        }
      });
      this.notifyListeners();
    }
  }

  // Toplam okunmamış mesaj sayısı
  public getUnreadCount(): number {
    return Array.from(this.conversations.values())
      .reduce((total, conv) => total + conv.unreadCount, 0);
  }

  // Dinleyici ekleme
  public addListener(listener: () => void) {
    this.listeners.push(listener);
  }

  // Dinleyici kaldırma
  public removeListener(listener: () => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Dinleyicileri bilgilendirme
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Tüm konuşmaları temizleme
  public clear() {
    this.conversations.clear();
    this.notifyListeners();
  }
}

// Global chat store
export const chatStore = new ChatStore();

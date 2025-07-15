import { getToken } from './api';
import { chatStore } from './chat.service';
import { userStatusService } from './user-status.service';

// Chat mesajı arayüzü
export interface ChatMessage {
  from: number;
  to?: number;
  content: string;
  createdAt: string;
  isRead?: boolean;
  status?: 'sent' | 'delivered' | 'error';
}

// Mesaj işleyici arayüzü
export interface MessageHandler {
  onMessage: (message: ChatMessage) => void;
  onError?: (error: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: MessageHandler[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  // WebSocket bağlantısı kurma
  private connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    const token = getToken();
    
    if (!token) {
      this.isConnecting = false;
      return;
    }

    try {
      this.ws = new WebSocket('ws://localhost:3000/ws', token);
      
      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.handlers.forEach(handler => handler.onConnect?.());
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'user_status') {
            // Kullanıcı durumu güncelleme
            if (data.isOnline) {
              userStatusService.setOnline(data.userId, data.username);
            } else {
              userStatusService.setOffline(data.userId);
            }
          } else if (data.type === 'user_list') {
            // Kullanıcı listesi güncelleme
            userStatusService.updateOnlineUsers(data.users);
          } else {
            // Normal chat mesajı
            const message: ChatMessage = data;
            this.handlers.forEach(handler => {
              handler.onMessage(message);
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        this.isConnecting = false;
        this.handlers.forEach(handler => handler.onDisconnect?.());
        
        // Otomatik yeniden bağlanma
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        this.isConnecting = false;
        this.handlers.forEach(handler => handler.onError?.(error));
      };

    } catch (error) {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  // Yeniden bağlanma zamanlaması
  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Mesaj gönderme
  public sendMessage(receiverId: number, content: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (!this.isConnecting) {
        this.connect();
      }
      return false;
    }

    try {
      const message = { receiverId, content };
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // Mesaj işleyici ekleme
  public addHandler(handler: MessageHandler) {
    if (!this.handlers.includes(handler)) {
      this.handlers.push(handler);
    }
  }

  // Mesaj işleyici kaldırma
  public removeHandler(handler: MessageHandler) {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  // Bağlantı durumunu kontrol etme
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Bağlantıyı kapatma
  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.handlers = [];
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  // Kullanıcı çıkışı sırasında temizlik
  public logout() {
    this.disconnect();
    chatStore.clear();
    userStatusService.clear();
  }
}

// Global WebSocket servisi
export let webSocketService: WebSocketService | null = null;

// WebSocket servisi başlatma
export function initWebSocketService(): WebSocketService {
  if (webSocketService) {
    webSocketService.logout();
  }
  webSocketService = new WebSocketService();
  return webSocketService;
}

// WebSocket servisi alma
export function getWebSocketService(): WebSocketService | null {
  return webSocketService;
}

// WebSocket servisi sonlandırma
export function destroyWebSocketService(): void {
  if (webSocketService) {
    webSocketService.logout();
    webSocketService = null;
  }
  
  // Güvenlik için tüm verileri temizle
  chatStore.clear();
  userStatusService.clear();
}

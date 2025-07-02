import { getToken } from './api';
import { chatStore } from './chat.service';
import { userStatusService } from './user-status.service';
import type { UserStatus } from './user-status.service';

export interface ChatMessage {
  from: number;
  to?: number;
  content: string;
  createdAt: string;
  isRead?: boolean;
  status?: 'sent' | 'delivered' | 'error';
}

export interface UserStatusMessage {
  type: 'user_status';
  userId: number;
  username: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface UserListMessage {
  type: 'user_list';
  users: UserStatus[];
}

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
  private healthCheckInterval: number | null = null;

  constructor() {
    this.connect();
    this.startHealthCheck();
  }

  private connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    const token = getToken();
    
    if (!token) {
      console.error('No token available for WebSocket connection');
      this.isConnecting = false;
      return;
    }

    try {
      // Backend WebSocket endpoint'i /ws olarak tanımlı
      this.ws = new WebSocket('ws://localhost:3000/ws', token);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.handlers.forEach(handler => handler.onConnect?.());
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data);
          
          // Handle different message types
          if (data.type === 'user_status') {
            // User status update
            console.log('👤 User status update:', data);
            userStatusService.updateUserStatus(data.userId, data.username, data.isOnline, data.lastSeen);
          } else if (data.type === 'user_list') {
            // Initial user list or user list update
            console.log('📋 User list update:', data);
            userStatusService.updateUserList(data.users);
          } else {
            // Regular chat message
            const message: ChatMessage = data;
            this.handlers.forEach(handler => {
              console.log('🔄 Calling message handler');
              handler.onMessage(message);
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected', event.code, event.reason);
        this.isConnecting = false;
        this.handlers.forEach(handler => handler.onDisconnect?.());
        
        // Otomatik yeniden bağlanma
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        this.handlers.forEach(handler => handler.onError?.(error));
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30 seconds
    
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  public sendMessage(receiverId: number, content: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket is not connected, current state:', this.ws?.readyState);
      
      // Try to reconnect if not connecting already
      if (!this.isConnecting) {
        console.log('🔄 Attempting to reconnect...');
        this.connect();
      }
      
      return false;
    }

    try {
      const message = {
        receiverId,
        content
      };
      
      this.ws.send(JSON.stringify(message));
      console.log('📤 Message sent:', message);
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return false;
    }
  }

  public addHandler(handler: MessageHandler) {
    // Prevent duplicate handlers
    const exists = this.handlers.indexOf(handler) !== -1;
    if (!exists) {
      this.handlers.push(handler);
    }
  }

  public removeHandler(handler: MessageHandler) {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    // Clear all handlers
    this.handlers = [];
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  // Method to be called on logout
  public logout() {
    console.log('🔒 Logging out - closing WebSocket connection and clearing chat data');
    this.disconnect();
    
    // Clear chat store and user status
    chatStore.clear();
    userStatusService.clear();
  }

  private startHealthCheck() {
    // Check connection every 30 seconds
    this.healthCheckInterval = window.setInterval(() => {
      if (!this.isConnected() && !this.isConnecting) {
        console.log('🔄 Health check: Connection lost, attempting to reconnect...');
        this.connect();
      }
    }, 30000);
  }

  public getConnectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public forceReconnect() {
    console.log('🔄 Force reconnecting WebSocket...');
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  public getConnectionStateText(): string {
    if (!this.ws) return 'Not initialized';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'Connecting';
      case WebSocket.OPEN: return 'Connected';
      case WebSocket.CLOSING: return 'Closing';
      case WebSocket.CLOSED: return 'Closed';
      default: return 'Unknown';
    }
  }
}

// Global instance that will be managed by the app
export let webSocketService: WebSocketService | null = null;

// Helper functions to manage the WebSocket service
export function initWebSocketService(): WebSocketService {
  if (webSocketService) {
    webSocketService.logout();
  }
  webSocketService = new WebSocketService();
  return webSocketService;
}

export function getWebSocketService(): WebSocketService | null {
  return webSocketService;
}

export function destroyWebSocketService(): void {
  if (webSocketService) {
    webSocketService.logout();
    webSocketService = null;
  }
  
  // Also clear chat store and user status as a safety measure
  chatStore.clear();
  userStatusService.clear();
}

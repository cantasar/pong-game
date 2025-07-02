export interface UserStatus {
  userId: number;
  username: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface UserStatusHandler {
  onUserStatusChange: (userId: number, isOnline: boolean) => void;
  onUserListUpdate?: (users: UserStatus[]) => void;
}

class UserStatusService {
  private userStatuses = new Map<number, UserStatus>();
  private handlers: UserStatusHandler[] = [];

  // Get user status
  getUserStatus(userId: number): UserStatus | null {
    return this.userStatuses.get(userId) || null;
  }

  // Check if user is online
  isUserOnline(userId: number): boolean {
    const status = this.userStatuses.get(userId);
    return status?.isOnline || false;
  }

  // Update user status
  updateUserStatus(userId: number, username: string, isOnline: boolean, lastSeen?: string) {
    const currentStatus = this.userStatuses.get(userId);
    const wasOnline = currentStatus?.isOnline || false;
    
    const newStatus: UserStatus = {
      userId,
      username,
      isOnline,
      lastSeen: lastSeen || (isOnline ? undefined : new Date().toISOString())
    };

    this.userStatuses.set(userId, newStatus);

    // Notify handlers if status changed
    if (wasOnline !== isOnline) {
      this.handlers.forEach(handler => {
        handler.onUserStatusChange(userId, isOnline);
      });
    }
  }

  // Set user offline
  setUserOffline(userId: number) {
    const status = this.userStatuses.get(userId);
    if (status && status.isOnline) {
      this.updateUserStatus(userId, status.username, false);
    }
  }

  // Set user online
  setUserOnline(userId: number, username: string) {
    this.updateUserStatus(userId, username, true);
  }

  // Get all online users
  getOnlineUsers(): UserStatus[] {
    return Array.from(this.userStatuses.values()).filter(status => status.isOnline);
  }

  // Get all users
  getAllUsers(): UserStatus[] {
    return Array.from(this.userStatuses.values());
  }

  // Add status change handler
  addHandler(handler: UserStatusHandler) {
    if (!this.handlers.includes(handler)) {
      this.handlers.push(handler);
    }
  }

  // Remove status change handler
  removeHandler(handler: UserStatusHandler) {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  // Clear all statuses (for logout)
  clear() {
    this.userStatuses.clear();
    this.handlers = [];
  }

  // Update user list from server
  updateUserList(users: UserStatus[]) {
    // Clear existing statuses
    this.userStatuses.clear();
    
    // Add new statuses
    users.forEach(user => {
      this.userStatuses.set(user.userId, user);
    });

    // Notify handlers
    this.handlers.forEach(handler => {
      handler.onUserListUpdate?.(users);
    });
  }
}

// Global instance
export const userStatusService = new UserStatusService();

// User types
export interface User {
  id: number;
  username: string;
  email?: string;
}

// Friend types
export interface Friend {
  id: number;
  username: string;
  status: 'online' | 'offline' | 'away';
}

// Friend request types
export interface FriendRequest {
  id: number;
  requester: User;
  status?: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
}

// API Response types
export interface FriendsResponse {
  friendsList: Friend[];
}

export interface FriendRequestsResponse {
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
}

// Component callback types
export type OnFriendSelectCallback = (friend: Friend) => void;
export type OnLogoutCallback = () => void;
export type OnCloseCallback = () => void;

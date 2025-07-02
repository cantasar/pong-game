import { destroyWebSocketService } from './services/websocket.service';

const API_URL = 'http://localhost:3000';

export function getToken() {
  return localStorage.getItem('jwt');
}

export function setToken(token: string) {
  localStorage.setItem('jwt', token);
}

export function clearToken() {
  localStorage.removeItem('jwt');
  
  // Also destroy WebSocket service when clearing token
  destroyWebSocketService();
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  console.log(`API Request: ${options.method || 'GET'} ${API_URL}${path}`, {
    headers: { ...headers, Authorization: token ? 'Bearer [HIDDEN]' : undefined },
    body: options.body
  });
  
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  
  console.log(`API Response: ${res.status} ${res.statusText} for ${path}`);
  
  if (!res.ok) {
    let error;
    try {
      error = await res.json();
      console.error('API Error Response:', error);
    } catch {
      error = { 
        message: `HTTP ${res.status}: ${res.statusText}`,
        status: res.status,
        statusText: res.statusText 
      };
      console.error('API Error (no JSON):', error);
    }
    throw error || { message: 'Unknown error' };
  }
  
  try {
    const data = await res.json();
    console.log('API Success Response:', data);
    return data;
  } catch {
    console.log('API Success (no JSON content)');
    return {};
  }
}

export async function loginApi(username: string, password: string) {
  return apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function registerApi(username: string, password: string) {
  return apiFetch('/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function getMe() {
  return apiFetch('/me', {
    method: 'GET',
  });
}

export async function getFriends() {
  return apiFetch('/friends', {
    method: 'GET',
  });
}

// Friend request API functions
export async function sendFriendRequest(targetId: number) {
  if (!targetId || isNaN(targetId)) {
    throw new Error('Invalid user ID');
  }
  
  console.log('Sending friend request to user ID:', targetId);
  
  try {
    const response = await apiFetch(`/friends/${targetId}`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    console.log('Friend request sent successfully:', response);
    return response;
  } catch (error: any) {
    console.error('Friend request failed:', error);
    
    // Detaylı hata mesajları
    if (error?.status === 500) {
      throw new Error('Server error occurred. Please try again later or contact support.');
    } else if (error?.status === 400) {
      throw new Error(error?.message || 'Invalid request. Please check the user ID.');
    } else if (error?.status === 401) {
      throw new Error('You need to be logged in to send friend requests.');
    } else if (error?.status === 403) {
      throw new Error('You are not allowed to send a friend request to this user.');
    } else if (error?.status === 409) {
      throw new Error('Friend request already exists or you are already friends.');
    } else if (error?.message) {
      throw error;
    } else if (error?.error) {
      throw new Error(error.error);
    } else {
      throw new Error('Failed to send friend request. Please try again.');
    }
  }
}

export async function getFriendRequests() {
  try {
    const response = await apiFetch('/friends/requests', {
      method: 'GET',
    });
    
    // Backend'den dönen response yapısı: { incomingRequests: [...] }
    if (response && response.incomingRequests) {
      return response;
    } else {
      // Boş response durumu için varsayılan yapı
      return { incomingRequests: [] };
    }
  } catch (error: any) {
    console.error('Failed to get friend requests:', error);
    
    if (error?.status === 401) {
      throw new Error('You need to be logged in to view friend requests.');
    } else if (error?.message) {
      throw error;
    } else if (error?.error) {
      throw new Error(error.error);
    } else {
      throw new Error('Failed to load friend requests. Please try again.');
    }
  }
}

export async function acceptOrRejectFriendRequest(id: number, accept: string) {
  return apiFetch(`/friends/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action: accept }),
  });
}

// Chat API functions
export async function sendMessage(receiverId: number, content: string) {
  return apiFetch('/messages', {
    method: 'POST',
    body: JSON.stringify({ receiverId, content }),
  });
}

export async function getMessages(receiverId: number) {
  return apiFetch(`/messages/${receiverId}`, {
    method: 'GET',
  });
}

// Get user by username
export async function getUserByUsername(username: string) {
  if (!username || username.trim().length === 0) {
    throw new Error('Username is required');
  }
  
  try {
    const response = await apiFetch(`/users/${encodeURIComponent(username.trim())}`, {
      method: 'GET',
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'User not found');
    }
  } catch (error: any) {
    if (error?.success === false) {
      throw new Error(error.error || 'Failed to get user');
    } else if (error?.message) {
      throw error;
    } else {
      throw new Error('Failed to search for user');
    }
  }
}

// Get user by ID
export async function getUserById(userId: number) {
  if (!userId || isNaN(userId)) {
    throw new Error('Invalid user ID');
  }
  
  try {
    const response = await apiFetch(`/users/id/${userId}`, {
      method: 'GET',
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'User not found');
    }
  } catch (error: any) {
    if (error?.success === false) {
      throw new Error(error.error || 'Failed to get user');
    } else if (error?.message) {
      throw error;
    } else {
      throw new Error('Failed to get user information');
    }
  }
}
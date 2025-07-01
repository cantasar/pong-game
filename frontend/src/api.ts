const API_URL = 'http://localhost:3000';

export function getToken() {
  return localStorage.getItem('jwt');
}

export function setToken(token: string) {
  localStorage.setItem('jwt', token);
}

export function clearToken() {
  localStorage.removeItem('jwt');
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
  return apiFetch('/friends/requests', {
    method: 'GET',
  });
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

// Get user by username to find their ID
export async function getUserByUsername(username: string) {
  if (!username || username.trim().length === 0) {
    throw new Error('Username is required');
  }
  
  try {
    return await apiFetch(`/users/search?username=${encodeURIComponent(username.trim())}`, {
      method: 'GET',
    });
  } catch (error: any) {
    if (error?.message) {
      throw error;
    } else if (error?.error) {
      throw new Error(error.error);
    } else {
      throw new Error('Failed to search for user');
    }
  }
}
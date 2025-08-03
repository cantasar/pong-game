// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  
  
  // Example fetch: fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), { method: 'POST', body: JSON.stringify({...}) })
  // Example fetch: fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER), { method: 'POST', body: JSON.stringify({...}) })
  // Example fetch: fetch(getApiUrl(API_CONFIG.ENDPOINTS.USER.ME), { headers: { Authorization: `Bearer ${token}` } })
  // Example fetch: fetch(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.LIST), { headers: { Authorization: `Bearer ${token}` } })
  // Example fetch: fetch(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.ADD(targetId)), { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  // Example fetch: fetch(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.ACCEPT(targetId)), { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  // Example fetch: fetch(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.REJECT(targetId)), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
  // Example fetch: fetch(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.BLOCK(id)), { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  // Example fetch: fetch(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.UNBLOCK(id)), { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  // Example fetch: fetch(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.REQUESTS.INCOMING), { headers: { Authorization: `Bearer ${token}` } })
  // Example fetch: fetch(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.REQUESTS.SENT), { headers: { Authorization: `Bearer ${token}` } })


  ENDPOINTS: {
    AUTH: {
      // POST /auth/login
      // Body: { email: string, password: string }
      LOGIN: '/auth/login',

      // POST /auth/register
      // Body: { username: string, email: string, password: string }
      REGISTER: '/auth/register',

      // GET /auth/google
      // OAuth login redirect (no fetch needed from frontend)
      // GOOGLE: '/auth/google'
    },

    USER: {
      // GET /users/me
      // Headers: { Authorization: 'Bearer <token>' }
      ME: '/users/me'
    },

    FRIENDS: {
      // GET /friends
      // Get user's friend list
      // Example fetch: fetch(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.LIST), { headers: { Authorization: `Bearer ${token}` } })
      LIST: '/friends',

      // POST /friends/add/:targetId
      // No body — just path param and Authorization header
      ADD: (targetId: string) => `/friends/add/${targetId}`,

      // POST /friends/:targetId/accept
      // Accept incoming request from targetId
      ACCEPT: (targetId: string) => `/friends/${targetId}/accept`,

      // DELETE /friends/:targetId/reject
      // Reject friend request or remove friend
      REJECT: (targetId: string) => `/friends/${targetId}/reject`,

      // POST /friends/:id/block
      // Block user by ID
      BLOCK: (id: string) => `/friends/${id}/block`,

      // POST /friends/:id/unblock
      // Unblock user by ID
      UNBLOCK: (id: string) => `/friends/${id}/unblock`,

      REQUESTS: {
        // GET /friends/requests/incoming
        // Fetch list of incoming friend requests
        INCOMING: '/friends/requests/incoming',

        // GET /friends/requests/send
        // Fetch list of sent friend requests
        SENT: '/friends/requests/send'
      }
    }
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
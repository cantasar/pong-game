// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',

  ENDPOINTS: {
    AUTH: {
      // POST /auth/register
      // Body: { username, email, password }
      REGISTER: '/auth/register',

      // POST /auth/login
      // Body: { email, password }
      LOGIN: '/auth/login',

      // GET /auth/me
      // Headers: { Authorization: Bearer <token> }
      ME: '/auth/me',

      // GET /auth/google
      // OAuth login redirect (no fetch needed from frontend)
      GOOGLE: '/auth/google'
    },

    USER: {
      // GET /users/me
      // Headers: { Authorization: Bearer <token> }
      ME: '/users/me',

      // PUT /users/me
      // Body: { username?, email?, avatar? }
      // Headers: { Authorization: Bearer <token> }
      UPDATE: '/users/me',

      // GET /users/:username
      // Function usage: getApiUrl(API_CONFIG.ENDPOINTS.USER.BY_USERNAME('can'))
      BY_USERNAME: (username: string) => `/users/${username}`
    },

    FRIENDS: {
      // GET /friends
      LIST: '/friends',

      // POST /friends/add/:targetId
      ADD: (targetId: string) => `/friends/add/${targetId}`,

      // POST /friends/:targetId/accept
      ACCEPT: (targetId: string) => `/friends/${targetId}/accept`,

      // POST /friends/:targetId/reject
      REJECT: (targetId: string) => `/friends/${targetId}/reject`,

      // DELETE /friends/:targetId/remove
      REMOVE: (targetId: string) => `/friends/${targetId}/remove`,

      // POST /friends/:id/block
      BLOCK: (id: string) => `/friends/${id}/block`,

      // POST /friends/:id/unblock
      UNBLOCK: (id: string) => `/friends/${id}/unblock`,

      REQUESTS: {
        // GET /friends/requests/incoming
        INCOMING: '/friends/requests/incoming',

        // GET /friends/requests/sent
        SENT: '/friends/requests/sent'
      }
    }
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

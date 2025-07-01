export const searchUsersSchema = {
  description: 'Search users by username',
  tags: ['users'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        minLength: 1,
        description: 'Username to search for'
      }
    },
    required: ['username']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              username: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        count: { type: 'integer' }
      }
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
};

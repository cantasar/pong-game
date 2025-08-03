// Chat API Schemas for Fastify

// GET /api/chat/history/:userId request schema
export const getChatHistorySchema = {
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: {
        type: 'integer',
        description: 'ID of the user to get chat history with'
      }
    }
  },
  querystring: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 50,
        description: 'Number of messages to retrieve'
      },
      offset: {
        type: 'integer',
        minimum: 0,
        default: 0,
        description: 'Number of messages to skip for pagination'
      },
      before: {
        type: 'string',
        format: 'date-time',
        description: 'Get messages before this timestamp (ISO string)'
      },
      after: {
        type: 'string',
        format: 'date-time',
        description: 'Get messages after this timestamp (ISO string)'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  senderId: { type: 'integer' },
                  receiverId: { type: 'integer' },
                  content: { type: 'string' },
                  isRead: { type: 'integer' },
                  delivered: { type: 'integer' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            totalCount: { type: 'integer' },
            hasMore: { type: 'boolean' },
            pagination: {
              type: 'object',
              properties: {
                limit: { type: 'integer' },
                offset: { type: 'integer' },
                total: { type: 'integer' }
              }
            }
          }
        }
      }
    },
    400: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' }
      }
    },
    401: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' }
      }
    },
    404: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' }
      }
    }
  }
};

// PUT /api/chat/mark-read/:userId request schema
export const markMessagesAsReadSchema = {
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: {
        type: 'integer',
        description: 'ID of the user whose messages to mark as read'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            markedCount: { type: 'integer' }
          }
        }
      }
    },
    400: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' }
      }
    },
    401: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' }
      }
    }
  }
};

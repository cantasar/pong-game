const userResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    username: { type: 'string' },
    email: { type: 'string', format: 'email' }
  },
  required: ['id', 'username', 'email']
};

export const registerSchema = {
  body: {
    type: 'object',
    required: ['username', 'email', 'password'],
    properties: {
      username: { type: 'string', minLength: 3 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 }
    },
    additionalProperties: false
  },
  response: {
    201: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        user: userResponseSchema
      }
    }
  }
};

export const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' }
    },
    additionalProperties: false
  },
  response: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        user: userResponseSchema
      }
    }
  }
};

export const meSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        user: userResponseSchema
      }
    }
  }
};
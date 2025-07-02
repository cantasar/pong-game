import * as userService from '../services/user.service.js';

export async function searchUsersController(request, reply) {
  try {
    const { username } = request.query;
    
    if (!username || username.trim() === '') {
      return reply.code(400).send({ error: 'Username query parameter is required' });
    }

    const users = await userService.searchUsersByUsernameService(username.trim());
    
    return reply.code(200).send({ 
      users,
      count: users.length 
    });
  } catch (error) {
    console.error('Search users error:', error);
    return reply.code(500).send({ error: error.message || 'Internal server error' });
  }
}

export async function getUserByIdController(request, reply) {
  try {
    const { id } = request.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return reply.code(400).send({ error: 'Invalid user ID' });
    }

    const user = await userService.getUserByIdService(userId);
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    return reply.code(200).send(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    return reply.code(500).send({ error: error.message || 'Internal server error' });
  }
}

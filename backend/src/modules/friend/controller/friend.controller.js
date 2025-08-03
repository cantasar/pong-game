import { findUserById } from '../../user/service/user.service.js';
import {
  isExistingFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  isFriend,
  getIncomingFriendRequestById,
  addFriendRequest,
  deleteFriend,
  blockFriend,
  unblockFriend,
  getFriendsListWithUserInfo,
  getIncomingFriendRequestsWithUserInfo,
  getSentRequestsWithUserInfo
} from '../service/friend.service.js';

export async function createFriendRequest(request, reply) {
  const requesterId = request.user.id;
  const targetId = request.params.targetId;

  if (!targetId || isNaN(targetId)) {
    return reply.code(400).send({ error: 'Invalid target user ID' });
  }

  const existingUser = await findUserById(targetId);
  if (!existingUser) {
    return reply.code(404).send({ error: 'Target user not found' });
  }

  if (requesterId == targetId) {
    return reply.code(400).send({ error: 'You cannot send a friend request to yourself' });
  }

  const existingRequest = await isExistingFriendRequest(requesterId, targetId);
  if (existingRequest) {
    return reply.code(400).send({ error: 'Friend request already exists' });
  }

  try {
    const result = await addFriendRequest(requesterId, targetId);
    if (result.changes > 0) {
      return reply.code(201).send({ message: 'Friend request sent successfully' });
    } else {
      return reply.code(500).send({ error: 'Failed to send friend request' });
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function getIncomingRequests(request, reply) {
  const userId = request.user.id;
  const requests = await getIncomingFriendRequestsWithUserInfo(userId);
  
  // Boş array olsa bile success olarak dön
  return reply.code(200).send({ requests });
}

export async function acceptRequest(request, reply) {
  const userId = request.user.id;
  const targetId = request.params.targetId;

  const alreadyFriend = await isFriend(targetId, userId);
  if (alreadyFriend.length > 0) {
    return reply.code(409).send({ message: "You are already friends" });
  }

  const pendingRequest = await getIncomingFriendRequestById(targetId, userId);
  if (!pendingRequest || pendingRequest.length === 0) {
    return reply.code(404).send({ message: "No pending request found" });
  }

  const accept = await acceptFriendRequest(userId, targetId);
  if (accept.changes > 0) {
    return reply.code(201).send({ message: "Accepted request" });
  } else {
    return reply.code(500).send({ message: "Failed to accept request" });
  }
}

export async function rejectRequest(request, reply) {
  const userId = request.user.id;
  const targetId = request.params.targetId;

  const pendingRequest = await getIncomingFriendRequestById(targetId, userId);
  if (!pendingRequest || pendingRequest.length === 0) {
    return reply.code(404).send({ message: "No pending request found" });
  }

  const reject = await rejectFriendRequest(userId, targetId);
  if (reject.changes > 0) {
    return reply.code(200).send({ message: "Request rejected" });
  } else {
    return reply.code(500).send({ message: "Failed to reject request" });
  }
}

export async function getFriendsListController(request, reply) {
  const userId = request.user.id;
  const friends = await getFriendsListWithUserInfo(userId);
  
  return reply.code(200).send({ friends });
}

export async function getSentRequestsController(request, reply) {
  const userId = request.user.id;
  const requests = await getSentRequestsWithUserInfo(userId);
  
  return reply.code(200).send({ requests });
}

export async function blockFriendController(request, reply) {
  const userId = request.user.id;
  const targetId = request.params.id;
  
  if (!targetId || isNaN(targetId)) {
    return reply.code(400).send({ error: 'Invalid target user ID' });
  }

  const user = await findUserById(targetId);
  if (!user) {
    return reply.code(404).send({ error: 'Target user not found' });
  }

  if (userId == targetId) {
    return reply.code(400).send({ error: 'You cannot block yourself' });
  }

  try {
    const result = await blockFriend(userId, targetId);
    if (result.error) {
      return reply.code(400).send(result);
    } else if (result.message) {
      return reply.code(200).send(result);
    } else {
      return reply.code(500).send({ error: 'Failed to block user' });
    }
  } catch (error) {
    console.error('Error blocking user:', error);
    return reply.code(500).send({ error: 'Internal server error' });    
  }
}

export async function unblockFriendController(request, reply) {
  const userId = request.user.id;
  const targetId = request.params.id;
  
  if (!targetId || isNaN(targetId)) {
    return reply.code(400).send({ error: 'Invalid target user ID' });
  }

  const user = await findUserById(targetId);
  if (!user) {
    return reply.code(404).send({ error: 'Target user not found' });
  }

  if (userId == targetId) {
    return reply.code(400).send({ error: 'You cannot unblock yourself' });
  }

  try {
    const result = await unblockFriend(userId, targetId);
    if (result.error) {
      return reply.code(400).send(result);
    } else if (result.message) {
      return reply.code(200).send(result);
    } else {
      return reply.code(500).send({ error: 'Failed to unblock user' });
    }
  } catch (error) {
    console.error('Error unblocking user:', error);
    return reply.code(500).send({ error: 'Internal server error' });    
  }
}

export async function deleteFriendController(request, reply) {
  const userId = request.user.id;
  const targetId = request.params.targetId;

  if (!targetId || isNaN(targetId)) {
    return reply.code(400).send({ error: 'Invalid target user ID' });
  }

  const user = await findUserById(targetId);
  if (!user) {
    return reply.code(404).send({ error: 'Target user not found' });
  }

  if (userId == targetId) {
    return reply.code(400).send({ error: 'You cannot remove yourself' });
  }
  
  try {
    const result = await deleteFriend(userId, targetId);
    if (result.changes > 0) {
      return reply.code(200).send({ message: 'Friend removed successfully' });
    } else {
      return reply.code(500).send({ error: 'Failed to remove friend' });
    }
  } catch (error) {
    console.error('Error removing friend:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}


import { initDB } from '../../../config/db.js';

export async function isExistingFriendRequest(requesterId, targetId) {
  const db = await initDB();
  const existingRequest = await db.get(
    'SELECT * FROM friends WHERE requesterID = ? AND recipientID = ?', 
    [requesterId, targetId]
  );
  return existingRequest;
}

export async function addFriendRequest(requesterId, targetId) {
  const db = await initDB();
  const result = await db.run(
    'INSERT INTO friends (requesterID, recipientID, status) VALUES (?, ?, ?)', 
    [requesterId, targetId, 'pending']
  );
  return result;
}

export async function getIncomingFriendRequestById(targetId, userId) {
  const db = await initDB();
  const requests = await db.all(
    'SELECT * FROM friends WHERE requesterID = ? AND recipientID = ? AND status = ?', 
    [targetId, userId, 'pending']
  );
  return requests;
}

export async function acceptFriendRequest(userId, targetId) {
  const db = await initDB();
  const result = await db.run(
    'UPDATE friends SET status = ? WHERE recipientID = ? AND requesterID = ?', 
    ['approved', userId, targetId]
  );
  return result;
}

export async function isFriend(userId, targetId) {
  const db = await initDB();
  const result = await db.all(
    `SELECT * FROM friends WHERE 
     ((requesterID = ? AND recipientID = ? AND status = ?) OR 
      (requesterID = ? AND recipientID = ? AND status = ?))`,
    [userId, targetId, 'approved', targetId, userId, 'approved']
  );
  return result;
}

export async function isBlockedAlready(blockerId, blockedId) {
  const db = await initDB();
  const existingBlock = await db.get(
    'SELECT * FROM blocked_users WHERE blockerId = ? AND blockedId = ?', 
    [blockerId, blockedId]
  );
  return existingBlock;
}

export async function blockFriend(blockerId, blockedId) {
  const db = await initDB();
  const existingBlock = await isBlockedAlready(blockerId, blockedId);
  
  if (existingBlock) {
    return { error: 'User is already blocked' };
  }
  
  try {
    await db.run(
      'DELETE FROM friends WHERE (requesterID = ? AND recipientID = ?) OR (requesterID = ? AND recipientID = ?)', 
      [blockerId, blockedId, blockedId, blockerId]
    );
    
    const result = await db.run(
      'INSERT INTO blocked_users (blockerId, blockedId) VALUES (?, ?)', 
      [blockerId, blockedId]
    );
    
    if (result.changes > 0) {
      return { message: 'User blocked successfully' };
    } else {
      return { error: 'Failed to block user' };
    }
  } catch (error) {
    return { error: error.message };
  }
}

export async function unblockFriend(blockerId, blockedId) {
  const db = await initDB();
  const existingBlock = await isBlockedAlready(blockerId, blockedId);
  
  if (!existingBlock) {
    return { error: 'User is not blocked' };
  }
  
  try {
    const result = await db.run(
      'DELETE FROM blocked_users WHERE blockerId = ? AND blockedId = ?', 
      [blockerId, blockedId]
    );
    
    if (result.changes > 0) {
      return { message: 'User unblocked successfully' };
    } else {
      return { error: 'Failed to unblock user' };
    }
  } catch (error) {
    return { error: error.message };
  }
}

export async function rejectFriendRequest(userId, targetId) {
  const db = await initDB();
  const result = await db.run(
    'DELETE FROM friends WHERE requesterID = ? AND recipientID = ? AND status = ?',
    [targetId, userId, 'pending']
  );
  return result;
}

export async function deleteFriend(userId, targetId) {
  const db = await initDB();
  const result = await db.run(
    'DELETE FROM friends WHERE (requesterID = ? AND recipientID = ?) OR (requesterID = ? AND recipientID = ?)', 
    [userId, targetId, targetId, userId]
  );
  return result;
}

// Zenginleştirilmiş friend servisleri
export async function getFriendsListWithUserInfo(userId) {
  const db = await initDB();
  
  // Önce friend listesini al
  const friends = await db.all(
    'SELECT * FROM friends WHERE (requesterID = ? AND status = ?) OR (recipientID = ? AND status = ?)', 
    [userId, 'approved', userId, 'approved']
  );
  
  // Her friend için user bilgisini al
  const enrichedFriends = [];
  for (const friend of friends) {
    const friendId = friend.requesterID === userId ? friend.recipientID : friend.requesterID;
    const userInfo = await db.get(
      'SELECT id, username, avatar, wins, losses FROM users WHERE id = ?',
      [friendId]
    );
    
    enrichedFriends.push({
      ...friend,
      friendInfo: userInfo
    });
  }
  
  return enrichedFriends;
}

export async function getIncomingFriendRequestsWithUserInfo(userId) {
  const db = await initDB();
  
  // Önce gelen istekleri al
  const requests = await db.all(
    'SELECT * FROM friends WHERE recipientID = ? AND status = ?', 
    [userId, 'pending']
  );
  
  // Her request için gönderen kişi bilgisini al
  const enrichedRequests = [];
  for (const request of requests) {
    const senderInfo = await db.get(
      'SELECT id, username, avatar, wins, losses FROM users WHERE id = ?',
      [request.requesterID]
    );
    
    enrichedRequests.push({
      ...request,
      senderInfo: senderInfo
    });
  }
  
  return enrichedRequests;
}

export async function getSentRequestsWithUserInfo(userId) {
  const db = await initDB();
  
  // Önce gönderilen istekleri al
  const requests = await db.all(
    'SELECT * FROM friends WHERE requesterID = ? AND status = ?', 
    [userId, 'pending']
  );
  
  // Her request için hedef kişi bilgisini al
  const enrichedRequests = [];
  for (const request of requests) {
    const targetInfo = await db.get(
      'SELECT id, username, avatar, wins, losses FROM users WHERE id = ?',
      [request.recipientID]
    );
    
    enrichedRequests.push({
      ...request,
      targetInfo: targetInfo
    });
  }
  
  return enrichedRequests;
}


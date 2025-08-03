import { initDB } from '../../../config/db.js';

// REST API Specific Operations
export async function getChatHistory(userId, otherUserId, options = {}) {
  const db = await initDB();
  const { limit = 50, offset = 0, before, after } = options;
  
  let whereClause = `(
    (senderId = ? AND receiverId = ?) OR 
    (senderId = ? AND receiverId = ?)
  )`;
  let params = [userId, otherUserId, otherUserId, userId];
  
  // Date filtering
  if (before) {
    whereClause += ` AND createdAt < ?`;
    params.push(before);
  }
  
  if (after) {
    whereClause += ` AND createdAt > ?`;
    params.push(after);
  }
  
  // Get total count for pagination
  const countQuery = `SELECT COUNT(*) as total FROM messages WHERE ${whereClause}`;
  const countResult = await db.get(countQuery, params);
  const totalCount = countResult.total;
  
  // Get messages with pagination
  const query = `
    SELECT * FROM messages 
    WHERE ${whereClause}
    ORDER BY createdAt DESC 
    LIMIT ? OFFSET ?
  `;
  
  const messages = await db.all(query, [...params, limit, offset]);
  
  return {
    messages: messages.reverse(), // Reverse to show oldest first
    totalCount,
    hasMore: offset + limit < totalCount,
    pagination: {
      limit,
      offset,
      total: totalCount
    }
  };
}

export async function getPaginatedMessages(userId, otherUserId, page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  return await getChatHistory(userId, otherUserId, { limit, offset });
}

export async function getRecentConversations(userId, limit = 10) {
  const db = await initDB();
  
  const query = `
    SELECT 
      CASE 
        WHEN senderId = ? THEN receiverId 
        ELSE senderId 
      END as otherUserId,
      MAX(createdAt) as lastMessageTime,
      COUNT(*) as messageCount,
      SUM(CASE WHEN receiverId = ? AND isRead = 0 THEN 1 ELSE 0 END) as unreadCount
    FROM messages 
    WHERE senderId = ? OR receiverId = ?
    GROUP BY otherUserId
    ORDER BY lastMessageTime DESC
    LIMIT ?
  `;
  
  const conversations = await db.all(query, [userId, userId, userId, userId, limit]);
  return conversations;
}

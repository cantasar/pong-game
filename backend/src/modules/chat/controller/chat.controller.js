import {
  markMessagesAsRead,
  addMessageToDb,
  markSpecificMessagesAsRead
} from '../service/chat.service.js';
import { 
  sendMissedMessages,
  sendMessage,
  handleRealtimeMessage
} from '../service/websocket.service.js';
import {
  getChatHistory
} from '../service/api.service.js';
import { 
  isConnected 
} from '../../../websocket/services/client.service.js';

export async function undeliveredMessageController(userId, connection) {
  // Tek seferde hem undelivered hem unread mesajları gönder
  await sendMissedMessages(connection, userId);
}

export async function processChatMessage(message, userId) {
  const msgStr = message.toString();
  const msgObj = JSON.parse(msgStr);
  const { receiverId, content, senderId } = msgObj;
  const type = msgObj.type || 'message';

  if (type === 'read') {
    // Eğer senderId belirtilmişse sadece o kullanıcıdan gelen mesajları okundu yap
    if (senderId) {
      await markSpecificMessagesAsRead(userId, senderId);
    } else {
      // Yoksa tüm mesajları okundu yap (eski davranış)
      await markMessagesAsRead(userId);
    }
  } else if (type === 'message') {
    if (!receiverId || !content) {
      throw new Error('Receiver ID and content are required');
    }
    
    if (userId === receiverId) {
      throw new Error('You cannot send a message to yourself');
    }

    // Mesajı her zaman DB'ye kaydet (online/offline fark etmez)
    const newMessage = await addMessageToDb(userId, receiverId, content);
    
    if (newMessage) {
      const messageObj = {
        id: newMessage.lastID,
        senderId: userId,
        receiverId: receiverId,
        content: content,
        isRead: 0,
        delivered: 0,
        createdAt: new Date().toISOString()
      };
      
      // Sadece her iki user da online ise mesajı gönder
      if (await isConnected(receiverId) && await isConnected(userId)) {
        try {
          await handleRealtimeMessage(userId, receiverId, content, messageObj);
        } catch (err) {
          console.error('Error sending message:', err);
        }
      } else {
        console.log(`User ${receiverId} is offline, message saved to DB and will be delivered when online`);
      }
    }
  }
}

// REST API Controllers
export async function getChatHistoryController(request, reply) {
  try {
    const { userId: otherUserId } = request.params;
    const currentUserId = request.user.id;
    const { limit, offset, before, after } = request.query;
    
    if (currentUserId === parseInt(otherUserId)) {
      return reply.status(400).send({
        success: false,
        error: 'Cannot get chat history with yourself'
      });
    }
    
    const result = await getChatHistory(currentUserId, parseInt(otherUserId), {
      limit: parseInt(limit),
      offset: parseInt(offset),
      before,
      after
    });
    
    return reply.send({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
}

export async function markMessagesAsReadController(request, reply) {
  try {
    const { userId: senderId } = request.params;
    const currentUserId = request.user.id;
    
    const markedCount = await markSpecificMessagesAsRead(currentUserId, parseInt(senderId));
    
    return reply.send({
      success: true,
      data: {
        markedCount
      }
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
}
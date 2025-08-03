import { 
  sendToUser
} from '../../../websocket/services/client.service.js';
import {
  getUnreadMessages,
  getUndeliveredMessages,
  updateMessageStatus
} from './chat.service.js';

// WebSocket Specific Operations
export async function sendMissedMessages(connection, userId) {
  if (connection && connection.readyState === WebSocket.OPEN) {
    // Hem undelivered hem unread mesajları al
    const undeliveredMessages = await getUndeliveredMessages(userId);
    const unreadMessages = await getUnreadMessages(userId);
    
    const messagePayload = {
      type: 'missedMessages',
      data: {
        undelivered: undeliveredMessages.map(msg => ({
          from: msg.senderId,
          content: msg.content,
          createdAt: msg.createdAt,
          isRead: 0,
          delivered: 0,
          id: msg.id
        })),
        unread: unreadMessages.map(msg => ({
          from: msg.senderId,
          content: msg.content,
          createdAt: msg.createdAt,
          isRead: 0,
          delivered: 1,
          id: msg.id
        })),
        totalUnreadCount: undeliveredMessages.length + unreadMessages.length
      }
    };
    
    try {
      connection.send(JSON.stringify(messagePayload));
      
      // Undelivered mesajları delivered olarak işaretle
      await Promise.all(undeliveredMessages.map(msg =>
        updateMessageStatus(msg.senderId, msg.receiverId, msg)
      ));
    } catch (err) {
      console.error('Error sending missed messages:', err);
    }
  }
}

export async function sendMessage(senderId, receiverId, content, message) {
  try {
    await sendToUser(receiverId, {
      type: 'message',
      from: senderId,
      content: content,
      createdAt: message.createdAt,
      isRead: message.isRead,
      delivered: 1,
      id: message.id
    });
    
    await sendToUser(senderId, {
      type: 'message',
      to: receiverId,
      content: content,
      createdAt: message.createdAt,
      isRead: message.isRead,
      delivered: 1,
      id: message.id
    });
    
    await updateMessageStatus(senderId, receiverId, message);
  } catch (err) {
    console.error('Error sending message:', err);
  }
}

export async function handleRealtimeMessage(senderId, receiverId, content, messageObj) {
  // Real-time mesaj işleme logics
  try {
    await sendMessage(senderId, receiverId, content, messageObj);
    return { success: true };
  } catch (error) {
    console.error('Error handling realtime message:', error);
    return { success: false, error: error.message };
  }
}

import { getUsersByIdsService } from './user.service.js';

// Bağlı olan kullanıcıları tutacak Map
const clients = new Map();

// Yeni kullanıcı bağlantısı ekleme
export function addClient(userId, socket) {
  clients.set(parseInt(userId), socket);
  broadcastUserStatusChange(parseInt(userId), true);
}

// Kullanıcı bağlantısını kaldırma
export function removeClient(userId) {
  clients.delete(parseInt(userId));
  broadcastUserStatusChange(parseInt(userId), false);
}

// Kullanıcının socket bağlantısını getirme
export function getClient(userId) {
  return clients.get(parseInt(userId));
}

// Belirli bir kullanıcıya mesaj gönderme
export function broadcastToUser(userId, message) {
  try {
    const receiverSocket = clients.get(parseInt(userId));
    
    // Socket varsa ve açıksa mesaj gönder
    if (receiverSocket && receiverSocket.readyState === 1) {
      receiverSocket.send(JSON.stringify(message));
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error broadcasting to user ${userId}:`, error);
    return false;
  }
}

// İki kullanıcı arasındaki mesajı yayınlama
export function broadcastMessage(senderId, receiverId, content, createdAt) {
  // Alıcıya mesaj gönder
  broadcastToUser(receiverId, {
    from: senderId,
    content,
    createdAt,
    isRead: true
  });
  
  // Gönderene onay mesajı
  broadcastToUser(senderId, {
    type: 'message_sent',
    to: receiverId,
    content,
    createdAt,
    status: 'delivered'
  });
}

// Çevrimiçi kullanıcıları listeleme
export function getOnlineUsers() {
  return Array.from(clients.keys());
}

// Kullanıcının çevrimiçi olup olmadığını kontrol etme
export function isUserOnline(userId) {
  const socket = clients.get(parseInt(userId));
  return socket && socket.readyState === 1;
}

// Bağlı kullanıcı sayısını getirme
export function getClientCount() {
  return clients.size;
}

// Kullanıcı durumu değişikliğini tüm kullanıcılara yayınlama
export async function broadcastUserStatusChange(userId, isOnline, username = null) {
  try {
    // Kullanıcı adını al (yoksa)
    if (!username) {
      const users = await getUsersByIdsService([parseInt(userId)]);
      username = users.length > 0 ? users[0].username : `User${userId}`;
    }

    const statusMessage = {
      type: 'user_status',
      userId: parseInt(userId),
      username,
      isOnline,
      lastSeen: isOnline ? null : new Date().toISOString()
    };

    // Tüm bağlı kullanıcılara gönder
    clients.forEach((socket, connectedUserId) => {
      if (socket && socket.readyState === 1) {
        try {
          socket.send(JSON.stringify(statusMessage));
        } catch (error) {
          console.error(`Error sending status update to user ${connectedUserId}:`, error);
        }
      }
    });
  } catch (error) {
    console.error('Error in broadcastUserStatusChange:', error);
  }
}

// Çevrimiçi kullanıcı listesini tüm kullanıcılara yayınlama
export async function broadcastUserList() {
  try {
    const onlineUserIds = getOnlineUsers();
    const users = await getUsersByIdsService(onlineUserIds);
    
    const userListMessage = {
      type: 'user_list',
      users: users.map(user => ({
        userId: user.id,
        username: user.username,
        isOnline: true,
        lastSeen: null
      }))
    };

    // Tüm bağlı kullanıcılara gönder
    clients.forEach((socket, connectedUserId) => {
      if (socket && socket.readyState === 1) {
        try {
          socket.send(JSON.stringify(userListMessage));
        } catch (error) {
          console.error(`Error sending user list to user ${connectedUserId}:`, error);
        }
      }
    });
  } catch (error) {
    console.error('Error in broadcastUserList:', error);
  }
}
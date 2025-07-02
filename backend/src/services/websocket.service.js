const clients = new Map();

export function addClient(userId, socket) {
  clients.set(parseInt(userId), socket);
}

export function removeClient(userId) {
  clients.delete(parseInt(userId));
}

export function getClient(userId) {
  return clients.get(parseInt(userId));
}

export function broadcastToUser(userId, message) {
    try{
        const receiverSocket = clients.get(parseInt(userId));
        console.log(`🔍 User ${userId} socket status:`, receiverSocket ? `readyState=${receiverSocket.readyState}` : 'not found');
        
        if (receiverSocket && receiverSocket.readyState === 1) {
            receiverSocket.send(JSON.stringify(message));
            console.log(`✅ Message successfully sent to user ${userId}`);
            return true;
        } else {
            console.log(`❌ Cannot send to user ${userId}: ${!receiverSocket ? 'socket not found' : `socket readyState=${receiverSocket.readyState} (not OPEN)`}`);
            return false;
        }
    }catch(error){
        console.error(`❌ Error broadcasting to user ${userId}:`, error);
        return false;
    }
}

export function broadcastMessage(senderId, receiverId, content, createdAt) {
    console.log(`📡 Broadcasting message from ${senderId} to ${receiverId}`);
    
    // Send to receiver
    const receiverResult = broadcastToUser(receiverId, {
        from: senderId,
        content,
        createdAt,
        isRead: true
    });
    console.log(`📨 Message sent to receiver (${receiverId}):`, receiverResult ? 'SUCCESS' : 'FAILED');
    
    // Send confirmation to sender (different format to avoid duplication)
    const senderResult = broadcastToUser(senderId, {
        type: 'message_sent',
        to: receiverId,
        content,
        createdAt,
        status: 'delivered'
    });
    console.log(`✅ Confirmation sent to sender (${senderId}):`, senderResult ? 'SUCCESS' : 'FAILED');
}

export function getOnlineUsers() {
  return Array.from(clients.keys());
}

export function isUserOnline(userId) {
  const socket = clients.get(parseInt(userId));
  return socket && socket.readyState === 1;
}

export function getClientCount() {
  return clients.size;
} 
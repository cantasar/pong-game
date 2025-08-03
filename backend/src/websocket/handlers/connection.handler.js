import { addClient, removeClient, broadcastUserStatus } from '../services/client.service.js';
import { undeliveredMessageController } from '../../modules/chat/controller/chat.controller.js';

export async function handleConnection(connection, request) {
  console.log('\nWebSocket connection request received');
  const token = request.headers['sec-websocket-protocol'];
  
  if (!token) {
    return connection.close();
  }
  
  try {
    const user = request.server.jwt.verify(token);
    const userId = user.id;
    console.log(`User ID from token: ${userId}`);
    
    // Add client to global map
    await addClient(userId, connection);
    
    // Broadcast user online status
    await broadcastUserStatus(userId, 'online');
    
    // Send undelivered messages
    await undeliveredMessageController(userId, connection);
    
    return userId;
  } catch (err) {
    console.error('WebSocket authentication failed:', err);
    throw err;
  }
}

export async function handleDisconnect(userId) {
  await removeClient(userId);
  await broadcastUserStatus(userId, 'offline');
  
  console.log(`Client ${userId} disconnected`);
}

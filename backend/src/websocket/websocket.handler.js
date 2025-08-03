import { handleConnection, handleDisconnect } from './handlers/connection.handler.js';
import { routeMessage } from './handlers/message.router.js';

export async function websocketHandler(connection, request) {
  let userId = null;
  
  try {
    // Handle connection and authentication
    userId = await handleConnection(connection, request);
    
    // Handle incoming messages
    connection.on('message', async (message) => {
      try {
        await routeMessage(message, userId);
      } catch (err) {
        console.error('Error routing message:', err);
        connection.send(JSON.stringify({ 
          type: 'error', 
          message: err.message 
        }));
      }
    });

    // Handle disconnect
    connection.on('close', async () => {
      if (userId) {
        await handleDisconnect(userId);
      }
    });
    
  } catch (err) {
    console.error('WebSocket connection failed:', err);
    return connection.close();
  }
}
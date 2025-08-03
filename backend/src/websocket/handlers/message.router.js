import { processChatMessage } from '../../modules/chat/controller/chat.controller.js';

export async function routeMessage(message, userId) {
  const msgStr = message.toString();
  const msgObj = JSON.parse(msgStr);
  const { type } = msgObj;

  switch (type) {
    case 'chat':
    case 'message':
    case 'read':
      // Chat modülüne yönlendir
      await processChatMessage(message, userId);
      break;
    
    case 'game':
      // Game modülüne yönlendir - şimdilik atla
      console.log('Game message received - will be implemented later');
      // const { processGameMessage } = await import('../../modules/game/controller/game.controller.js');
      // await processGameMessage(message, userId);
      break;
    
    default:
      throw new Error(`Unknown message type: ${type}`);
  }
}

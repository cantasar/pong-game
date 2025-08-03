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
      const { handleGameMessage} = await import('../../modules/game/controller/game.controller.js');
      await handleGameMessage(msgObj, userId);
      break;
    
    default:
      throw new Error(`Unknown message type: ${type}`);
  }
}

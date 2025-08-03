import {
  getChatHistoryController,
  markMessagesAsReadController
} from '../controller/chat.controller.js';
import {
  getChatHistorySchema,
  markMessagesAsReadSchema
} from '../schema.js';
import { verifyToken } from '../../../middleware/auth.js';

async function chatRoutes(fastify) {
  // GET /chat/history/:userId - Get chat history with a specific user
  fastify.get('/history/:userId', {
    schema: getChatHistorySchema,
    preHandler: verifyToken,
    handler: getChatHistoryController
  });

  // PUT /chat/mark-read/:userId - Mark messages from a specific user as read
  fastify.put('/mark-read/:userId', {
    schema: markMessagesAsReadSchema,
    preHandler: verifyToken,
    handler: markMessagesAsReadController
  });
}

export default chatRoutes;

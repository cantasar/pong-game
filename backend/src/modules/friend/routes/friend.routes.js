import {
  createFriendRequestSchema,
  getIncomingRequestsSchema,
  acceptRequestSchema,
  rejectRequestSchema,
  getFriendsListSchema,
  getSentRequestsSchema,
  deleteFriendSchema,
  blockFriendSchema,
  unblockFriendSchema
} from '../schema.js';
import {
  createFriendRequest,
  getIncomingRequests,
  acceptRequest,
  rejectRequest,
  getFriendsListController,
  getSentRequestsController,
  deleteFriendController,
  blockFriendController,
  unblockFriendController
} from '../controller/friend.controller.js';
import { verifyToken } from '../../../middleware/auth.js';

export default async function friendRoutes(app, options) {
  // Friend list and requests
  app.get('/', {
    schema: getFriendsListSchema,
    preHandler: [verifyToken]
  }, getFriendsListController);
  
  app.get('/requests/incoming', {
    schema: getIncomingRequestsSchema,
    preHandler: [verifyToken]
  }, getIncomingRequests);
  
  app.get('/requests/sent', {
    schema: getSentRequestsSchema,
    preHandler: [verifyToken]
  }, getSentRequestsController);

  // Friend request actions
  app.post('/add/:targetId', {
    schema: createFriendRequestSchema,
    preHandler: [verifyToken]
  }, createFriendRequest);

  app.post('/:targetId/accept', {
    schema: acceptRequestSchema,
    preHandler: [verifyToken]
  }, acceptRequest);
  
  app.post('/:targetId/reject', {
    schema: rejectRequestSchema,
    preHandler: [verifyToken]
  }, rejectRequest);
  
  app.delete('/:targetId/remove', {
    schema: deleteFriendSchema,
    preHandler: [verifyToken]
  }, deleteFriendController);

  // Block/Unblock actions
  app.post('/:id/block', {
    schema: blockFriendSchema,
    preHandler: [verifyToken]
  }, blockFriendController);
  
  app.post('/:id/unblock', {
    schema: unblockFriendSchema,
    preHandler: [verifyToken]
  }, unblockFriendController);
}
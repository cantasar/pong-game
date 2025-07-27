import { CreateFriendRequestSchema, GetIncomingRequestsSchema, PostAcceptRequestSchema, GetFriendsListSchema } from '../schema.js';
import { CreateFriendRequestController , getIncomingFriendRequestsController, postAcceptRequestController, getFriendsListController} from '../controller/friend.controller.js';
import { GetSentRequestSchema, DeleteFriendSchema, BlockFriendSchema, UnBlockFriendSchema } from '../schema.js';
import { getSentRequestsController, deleteFriendController, blockFriendController, unblockFriendController } from '../controller/friend.controller.js';
import { verifyToken } from '../../../middleware/auth.js';

export default async function friendRoute(app, options) {
    
    app.post('/add/:targetId', {
        schema: CreateFriendRequestSchema,
        preHandler: [verifyToken]
    }, CreateFriendRequestController)

    app.get('/requests/incoming', {
        schema: GetIncomingRequestsSchema,
        preHandler: [verifyToken]
    }, getIncomingFriendRequestsController);
    
    app.post('/:targetId/accept', {
        schema: PostAcceptRequestSchema,
        preHandler: [verifyToken]
    }, postAcceptRequestController)
    
    app.get('/', {
        schema: GetFriendsListSchema,
        preHandler: [verifyToken],
    }, getFriendsListController);
    
    app.get('/requests/send', {
        schema:GetSentRequestSchema,
        preHandler: [verifyToken],
    }, getSentRequestsController);
    
    app.delete('/:targetId/reject', {
        schema: DeleteFriendSchema,
        preHandler: [verifyToken],
    }, deleteFriendController)
    
    app.post('/:id/block', {
        schema: BlockFriendSchema,
        preHandler: [verifyToken]
    }, blockFriendController
    )
    
    app.post('/:id/unblock', {
        schema: UnBlockFriendSchema,
        preHandler: [verifyToken]
    }, unblockFriendController
    )

}
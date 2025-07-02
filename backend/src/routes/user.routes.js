import * as controller from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { searchUsersSchema } from '../schemas/userSchemas.js';

export default async function userRoutes(app, options) {
  
  app.get('/users/search', {
    preHandler: verifyJWT,
    schema: searchUsersSchema,
    handler: controller.searchUsersController
  });

  app.get('/users/:id', {
    preHandler: verifyJWT,
    handler: controller.getUserByIdController
  });

}

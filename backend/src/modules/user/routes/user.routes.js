import { verifyToken } from "../../../middleware/auth.js";
import { 
  getMyProfile, 
  getUserById,
  getUserByUsername,
  updateMyProfile
} from '../controller/user.controller.js';
import { 
  getMyProfileSchema, 
  getUserByIdSchema,
  getUserByUsernameSchema,
  updateProfileSchema
} from '../schema.js';

export default async function userRoutes(app, options) {
  // Get current user profile
  app.get('/me', {
    preHandler: verifyToken,
    schema: getMyProfileSchema
  }, getMyProfile);

  // Update current user profile
  app.put('/me', {
    preHandler: verifyToken,
    schema: updateProfileSchema
  }, updateMyProfile);

  // Get user by id
  app.get('/id/:id', {
    preHandler: verifyToken,
    schema: getUserByIdSchema
  }, getUserById);
  
  // Get user by username (should be last to avoid conflicts)
  app.get('/:username', {
    preHandler: verifyToken,
    schema: getUserByUsernameSchema
  }, getUserByUsername);
}
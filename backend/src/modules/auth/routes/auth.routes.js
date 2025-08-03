import { register, login, googleCallbackHandler, me } from '../controller/auth.controller.js';
import { registerSchema, loginSchema, meSchema } from '../schema.js';
import { verifyToken } from '../../../middleware/auth.js';
import fastifyOauth2 from '@fastify/oauth2';

export default async function authRoutes(app, options) {
  
  app.post('/register', {
    schema: registerSchema
  }, register);

  app.post('/login', {
    schema: loginSchema
  }, login);

  app.get('/me', {
    preHandler: verifyToken,
    schema: meSchema
  }, me);

  // Google OAuth2 entegrasyonu - sadece gerekli env var'lar varsa
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (googleClientId && googleClientSecret) {
    console.log('🔐 Google OAuth enabled');
    
    try {
      await app.register(fastifyOauth2, {
        name: 'googleOAuth2',
        scope: ['profile', 'email'],
        credentials: {
          client: {
            id: googleClientId,
            secret: googleClientSecret
          },
          auth: fastifyOauth2.GOOGLE_CONFIGURATION
        },
        startRedirectPath: '/google',
        callbackUri: 'http://localhost:3000/auth/google/callback'
      });

      // Google OAuth callback route
      app.get('/google/callback', googleCallbackHandler);
      
    } catch (error) {
      console.warn('⚠️ Google OAuth setup failed:', error.message);
    }
  } else {
    console.log('ℹ️ Google OAuth disabled - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }
}
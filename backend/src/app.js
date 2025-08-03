import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySensible from '@fastify/sensible';
import fastifyJWT from '@fastify/jwt';
import websocket from '@fastify/websocket';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';
import authRoutes from './modules/auth/routes/auth.routes.js';
import friendRoutes from './modules/friend/routes/friend.routes.js';
import userRoutes from './modules/user/routes/user.routes.js';
import chatRoutes from './modules/chat/routes/chat.routes.js';
import { websocketHandler } from './websocket/websocket.handler.js';

dotenv.config();

const app = fastify({ logger: true });

// Plugins
await app.register(fastifyCors, { origin: true });
await app.register(fastifySensible);
await app.register(fastifyJWT, { secret: process.env.JWT_SECRET || 'default_secret' });
await app.register(websocket);

// Database
await app.register(initDB);

// Routes
await app.register(authRoutes, { prefix: '/auth' });
await app.register(friendRoutes, { prefix: '/friends' });
await app.register(userRoutes, { prefix: '/users' });
await app.register(chatRoutes, { prefix: '/chat' });
app.get('/ws', { websocket: true }, websocketHandler);


export default app;
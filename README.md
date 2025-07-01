# Pong Game - ft_transcendence

A modern multiplayer Pong game built with a RESTful API backend and a responsive frontend. This project includes user authentication, friend system, real-time chat, and multiplayer game functionality.

## 🏗️ Project Structure

```
pong-game/
├── backend/              # Node.js API Server
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middlewares/  # Custom middleware
│   │   ├── sockets/      # WebSocket handlers
│   │   └── schemas/      # Validation schemas
│   ├── prisma/           # Database schema and migrations
│   └── package.json
└── frontend/             # Vite + TypeScript Frontend
    ├── src/
    │   ├── components/   # UI Components
    │   └── api.ts        # API client
    └── package.json
```

## 🚀 Features

- **User Authentication**: JWT-based authentication system
- **Friend System**: Add/remove friends and friend requests
- **Real-time Chat**: Private messaging between friends
- **Game Management**: Multiplayer Pong game functionality
- **Profile Management**: User profiles with stats
- **RESTful API**: Well-documented API with Swagger
- **Real-time Communication**: WebSocket support for live features

## 🛠️ Tech Stack

### Backend
- **Framework**: Fastify (Node.js)
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens
- **Real-time**: Socket.IO
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Architecture**: Component-based

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

## ⚙️ Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret (Change this in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Origins (comma-separated)
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
```

### Frontend Environment Variables (Optional)

Create a `.env` file in the `frontend/` directory if needed:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3000

# WebSocket URL
VITE_WS_URL=ws://localhost:3000
```

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/cantasar/pong-game
cd pong-game
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Optional: Seed the database (if you have seed data)
# npx prisma db seed
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

## 🏃‍♂️ Running the Application

### Development Mode

You'll need **two terminal windows/tabs** to run both servers:

#### Terminal 1 - Backend Server

```bash
cd backend

# Start the development server with auto-reload
npm run dev

# Or start the production server
npm start
```

The backend server will start on `http://localhost:3000`

#### Terminal 2 - Frontend Server

```bash
cd frontend

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### Production Build

#### Backend Production

```bash
cd backend
npm start
```

#### Frontend Production

```bash
cd frontend

# Build the application
npm run build

# Preview the production build
npm run preview
```

## 📚 API Documentation

Once the backend is running, you can access the API documentation at:
- **Swagger UI**: `http://localhost:3000/docs`

## 🎮 Usage

1. **Start both servers** (backend and frontend)
2. **Open your browser** and navigate to `http://localhost:5173`
3. **Register a new account** or login with existing credentials
4. **Add friends** using their usernames
5. **Start chatting** with your friends in real-time
6. **Play Pong games** with other users

## 🔧 Database Management

### Prisma Commands

```bash
cd backend

# View your data in Prisma Studio
npx prisma studio

# Reset the database (⚠️ This will delete all data)
npx prisma migrate reset

# Apply pending migrations
npx prisma migrate dev

# Generate Prisma client after schema changes
npx prisma generate
```

## 🧪 Testing

```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   - Make sure ports 3000 and 5173 are not being used by other applications
   - Change the ports in the respective configuration files if needed

2. **Database connection issues**
   - Ensure the DATABASE_URL in your `.env` file is correct
   - Run `npx prisma migrate dev` to apply migrations

3. **CORS errors**
   - Check that your frontend URL is included in the backend's CORS configuration
   - Verify the ALLOWED_ORIGINS environment variable

4. **JWT authentication fails**
   - Make sure JWT_SECRET is set in your backend `.env` file
   - Clear browser localStorage and try logging in again

### Reset Everything

If you encounter persistent issues:

```bash
# Reset backend
cd backend
rm -rf node_modules
npm install
npx prisma migrate reset
npx prisma generate

# Reset frontend  
cd frontend
rm -rf node_modules
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Happy Gaming! 🎮🏓**

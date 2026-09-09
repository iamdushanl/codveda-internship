const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./src/app');
const config = require('./src/config');
const connectDB = require('./src/config/db');
const User = require('./src/models/user');

const startServer = async () => {
  // 1. Connect to Database
  await connectDB();

  // 2. Create HTTP Server
  const server = http.createServer(app);

  // 3. Setup Socket.IO
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*", // Depending on your production config, you might want to restrict this later
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
    }
  });

  // Socket.IO JWT Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach decoded user to socket.user
      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket authentication failed:', err.message);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?._id?.toString() || socket.user?.id;
    if (userId) {
      const userRoom = `user:${userId}`;
      socket.join(userRoom);
      console.log(`🔌 Client connected: ${socket.id} (User: ${userId}) joined room: ${userRoom}`);
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  // Inject io into app to be used in routes/controllers
  app.set('io', io);

  
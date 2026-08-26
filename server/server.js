const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const config = require('./src/config');
const connectDB = require('./src/config/db');

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

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  // Inject io into app to be used in routes/controllers
  app.set('io', io);

  // 4. Start Server
  server.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
  });
};

startServer();

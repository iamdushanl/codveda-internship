const app = require('./src/app');
const config = require('./src/config');
const connectDB = require('./src/config/db');

const startServer = async () => {
  // 1. Connect to Database
  await connectDB();

  // 2. Start Express App
  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
  });
};

startServer();

require('dotenv').config();

const dns = require('dns');
const mongoose = require('mongoose');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const MONGO_CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
};

const shouldTryDirectMongoFallback = (error) => {
  if (!error || !error.message) {
    return false;
  }

  return (
    error.message.includes('querySrv') ||
    error.message.includes('ENOTFOUND') ||
    error.message.includes('ETIMEOUT')
  );
};

const buildDirectMongoUriFromSrv = async (srvUri) => {
  const parsed = new URL(srvUri);

  if (parsed.protocol !== 'mongodb+srv:') {
    return null;
  }

  const srvHost = `_mongodb._tcp.${parsed.hostname}`;
  let srvRecords;

  try {
    srvRecords = await dns.promises.resolveSrv(srvHost);
  } catch (error) {
    const publicResolver = new dns.promises.Resolver();
    publicResolver.setServers(['8.8.8.8', '1.1.1.1']);
    srvRecords = await publicResolver.resolveSrv(srvHost);
  }

  if (!srvRecords || srvRecords.length === 0) {
    return null;
  }

  const hosts = srvRecords.map((record) => `${record.name}:${record.port}`).join(',');
  const databasePath = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '/';

  const searchParams = new URLSearchParams(parsed.searchParams);

  if (!searchParams.has('tls') && !searchParams.has('ssl')) {
    searchParams.set('tls', 'true');
  }

  if (!searchParams.has('authSource')) {
    searchParams.set('authSource', 'admin');
  }

  let authPart = '';
  if (parsed.username) {
    authPart = parsed.username;
    if (parsed.password) {
      authPart += `:${parsed.password}`;
    }
    authPart += '@';
  }

  const queryString = searchParams.toString();
  return `mongodb://${authPart}${hosts}${databasePath}${queryString ? `?${queryString}` : ''}`;
};

const startServer = async () => {
  let isMongoConnected = false;

  if (MONGO_URI) {
    try {
      await mongoose.connect(MONGO_URI, MONGO_CONNECT_OPTIONS);
      isMongoConnected = true;
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);

      if (MONGO_URI.startsWith('mongodb+srv://') && shouldTryDirectMongoFallback(error)) {
        try {
          console.log('Retrying MongoDB connection with direct host seedlist...');
          const directUri = await buildDirectMongoUriFromSrv(MONGO_URI);

          if (directUri) {
            await mongoose.connect(directUri, MONGO_CONNECT_OPTIONS);
            isMongoConnected = true;
            console.log('MongoDB connected successfully using direct host seedlist');
          }
        } catch (fallbackError) {
          console.error('MongoDB direct-host fallback failed:', fallbackError.message);
        }
      }

      if (!isMongoConnected) {
        console.log('Starting server in fallback mode without database connection.');
      }
    }
  } else {
    console.log('No MongoDB URI configured. Starting server in fallback mode without database connection.');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app;

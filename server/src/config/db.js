const mongoose = require('mongoose');
const dns = require('dns');
const config = require('./index');

/**
 * Helper function to determine if we should try the direct connection fallback.
 */
const shouldTryDirectMongoFallback = (error) => {
  if (!error || !error.message) return false;
  return (
    error.message.includes('querySrv') ||
    error.message.includes('ENOTFOUND') ||
    error.message.includes('ETIMEOUT')
  );
};

/**
 * Parses a mongodb+srv:// URI and resolves the SRV records directly using DNS.
 */
const buildDirectMongoUriFromSrv = async (srvUri) => {
  const parsed = new URL(srvUri);
  if (parsed.protocol !== 'mongodb+srv:') return null;

  const srvHost = `_mongodb._tcp.${parsed.hostname}`;
  let srvRecords;

  try {
    srvRecords = await dns.promises.resolveSrv(srvHost);
  } catch (error) {
    const publicResolver = new dns.promises.Resolver();
    publicResolver.setServers(['8.8.8.8', '1.1.1.1']);
    srvRecords = await publicResolver.resolveSrv(srvHost);
  }

  if (!srvRecords || srvRecords.length === 0) return null;

  const hosts = srvRecords.map((record) => `${record.name}:${record.port}`).join(',');
  const databasePath = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '/';
  const searchParams = new URLSearchParams(parsed.searchParams);

  if (!searchParams.has('tls') && !searchParams.has('ssl')) searchParams.set('tls', 'true');
  if (!searchParams.has('authSource')) searchParams.set('authSource', 'admin');

  let authPart = '';
  if (parsed.username) {
    authPart = parsed.username;
    if (parsed.password) authPart += `:${parsed.password}`;
    authPart += '@';
  }

  const queryString = searchParams.toString();
  return `mongodb://${authPart}${hosts}${databasePath}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Connects to MongoDB with fallback logic.
 * 
 * Why do we separate this?
 * 1. It keeps server.js clean.
 * 2. If we need to write integration tests, we can easily import this file to connect to a test database.
 */
const connectDB = async () => {
  if (!config.mongo.uri) {
    console.warn('⚠️ No MongoDB URI configured. Starting without DB.');
    return false;
  }

  try {
    const conn = await mongoose.connect(config.mongo.uri, config.mongo.options);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);

    // Fallback logic for DNS issues (common with some ISPs and MongoDB Atlas)
    if (config.mongo.uri.startsWith('mongodb+srv://') && shouldTryDirectMongoFallback(error)) {
      console.log('🔄 Retrying MongoDB connection with direct host seedlist...');
      try {
        const directUri = await buildDirectMongoUriFromSrv(config.mongo.uri);
        if (directUri) {
          const conn = await mongoose.connect(directUri, config.mongo.options);
          console.log(`✅ MongoDB connected (fallback): ${conn.connection.host}`);
          return true;
        }
      } catch (fallbackError) {
        console.error(`❌ MongoDB direct-host fallback failed: ${fallbackError.message}`);
      }
    }
    
    return false;
  }
};

module.exports = connectDB;

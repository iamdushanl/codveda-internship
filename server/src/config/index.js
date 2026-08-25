require('dotenv').config();

/**
 * Centralised configuration object.
 * 
 * Why do we do this?
 * 1. Single source of truth for all environment variables.
 * 2. If an env variable name changes, we only update it here.
 * 3. We can add default values or validation logic easily.
 */
const config = {
  port: process.env.PORT || 5000,
  mongo: {
    uri: process.env.MONGO_URI || process.env.MONGODB_URI,
    options: {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    },
  },
};

module.exports = config;

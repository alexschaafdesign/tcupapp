// migrate-config.cjs
require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development' });

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 25060,
      searchPath: ['development', 'public'],
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: './db/migrations',
      schemaName: 'development'
    }
  },
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 25060,
      searchPath: ['production', 'public'],
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: './db/migrations',
      schemaName: 'production'
    }
  }
};
// db-migrate.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const dbUrl = `postgres://${process.env.PROD_DB_USER}:${process.env.PROD_DB_PASSWORD}@${process.env.PROD_DB_HOST}:${process.env.PROD_DB_PORT}/${process.env.PROD_DB_NAME}?sslmode=require`;

export default {
  connectionString: dbUrl,
  schema: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  ssl: {
    rejectUnauthorized: false
  }
};
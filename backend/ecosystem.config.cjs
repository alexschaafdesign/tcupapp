module.exports = {
  apps: [{
    name: 'tcup-backend',
    script: './server.js',
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000,
      path: '.env.development'
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3001,
      path: '.env.staging'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3002,
      path: '.env.production'
    }
  }]
};
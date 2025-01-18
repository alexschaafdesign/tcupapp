module.exports = {
  apps: [{
    name: 'tcup-backend',
    script: './server.js',
    env_development: {
      NODE_ENV: 'development',
      path: '.env.development'
    },
    env_production: {
      NODE_ENV: 'production',
      path: '.env.production'
    }
  }]
};
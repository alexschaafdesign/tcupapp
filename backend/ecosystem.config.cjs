module.exports = {
  apps: [
    {
      name: 'tcup-backend-prod',
      script: './server.js',
      env: {
        NODE_ENV: 'production',
        DOTENV_CONFIG_PATH: '/var/www/tcup-production/backend/.env.production',
        PORT: 3002
      }
    },
    {
      name: 'tcup-backend-staging',
      script: './server.js',
      env: {
        NODE_ENV: 'production',
        DOTENV_CONFIG_PATH: '/var/www/tcup-staging/backend/.env.production',
        PORT: 3001
      }
    }
  ]
};
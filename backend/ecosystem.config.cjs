module.exports = {
  apps: [
    {
      name: 'tcup-backend-prod',
      script: './server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    },
    {
      name: 'tcup-backend-staging',
      script: './server.js',
      env: {
        NODE_ENV: 'staging',
        PORT: 3001
      }
    }
  ]
};
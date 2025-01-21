module.exports = {
  apps: [
    {
      name: 'tcup-backend-dev',
      script: './server.js',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        path: '.env.development'
      }
    },
    {
      name: 'tcup-backend-staging',
      script: './server.js',
      env: {
        NODE_ENV: 'staging',
        PORT: 3001,
        path: '.env.staging'
      }
    },
    {
      name: 'tcup-backend-prod',
      script: './server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        path: '.env.production'
      }
    }
  ]
}
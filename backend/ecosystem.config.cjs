module.exports = {
  apps: [
    {
      name: 'tcup-backend-prod',
      script: './server.js',
      cwd: '/var/www/tcup-production/backend',
      env: {
        NODE_ENV: 'production',
        APP_ENV: 'production',
        DOTENV_CONFIG_PATH: '/var/www/tcup-production/backend/.env.production',
        PORT: 3002
      },
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/tcup-backend-prod-error.log',
      out_file: '/var/log/pm2/tcup-backend-prod-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'tcup-backend-staging',
      script: './server.js',
      cwd: '/var/www/tcup-staging/backend',
      env: {
        NODE_ENV: 'staging',  // Changed from 'production' to 'staging'
        APP_ENV: 'staging',
        DOTENV_CONFIG_PATH: '/var/www/tcup-staging/backend/.env.staging', // Changed to .env.staging
        PORT: 3004
      },
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/tcup-backend-staging-error.log',
      out_file: '/var/log/pm2/tcup-backend-staging-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
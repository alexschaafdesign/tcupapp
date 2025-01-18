module.exports = {
  apps: [{
    name: "tcup-backend",
    script: "./server.js",
    env_production: {
      NODE_ENV: "production"
    },
    env_file: ".env.production"
  }]
}

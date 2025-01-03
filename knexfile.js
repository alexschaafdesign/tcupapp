// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1', // Localhost
      user: 'aschaaf',
      password: 'notthesame',
      database: 'tcup_db',
    },
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: '159.203.63.94', // Cloud database host
      user: 'aschaaf',
      password: 'notthesame',
      database: 'tcup_db',
      ssl: { rejectUnauthorized: false }, // If using SSL
    },
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
};
exports.up = (pgm) => {
  pgm.sql(`
    CREATE SCHEMA IF NOT EXISTS production;
    CREATE SCHEMA IF NOT EXISTS development;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP SCHEMA IF EXISTS development CASCADE;
    DROP SCHEMA IF EXISTS production CASCADE;
  `);
};
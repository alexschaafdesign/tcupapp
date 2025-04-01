/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('scraper_logs', function(table) {
    table.increments('id').primary();
    table.string('scraper_name').notNullable();
    table.timestamp('run_at').defaultTo(knex.fn.now());
    table.integer('added_count').defaultTo(0);
    table.integer('duplicate_count').defaultTo(0);
    table.integer('skipped_count').defaultTo(0);
    table.json('added_shows').defaultTo('[]');
    table.json('errors').defaultTo('[]');
    table.json('raw_output').defaultTo('{}');
  })
  .createTable('scraper_show_additions', function(table) {
    table.increments('id').primary();
    table.integer('scraper_log_id').references('id').inTable('scraper_logs').onDelete('CASCADE');
    table.integer('show_id').references('id').inTable('shows').onDelete('CASCADE');
    table.timestamp('added_at').defaultTo(knex.fn.now());
    table.string('show_name');
    table.string('venue_name');
    table.timestamp('show_date');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('scraper_show_additions')
    .dropTableIfExists('scraper_logs');
};
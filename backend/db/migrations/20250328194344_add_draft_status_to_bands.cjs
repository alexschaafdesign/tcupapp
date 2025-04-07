exports.up = function(knex) {
    return knex.schema.withSchema(knex.client.config.migrations.schemaName)
      .table('bands_new', table => {
        table.boolean('is_draft').defaultTo(true);
        table.jsonb('completion_status').defaultTo('{}');
      });
  };
  
  exports.down = function(knex) {
    return knex.schema.withSchema(knex.client.config.migrations.schemaName)
      .table('bands_new', table => {
        table.dropColumn('completion_status');
        table.dropColumn('is_draft');
      });
  };

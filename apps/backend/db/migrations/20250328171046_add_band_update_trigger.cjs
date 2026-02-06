exports.up = function(knex) {
    return knex.raw(`
      CREATE OR REPLACE FUNCTION ${knex.client.config.migrations.schemaName}.update_modified_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
  
      CREATE TRIGGER update_bands_new_modtime
      BEFORE UPDATE ON ${knex.client.config.migrations.schemaName}.bands_new
      FOR EACH ROW
      EXECUTE FUNCTION ${knex.client.config.migrations.schemaName}.update_modified_column();
    `);
  };
  
  exports.down = function(knex) {
    return knex.raw(`
      DROP TRIGGER IF EXISTS update_bands_new_modtime ON ${knex.client.config.migrations.schemaName}.bands_new;
      DROP FUNCTION IF EXISTS ${knex.client.config.migrations.schemaName}.update_modified_column();
    `);
  };
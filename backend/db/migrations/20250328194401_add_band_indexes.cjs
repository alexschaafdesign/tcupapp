exports.up = function(knex) {
    return knex.schema.withSchema(knex.client.config.migrations.schemaName)
      .raw(`
        CREATE INDEX IF NOT EXISTS idx_bands_new_slug ON ${knex.client.config.migrations.schemaName}.bands_new(slug);
        CREATE INDEX IF NOT EXISTS idx_bands_new_custom_slug ON ${knex.client.config.migrations.schemaName}.bands_new(custom_slug);
        CREATE INDEX IF NOT EXISTS idx_band_members_band_id ON ${knex.client.config.migrations.schemaName}.band_members(band_id);
        CREATE INDEX IF NOT EXISTS idx_band_genres_band_id ON ${knex.client.config.migrations.schemaName}.band_genres(band_id);
        CREATE INDEX IF NOT EXISTS idx_band_releases_band_id ON ${knex.client.config.migrations.schemaName}.band_releases(band_id);
      `);
  };
  
  exports.down = function(knex) {
    return knex.schema.withSchema(knex.client.config.migrations.schemaName)
      .raw(`
        DROP INDEX IF EXISTS ${knex.client.config.migrations.schemaName}.idx_bands_new_slug;
        DROP INDEX IF EXISTS ${knex.client.config.migrations.schemaName}.idx_bands_new_custom_slug;
        DROP INDEX IF EXISTS ${knex.client.config.migrations.schemaName}.idx_band_members_band_id;
        DROP INDEX IF EXISTS ${knex.client.config.migrations.schemaName}.idx_band_genres_band_id;
        DROP INDEX IF EXISTS ${knex.client.config.migrations.schemaName}.idx_band_releases_band_id;
      `);
  };
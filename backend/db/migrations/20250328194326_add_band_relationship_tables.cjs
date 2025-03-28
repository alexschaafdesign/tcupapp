exports.up = function(knex) {
    return knex.schema.withSchema(knex.client.config.migrations.schemaName)
      // Band admins table
      .createTable('band_admins', table => {
        table.increments('id').primary();
        table.integer('band_id').references('id')
           .inTable(`${knex.client.config.migrations.schemaName}.bands_new`)
           .onDelete('CASCADE');
        table.string('auth0_id', 255).notNullable();
        table.string('role', 50).defaultTo('admin');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        
        // Add index on auth0_id for faster lookups
        table.index(['auth0_id'], 'idx_band_admins_auth0_id');
      })
      
      // Member instruments table
      .createTable('band_member_instruments', table => {
        table.increments('id').primary();
        table.integer('member_id').references('id')
           .inTable(`${knex.client.config.migrations.schemaName}.band_members`)
           .onDelete('CASCADE');
        table.string('instrument', 100).notNullable();
      })
      
      // Performance preferences
      .createTable('band_performance_preferences', table => {
        table.increments('id').primary();
        table.integer('band_id').references('id')
           .inTable(`${knex.client.config.migrations.schemaName}.bands_new`)
           .onDelete('CASCADE');
        table.string('venue_type', 100).notNullable();
      })
      
      // Band influences
      .createTable('band_influences', table => {
        table.increments('id').primary();
        table.integer('band_id').references('id')
           .inTable(`${knex.client.config.migrations.schemaName}.bands_new`)
           .onDelete('CASCADE');
        table.string('influence', 255).notNullable();
      })
      
      // Audio/video embeds
      .createTable('band_media_embeds', table => {
        table.increments('id').primary();
        table.integer('band_id').references('id')
           .inTable(`${knex.client.config.migrations.schemaName}.bands_new`)
           .onDelete('CASCADE');
        table.string('media_type', 50).notNullable();
        table.text('embed_code').notNullable();
        table.string('description', 255);
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
  };
  
  exports.down = function(knex) {
    return knex.schema.withSchema(knex.client.config.migrations.schemaName)
      .dropTableIfExists('band_media_embeds')
      .dropTableIfExists('band_influences')
      .dropTableIfExists('band_performance_preferences')
      .dropTableIfExists('band_member_instruments')
      .dropTableIfExists('band_admins');
  };
exports.up = function(knex) {
    // First create the schema if it doesn't exist
    return knex.raw(`CREATE SCHEMA IF NOT EXISTS ${knex.client.config.migrations.schemaName}`)
      .then(() => {
        // Create the table in the specified schema
        return knex.schema.withSchema(knex.client.config.migrations.schemaName)
          .createTable('bands_new', table => {
            table.increments('id').primary();
            table.string('name', 255).notNullable();
            table.string('slug', 100).unique().notNullable();
            table.string('location', 255).notNullable();
            table.integer('year_formed');
            table.text('origin_story');
            table.text('bio');
            table.string('profile_image', 255);
            table.boolean('looking_for_members').defaultTo(false);
            table.string('play_shows', 50);
            table.text('performance_notes');
            table.boolean('has_merch').defaultTo(false);
            table.string('merch_url', 255);
            table.string('bandemail', 255);
            
            // Profile customization
            table.string('custom_slug', 100).unique();
            table.string('profile_theme', 50).defaultTo('default');
            table.string('header_layout', 50).defaultTo('classic');
            table.string('background_pattern', 50).defaultTo('none');
            table.string('background_image', 255);
            
            // JSON fields
            table.jsonb('music_links').defaultTo('{}');
            table.jsonb('social_links').defaultTo('{}');
            
            // Timestamps
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
          })
          
          // Continue with other tables
          .createTable('band_members', table => {
            // Use explicit schema references for foreign keys
            table.increments('id').primary();
            table.integer('band_id').references('id')
               .inTable(`${knex.client.config.migrations.schemaName}.bands_new`)
               .onDelete('CASCADE');
            table.string('name', 100).notNullable();
            table.string('role', 100);
            table.text('bio');
            table.timestamp('created_at').defaultTo(knex.fn.now());
          })
          
          .createTable('band_open_positions', table => {
            table.increments('id').primary();
            table.integer('band_id').references('id')
               .inTable(`${knex.client.config.migrations.schemaName}.bands_new`)
               .onDelete('CASCADE');
            table.string('position', 100).notNullable();
          })
          
          .createTable('band_genres', table => {
            table.increments('id').primary();
            table.integer('band_id').references('id')
               .inTable(`${knex.client.config.migrations.schemaName}.bands_new`)
               .onDelete('CASCADE');
            table.string('genre', 100).notNullable();
          })
          
          .createTable('band_releases', table => {
            table.increments('id').primary();
            table.integer('band_id').references('id')
               .inTable(`${knex.client.config.migrations.schemaName}.bands_new`)
               .onDelete('CASCADE');
            table.string('title', 255).notNullable();
            table.date('release_date');
            table.string('type', 50);
            table.string('link', 255);
            table.timestamp('created_at').defaultTo(knex.fn.now());
          })
          
          .createTable('band_merch_types', table => {
            table.increments('id').primary();
            table.integer('band_id').references('id')
               .inTable(`${knex.client.config.migrations.schemaName}.bands_new`)
               .onDelete('CASCADE');
            table.string('merch_type', 100).notNullable();
          })
          
          .createTable('band_images', table => {
            table.increments('id').primary();
            table.integer('band_id').references('id')
               .inTable(`${knex.client.config.migrations.schemaName}.bands_new`)
               .onDelete('CASCADE');
            table.string('image_url', 255).notNullable();
            table.string('caption', 255);
            table.timestamp('created_at').defaultTo(knex.fn.now());
          })
          
          .createTable('band_featured_content', table => {
            table.increments('id').primary();
            table.integer('band_id').references('id')
               .inTable(`${knex.client.config.migrations.schemaName}.bands_new`)
               .onDelete('CASCADE');
            table.string('content_type', 50).notNullable();
            table.integer('content_id');
            table.integer('display_order');
          })
          
          .createTable('band_profile_badges', table => {
            table.increments('id').primary();
            table.integer('band_id').references('id')
               .inTable(`${knex.client.config.migrations.schemaName}.bands_new`)
               .onDelete('CASCADE');
            table.string('badge_type', 50).notNullable();
          })
          
          .createTable('band_group_sizes', table => {
            table.increments('id').primary();
            table.integer('band_id').references('id')
               .inTable(`${knex.client.config.migrations.schemaName}.bands_new`)
               .onDelete('CASCADE');
            table.string('size_category', 50).notNullable();
          });
      });
  };
  
  exports.down = function(knex) {
    // Drop tables in reverse order
    return knex.schema.withSchema(knex.client.config.migrations.schemaName)
      .dropTableIfExists('band_group_sizes')
      .dropTableIfExists('band_profile_badges')
      .dropTableIfExists('band_featured_content')
      .dropTableIfExists('band_images')
      .dropTableIfExists('band_merch_types')
      .dropTableIfExists('band_releases')
      .dropTableIfExists('band_genres')
      .dropTableIfExists('band_open_positions')
      .dropTableIfExists('band_members')
      .dropTableIfExists('bands_new');
  };
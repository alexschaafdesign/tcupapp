/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const tableExists = await knex.schema.hasTable('tcupbands');
  
    if (!tableExists) {
      return knex.schema.createTable('tcupbands', (table) => {
        table.increments('id').primary();
        table.text('name').notNullable();
        table.jsonb('social_links');
        table.specificType('genre', 'text[]');
        table.text('bandemail');
        table.string('play_shows', 20);
        table.specificType('group_size', 'text[]').defaultTo('{}');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.jsonb('music_links');
      });
    } else {
      // Check schema for mismatches
      const schema = await knex('information_schema.columns')
        .select('column_name', 'data_type')
        .where('table_name', 'tcupbands');
  
      // Example check (you can add more detailed checks here)
      const expectedSchema = [
        { column_name: 'id', data_type: 'integer' },
        { column_name: 'name', data_type: 'text' },
        { column_name: 'social_links', data_type: 'jsonb' },
        { column_name: 'genre', data_type: 'ARRAY' },
        { column_name: 'bandemail', data_type: 'text' },
        { column_name: 'play_shows', data_type: 'character varying' },
        { column_name: 'group_size', data_type: 'ARRAY' },
        { column_name: 'created_at', data_type: 'timestamp without time zone' },
        { column_name: 'music_links', data_type: 'jsonb' },
      ];
  
      const mismatches = expectedSchema.filter(
        (expectedColumn) =>
          !schema.some(
            (actualColumn) =>
              actualColumn.column_name === expectedColumn.column_name &&
              actualColumn.data_type === expectedColumn.data_type
          )
      );
  
      if (mismatches.length > 0) {
        console.warn(
          'Schema mismatches detected for tcupbands table:',
          mismatches
        );
        // Optional: Handle mismatches, e.g., throw an error or fix schema
      }
    }
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists('tcupbands');
  };
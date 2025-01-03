/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const tableExists = await knex.schema.hasTable('shows');
  
    if (!tableExists) {
      // Create the table if it does not exist
      return knex.schema.createTable('shows', (table) => {
        table.increments('id').primary(); // Auto-incrementing primary key
        table.string('event_link', 500); // Matches character varying(500)
        table.text('flyer_image'); // Matches text
        table.timestamp('start', { useTz: false }); // Matches timestamp without time zone
        table.integer('venue_id'); // Matches integer
        table.text('bands'); // Matches text
      });
    } else {
      // Check if the existing schema matches the expected schema
      const schema = await knex('information_schema.columns')
        .select('column_name', 'data_type')
        .where('table_name', 'shows');
  
      const expectedSchema = [
        { column_name: 'id', data_type: 'integer' },
        { column_name: 'event_link', data_type: 'character varying' },
        { column_name: 'flyer_image', data_type: 'text' },
        { column_name: 'start', data_type: 'timestamp without time zone' },
        { column_name: 'venue_id', data_type: 'integer' },
        { column_name: 'bands', data_type: 'text' },
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
          'Schema mismatches detected for the shows table:',
          mismatches
        );
        // Optional: Handle mismatches, e.g., alter table or throw an error
      }
    }
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists('shows');
  };
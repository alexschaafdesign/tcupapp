/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const tableExists = await knex.schema.hasTable('venues');
  
    if (!tableExists) {
      // Create the table if it does not exist
      return knex.schema.createTable('venues', (table) => {
        table.increments('id').primary(); // Auto-incrementing primary key
        table.string('venue', 100); // Matches character varying(100)
        table.string('location', 150); // Matches character varying(150)
        table.text('capacity'); // Matches text
        table.text('cover_image'); // Matches text
      });
    } else {
      // Check if the schema matches the expected structure
      const schema = await knex('information_schema.columns')
        .select('column_name', 'data_type', 'character_maximum_length')
        .where('table_name', 'venues');
  
      const expectedSchema = [
        { column_name: 'id', data_type: 'integer' },
        { column_name: 'venue', data_type: 'character varying', character_maximum_length: 100 },
        { column_name: 'location', data_type: 'character varying', character_maximum_length: 150 },
        { column_name: 'capacity', data_type: 'text' },
        { column_name: 'cover_image', data_type: 'text' },
      ];
  
      const mismatches = expectedSchema.filter((expectedColumn) =>
        !schema.some(
          (actualColumn) =>
            actualColumn.column_name === expectedColumn.column_name &&
            actualColumn.data_type === expectedColumn.data_type &&
            actualColumn.character_maximum_length === expectedColumn.character_maximum_length
        )
      );
  
      if (mismatches.length > 0) {
        console.warn(
          'Schema mismatches detected for the venues table:',
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
    return knex.schema.dropTableIfExists('venues');
  };
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const tableExists = await knex.schema.hasTable('peoplebands');

    if (!tableExists) {
        // Create the table if it does not exist
        return knex.schema.createTable('peoplebands', (table) => {
            table.increments('id').primary(); // Auto-incrementing primary key
            table.integer('person_id').notNullable(); // Matches integer and Not NULL
            table.integer('band_id').notNullable(); // Matches integer and Not NULL
            table.timestamp('created_at', { useTz: false }).defaultTo(knex.fn.now()); // Matches timestamp without time zone with default now()
        });
    } else {
        console.log("Table 'peoplebands' already exists. Migration skipped.");
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('peoplebands');
};
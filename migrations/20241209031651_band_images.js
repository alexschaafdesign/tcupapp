/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const tableExists = await knex.schema.hasTable('band_images');

    if (!tableExists) {
        // Create the table if it does not exist
        return knex.schema.createTable('band_images', (table) => {
            table.increments('id').primary(); // Auto-incrementing primary key
            table.integer('band_id').notNullable(); // Matches integer and Not NULL
            table.text('image_path').notNullable(); // Matches text and Not NULL
            table.boolean('is_profile').defaultTo(false); // Matches boolean with default false
            table.timestamp('created_at', { useTz: false }).defaultTo(knex.fn.now()); // Matches timestamp without time zone with default now()
        });
    } else {
        console.log("Table 'band_images' already exists. Migration skipped.");
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('band_images');
};
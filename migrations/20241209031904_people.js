/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const tableExists = await knex.schema.hasTable('people');

    if (!tableExists) {
        // Create the table if it does not exist
        return knex.schema.createTable('people', (table) => {
            table.increments('id').primary(); // Auto-incrementing primary key
            table.text('name').notNullable(); // Text column for 'name', Not NULL
            table.text('email').unique(); // Unique text column for 'email'
            table.text('bio'); // Text column for 'bio'
            table.text('profile_photo'); // Text column for 'profile_photo'
            table.timestamp('created_at', { useTz: false }).defaultTo(knex.fn.now()); // 'created_at' with default now()
            table.timestamp('updated_at', { useTz: false }).defaultTo(knex.fn.now()); // 'updated_at' with default now()
        });
    } else {
        console.log("Table 'people' already exists. Migration skipped.");
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('people');
};
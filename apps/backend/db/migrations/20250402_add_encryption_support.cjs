/**
 * Migration to add end-to-end encryption support for direct messages
 */
exports.up = async function(knex) {
    // Create the update timestamp function if it doesn't exist
    const functionExists = await knex.raw(`
      SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_updated_at_column'
      );
    `);
    
    if (!functionExists.rows[0].exists) {
      await knex.raw(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);
    }
  
    // Create the encryption keys table
    await knex.schema.createTable('user_encryption_keys', table => {
      table.increments('id').primary();
      table.text('auth0_id').notNullable().unique();
      table.text('public_key').notNullable();
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    });
  
    // Create index on auth0_id for faster lookups
    await knex.raw(`
      CREATE INDEX idx_user_encryption_keys_auth0_id ON user_encryption_keys(auth0_id);
    `);
  
    // Create the trigger for automatic timestamp updates
    await knex.raw(`
      CREATE TRIGGER update_user_encryption_keys_updated_at
      BEFORE UPDATE ON user_encryption_keys
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  
    // Add encryption fields to the direct_messages table
    await knex.schema.alterTable('direct_messages', table => {
      table.boolean('encrypted').defaultTo(false);
      table.text('nonce');
    });
  
    console.log('Successfully added encryption support to database');
  };
  
  exports.down = async function(knex) {
    // Remove the trigger
    await knex.raw(`DROP TRIGGER IF EXISTS update_user_encryption_keys_updated_at ON user_encryption_keys;`);
    
    // Remove encryption fields from direct_messages
    await knex.schema.alterTable('direct_messages', table => {
      table.dropColumn('encrypted');
      table.dropColumn('nonce');
    });
  
    // Drop the encryption keys table
    await knex.schema.dropTableIfExists('user_encryption_keys');
  
    // We don't drop the function as it might be used by other tables
    console.log('Successfully removed encryption support from database');
  };
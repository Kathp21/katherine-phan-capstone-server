/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('itinerary', (table) => {
        table.increments('itinerary_id').primary();
        table.uuid('recommendation_id').notNullable();
        table.string('day_string').notNullable();
        table.string('location').notNullable();
        table.string('duration').notNullable();
        table.string('budget').notNullable();
        table.string('description', 1000).alter();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('itinerary')
};

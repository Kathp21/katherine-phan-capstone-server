// /**
//  * @param { import("knex").Knex } knex
//  * @returns { Promise<void> }
//  */
// exports.up = function(knex) {
//     return knex.schema.table('itinerary', function(table) {
//         table.uuid('recommendation_id').notNullable();
//     });
// };

// /**
//  * @param { import("knex").Knex } knex
//  * @returns { Promise<void> }
//  */
// exports.down = function(knex) {
//     return knex.schema.table('itinerary', function(table) {
//         table.dropColumn('recommendation_id');
//     });
// };

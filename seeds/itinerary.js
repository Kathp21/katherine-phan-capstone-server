/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('itinerary').del()
  await knex('itinerary').insert([
    {
      id: 1, 
      day_string: '<A string that represents the day of the trip>',
      location: '<A more specific area within the destination',
      duration: '<string>',
      budget: `dollar amount with the dollar sign. The budget required for activities for this specific day`,
      description: `description of the activities that you'll be doing`
    },
    // {id: 2, colName: 'rowValue2'},
    // {id: 3, colName: 'rowValue3'}
  ]);
};

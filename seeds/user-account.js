/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del()
  await knex('users').insert([
    {
      id: 1, 
      user_name: 'rowValue1',
      password: '',
      email: '',
    },
    {
      id: 2,
      user_name: 'rowValue2',
      password: '',
      email: '',
    }
  ]);
};

const knex = require('./knexConfig');

knex.raw('SELECT 1')
  .then(() => {
    console.log('Knex is configured correctly');
  })
  .catch((err) => {
    console.error('Knex configuration error:', err);
  });

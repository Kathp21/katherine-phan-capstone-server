const environment = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[environment];
console.log(`Loaded configuration for environment: ${environment}`);
console.log(config);

if (!config) {
  throw new Error(`Knex configuration not found for environment: ${environment}`);
}

const knex = require('knex')(config);

knex.raw('SELECT 1')
  .then(() => {
    console.log('Knex is configured correctly');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Knex configuration error:', err);
    process.exit(1);
  });

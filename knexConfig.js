const environment = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[environment];
console.log(`Loaded configuration for environment: ${environment}`); 
console.log(config)

if (!config) {
    throw new Error(`Knex configuration not found for environment: ${environment}`);  
}

console.log('Full Knex Configuration:', config);

const knex = require('knex')(config);
console.log('Knex instance:', knex);

module.exports = knex;

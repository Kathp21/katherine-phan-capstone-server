const environment = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[environment];

if (!config) {
    throw new Error(`Knex configuration not found for environment: ${environment}`);  
}

const knex = require('knex')(config);


module.exports = knex;

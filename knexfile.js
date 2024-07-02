// require('dotenv').config();

//  const config = {
//   development: {
//     client: "mysql2",
//     connection: {
//       host: process.env.DB_HOST,
//       port: process.env.DB_PORT,  
//       database: process.env.DB_LOCAL_DBNAME,
//       user: process.env.DB_LOCAL_USER,
//       password: process.env.DB_LOCAL_PASSWORD,
//       charset: "utf8",
//     }
//   },
//   production: {
//     client: "mysql2",
//     connection: {
//       host: process.env.AIVEN_DB_HOST,
//       port: process.env.AIVEN_DB_PORT,
//       database: process.env.AIVEN_DB_NAME,
//       user: process.env.AIVEN_DB_USER,
//       password: process.env.AIVEN_DB_PASSWORD,
//       ssl: {
//         rejectUnauthorized: false
//       }
//     }
//   },
// }

// // migrations:{
// //   directory: __dirname + '/migrations',
// // },
// // seeds:{
// //   directory:__dirname +'/seeds', 
// // },

// module.exports = {
//   config,
// }
require('dotenv').config();

const config = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_LOCAL_DBNAME,
      user: process.env.DB_LOCAL_USER,
      password: process.env.DB_LOCAL_PASSWORD,
      charset: "utf8",
    }
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.AIVEN_DB_HOST,
      port: process.env.AIVEN_DB_PORT,
      database: process.env.AIVEN_DB_NAME,
      user: process.env.AIVEN_DB_USER,
      password: process.env.AIVEN_DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      }
    }
  },
  migrations:{
    directory: __dirname + '/migrations',
  },
  seeds:{
    directory:__dirname +'/seeds', 
  },
};

module.exports = config;

// const { Client } = require("pg");
// const client = new Client({
//   connectionString: "postgressql://postgres:6013@localhost:5432/personsDb"
// });
// client.connect();
const pg = require('pg');
const config = {
  user: 'postgres',
  host: 'localhost',
  database: 'personsDb',
  password: '6013',
  port: 5432
};
// const conString = 'postgressql://postgres:6013@localhost:5432/personsDb';
const client = new pg.Pool(config);

module.exports = client;
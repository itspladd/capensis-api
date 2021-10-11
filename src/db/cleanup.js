// load .env data into process.env
require('dotenv').config();

// other dependencies
const fs = require('fs');
const chalk = require('chalk');
const Client = require('pg-native');

// PG connection setup
const connectionString =
    process.env.DATABASE_URL ||
`postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=disable` ;
const client = new Client();

// Loads cleanup files from db/cleanup
const runCleanupFiles = function() {
  console.log(chalk.cyan( `-> Loading Cleanup Files ...` ));
  const cleanupFilenames = fs.readdirSync('./src/db/cleanup');

  for (const fn of cleanupFilenames) {
      const sql = fs.readFileSync( `./src/db/cleanup/${fn}` , 'utf8');
      console.log( `\t-> Running ${chalk.green(fn)}` );
      client.querySync(sql);
  }
};

try {
  console.log( `-> Connecting to PG using ${connectionString} ...` );
  client.connectSync(connectionString);
  runCleanupFiles();
  client.end();
} catch (err) {
  console.error(chalk.red( `Failed due to error: ${err}` ));
  client.end();
}
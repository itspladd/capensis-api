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

// If there's a log of any previous migrations, return them as an object:
// { id: migration_filename }
const getMigrationsIfExist = function() {
  const logExistenceQuery = `SELECT * FROM to_regclass('public.migration_log')`;

  // If the migration table exists, this will be a string; otherwise it will be null.
  const migrationLogExists = client.querySync(logExistenceQuery)[0].to_regclass;

  if (!migrationLogExists) {
    return null;
  }

  const previousLogsQuery = `
  SELECT id, migration_filename
  FROM migration_log
  `
  const migrations = {};
  client.querySync(previousLogsQuery)
        .forEach(log => migrations[log.id] = log.migration_filename);
  return migrations;
}

const logMigration = function(filename) {
  const logQuery = `INSERT INTO migration_log (migration_filename) VALUES ('${filename}');`
  client.querySync(logQuery)
}

// Loads the migration files from db/migrations
const runMigrationFiles = function() {
  console.log(chalk.cyan( `-> Loading Migration Files ...` ));
  const migrationFilenames = fs.readdirSync('./src/db/migrations');
  const previousMigrations = getMigrationsIfExist();

  for (const fn of migrationFilenames) {
    // If the ID of the current file matches a previous migration, skip it.
    const id = Number(fn.split("_")[0]);
    if (previousMigrations && previousMigrations[id]) {
      console.log( `\t-> Skipping ${chalk.yellow(fn)} (migration previously performed)` );
    } else {
      const sql = fs.readFileSync( `./src/db/migrations/${fn}` , 'utf8');
      console.log( `\t-> Running ${chalk.green(fn)}` );
      client.querySync(sql);
      logMigration(fn);
    }
  }
};

try {
    console.log( `-> Connecting to PG using ${connectionString} ...` );
    client.connectSync(connectionString);
    runMigrationFiles();
    client.end();
} catch (err) {
    console.error(chalk.red( `Failed due to error: ${err}` ));
    client.end();
}
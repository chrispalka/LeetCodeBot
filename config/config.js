require('dotenv').config();

module.exports = {
  "development": {
    "username": process.env.PGUSER,
    "password": null,
    "database": process.env.PGDATABASE,
    "host": process.env.PGHOST,
    "dialect": "postgres",
    "logging": false
  },
  "production": {
    "username": process.env.PGUSER,
    "password": process.env.PGPASSWORD,
    "database": process.env.PGDATABASE,
    "host": process.env.PGHOST,
    "dialect": "postgres",
    "use_env_variable": "DATABASE_URL",
    "logging": false,
    "dialectOptions": {
      "ssl": {
        "rejectUnauthorized": false
      }
    }
  }
};

# LeetCodeBot
### _A simple Discord Bot Powered by [Discord.js]_, [Node-Schedule], and [Node-Postgres]

### Features
###### Set difficulty, problem-type (array/string/hash-table, etc.) or randomize both all via slash commands
###### Optional Cron job to schedule and send coding problems at custom intervals



## Installation

_Discord.js requires [Node.js](https://nodejs.org/) V16.6+ to run._

Install dependencies

```sh
cd leetcodebot
npm i
```
Set ENV variables for Discord.js & Node-Postgres
```
DISCORD_TOKEN=
CLIENT_ID=
PGHOST=
PGUSER=
PGDATABASE=
PGPASSWORD=
PGPORT=
```
For production environments configure config/config.json respectively

```
module.exports = {
  "development": {
    "username": process.env.PGUSER,
    "password": null,
    "database": process.env.PG_DATABASE,
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
```

Start Application
```
npm run start
```

## License

MIT

[discord.js]: <https://www.npmjs.com/package/discord.js>
[node-schedule]: <https://www.npmjs.com/package/node-schedule>
[node-postgres]: <https://www.npmjs.com/package/pg>
   
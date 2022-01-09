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
For production environments configure config/config.js respectively

```sh
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

Run migration & start application
```
sequelize db:migrate
npm run start
/params - to set up recurring coding problem (channelId is set on initial /params configuration)
```

Commands
```
/ping - replies with 'Pong!'
/params - initialize recurring coding problem
/set-channel - updates channel for recurring coding problem (after update, /stop job and after 1 minute /start job to allow cron job to catch new settings)
/code - manually grab coding problem
/start - start recurring coding problem if stopped (start by default)
/stop - stop recurring coding problem
```

To add new commands, create a new command/command.js file as seen in the below template (ping.js)
```sh
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};
```
Then make sure to deploy-commands either manually below or via a script on push
```
node deploy-commands.js
```
_(This application is set to utilize global commands via Routes.applicationcommands) i.e. they are cached for at least 1 hour and may not propogate across all channels the bot is present in for that duration. It is recommended to utilize Routes.applicationGuildCommands during development as they will show up immediately. example below (from deploy-commands.js):_

##### Development
```sh
rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
```
##### Production
```sh
rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
```
## License

MIT

[discord.js]: <https://www.npmjs.com/package/discord.js>
[node-schedule]: <https://www.npmjs.com/package/node-schedule>
[node-postgres]: <https://www.npmjs.com/package/pg>
   
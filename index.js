const dotenv = require('dotenv');
const fs = require('fs');
const cron = require('cron');
const CronTime = require('cron').CronTime
const dailyProblem = require('./jobs/tasks.js')
const { getParams, updateParam } = require('./models/index.js');
const { Client, Collection, Intents } = require('discord.js');
const { mainModule } = require('process');


dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

const { DISCORD_TOKEN, CHANNEL_ID, GUILD_ID } = process.env;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});


client.once('ready', async () => {
  let interval = '*/5 * * *';
  const params = await getParams();
  if (params) {
    interval = params.dataValues.currentInterval;
  }
  const scheduledMessage = new cron.CronJob(interval, () => {
    const guild = client.guilds.cache.get(GUILD_ID);
    const channel = guild.channels.cache.get(CHANNEL_ID);
    (async () => {
      let difficulty = 'Easy';
      let problemType = 'string';
      const params = await getParams();
      if (params) {
        difficulty = params.dataValues.difficulty;
        problemType = params.dataValues.problemType;
        interval = params.dataValues.interval;
      }
      const problem = await dailyProblem(difficulty, problemType);
      channel.send(problem);
    })()
  });
  scheduledMessage.start();

  const checkInterval = new cron.CronJob('* * * * *', () => {
    (async () => {
      let id, previousInterval, currentInterval;
      const params = await getParams();
      if (params) {
        id = params.dataValues.id;
        currentInterval = params.dataValues.currentInterval;
        if (currentInterval !== params.dataValues.previousInterval) {
          previousInterval = params.dataValues.currentInterval;
          scheduledMessage.setTime(new CronTime(currentInterval))
          scheduledMessage.start();
          updateParam(id, currentInterval, previousInterval)
        }
      }
    })()
  });
  checkInterval.start();
})


client.login(DISCORD_TOKEN);


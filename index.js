const dotenv = require('dotenv');
const fs = require('fs');
const schedule = require('node-schedule');
const dailyProblem = require('./jobs/tasks.js')
const { getAllParams, updateParam } = require('./models/index.js');
const { Client, Collection, Intents } = require('discord.js');

dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

const { DISCORD_TOKEN } = process.env;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.once('ready', async () => {
  const params = await getAllParams();
  params.forEach(async (param) => {
    const { guildId, channelId, currentInterval, difficulty, problemType, run } = param;
    if (run) {
      schedule.scheduleJob(guildId, currentInterval, () => {
        const guild = client.guilds.cache.get(guildId);
        const channel = guild.channels.cache.get(channelId);
        (async () => {
          const problem = await dailyProblem(difficulty, problemType);
          channel.send(problem);
        })()
      })
    }
  });
  schedule.scheduleJob('* * * * *', () => {
    (async () => {
      let priorInterval;
      const params = await getAllParams();
      params.forEach(async (param) => {
        const { id, guildId, currentInterval, previousInterval, run } = param;
        if (run && currentInterval !== previousInterval) {
          priorInterval = currentInterval;
          schedule.scheduledJobs[guildId].reschedule(currentInterval)
          updateParam(id, currentInterval, priorInterval)
        }
      })
    })()
  });
});

client.login(DISCORD_TOKEN);


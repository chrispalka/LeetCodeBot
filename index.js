const dotenv = require('dotenv');
const fs = require('fs');
const schedule = require('node-schedule');
const dailyProblem = require('./jobs/tasks.js')
const { getAllParams, updateParam, updateChannel } = require('./models/index.js');
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
  schedule.scheduleJob('* * * * *', () => {
    (async () => {
      let priorInterval, newChannel;
      const params = await getAllParams();
      if (params.length > 0) {
        params.forEach(async (param) => {
          const { id, guildId, channelId, difficulty, problemType, currentInterval, previousInterval, run, channelUpdate } = param;
          if (run && !schedule.scheduledJobs[guildId]) {
            schedule.scheduleJob(guildId, currentInterval, () => {
              const guild = client.guilds.cache.get(guildId);
              const channel = guild.channels.cache.get(channelId);
              (async () => {
                const problem = await dailyProblem(difficulty, problemType);
                channel.send(problem);
              })()
            })
          } else if (run && currentInterval !== previousInterval) {
            priorInterval = currentInterval;
            schedule.scheduledJobs[guildId].reschedule(currentInterval);
            updateParam(id, currentInterval, priorInterval);
          } else if (!run && schedule.scheduledJobs[guildId]) {
            schedule.scheduledJobs[guildId].cancel();
          } else if (channelUpdate && schedule.scheduledJobs[guildId]) {
            newChannel = false;
            schedule.scheduledJobs[guildId].cancel();
            updateChannel(id, channelId, newChannel);
          }
        })
      }
    })()
  });
});

client.login(DISCORD_TOKEN);


const dotenv = require('dotenv');
const fs = require('fs');
const Sequelize = require('sequelize');
const cron = require('cron');
const dailyProblem = require('./jobs/tasks.js')
const { Client, Collection, Intents } = require('discord.js');


dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
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

client.once('ready', () => {
  let scheduledMessage = new cron.CronJob('0 10 * * *', () => {
    const guild = client.guilds.cache.get(GUILD_ID);
    const channel = guild.channels.cache.get(CHANNEL_ID);
    (async () => {
      const problem = await dailyProblem()
      channel.send(problem);
    })()
  });
  scheduledMessage.start()
})


client.login(DISCORD_TOKEN);


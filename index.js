import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, Intents } from 'discord.js';
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!'
  },
  {
    name: 'code',
    description: 'Grabs leetcode problem'
  }
];

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);

const myHeaders = new Headers();
myHeaders.append("'Content-Type'", "application/json");

const graphql = JSON.stringify({
  query: `query getTopicTag($slug: String!) {topicTag(slug: $slug){name translatedName questions{status title difficulty titleSlug acRate}} }`,
  variables: { "slug": 'array' }
})

const requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: graphql
};

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }

  if (interaction.commandName === 'code') {
    try {
      const response = await axios.post('https://leetcode.com/graphql', requestOptions)

      let questionsArray = response.data.topicTag.questions || [];
      let filteredquestions = questionsArray.filter(item => item.difficulty === 'Easy');
      let size = filteredquestions.length;
      let randomQuestion = Math.floor(Math.random() * size);
      const problemURL = `https://leetcode.com/problems/${filteredquestions[randomQuestion].titleSlug}`;
      await interaction.reply(problemURL);
    } catch (err) {
      console.log('Error: ', err)
    }
  }
});

client.login(DISCORD_TOKEN);
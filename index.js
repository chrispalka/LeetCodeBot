import dotenv from 'dotenv';
import axios from 'axios';
import questions from './questions.json' assert { type: 'json' };

dotenv.config();

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, Intents } from 'discord.js';
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

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


const graphql = JSON.stringify({
  query: `query getTopicTag($slug: String!) {topicTag(slug: $slug){name translatedName questions{status title difficulty titleSlug acRate}} }`,
  variables: { "slug": 'array' }
})

const requestOptions = {
  headers: { 'Content-Type': 'application/json' },
  body: graphql
};

const titleCaseHelper = (str) => {
  str.toLowerCase();
  return str.slice(0, 1).toUpperCase() + str.slice(1)
}

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

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }

  if (interaction.commandName === 'code') {
    let difficulty = '';
    let proceed = false;
    let filterType = 'question_one';
    const filter = response => {
      return questions[filterType].answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
    };

    interaction.reply(questions.question_one.question, { fetchReply: true })
      .then(() => {
        interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
          .then(collected => {
            if (collected.first().content === 'random') {
              difficulty = titleCaseHelper(questions.question_one.answers[Math.floor(Math.random() * questions.question_one.answers.length - 1)])
            } else {
              difficulty = titleCaseHelper(collected.first().content)
            }
            filterType = 'question_two'
            proceed = true;
          })
          .catch(collected => {
            interaction.followUp('Looks like nobody got the answer this time.');
          })
          .then(() => {
            if (proceed) {
              interaction.followUp(questions.question_two.question, { fetchReply: true })
                .then(() => {
                  interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                    .then((collected) => {
                      axios({
                        url: 'https://leetcode.com/graphql',
                        method: 'post',
                        data: {
                          query: `query getTopicTag($slug: String!) {topicTag(slug: $slug){name translatedName questions{status title difficulty titleSlug acRate}} }`,
                          variables: { "slug": collected.first().content }
                        }
                      })
                        .then((response) => {
                          const { data } = response.data;
                          const questionArray = data.topicTag.questions || [];
                          const filteredQuestions = questionArray.filter(question => question.difficulty === difficulty);
                          const randomQuestion = Math.floor(Math.random() * filteredQuestions.length);
                          interaction.followUp(`https://leetcode.com/problems/${filteredQuestions[randomQuestion].titleSlug}`);
                        })
                        .catch((err) => console.log(err));
                    })
                    .catch(collected => {
                      interaction.followUp('Looks like nobody got the answer this time.');
                    })
                })
            }
          })
      })
  }
});

client.login(DISCORD_TOKEN);
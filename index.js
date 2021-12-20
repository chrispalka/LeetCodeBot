import dotenv from 'dotenv';
import axios from 'axios';

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

const questions = {
  question_one: {
    question: "Easy, Medium, Hard, Random?",
    answers: ["easy", "medium", "hard", "random"]
  },
  question_two: {
    question: "Please Specify Problem Type (array, string, dynamic-programming, hash-table, binary-tree, tree, binary-search-tree, recursion, backtracking, graph, linked-list, trie)",
    answers: ["array", "string", "dynamic-programming", "hash-table", "binary-tree", "tree", "binary-search-tree", "recursion", "backtracking", "graph", "linked-list", "trie"]
  }
}

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
    const filterDifficulty = (response) => questions.question_one.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
    const filterType = (response) => questions.question_two.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());

    interaction.reply(questions.question_one.question, { fetchReply: true })
      .then(() => {
        interaction.channel.awaitMessages({ filterDifficulty, max: 1, time: 30000, errors: ['time'] })
          .then((collected) => {
            if (collected.first().content === 'random') {
              difficulty = titleCaseHelper(questions.question_one.answers[Math.floor(Math.random() * questions.question_one.answers.length - 1)])
            } else {
              difficulty = titleCaseHelper(collected.first().content)
            }
          })
          .then(() => {
            if (questions.question_one.answers.indexOf(difficulty) === -1) {
              interaction.followUp('Please type a correct answer')
            } else {
              interaction.followUp(questions.question_two.question, { fetchReply: true })
                .then(() => {
                  interaction.channel.awaitMessages({ filterType, max: 1, time: 30000, errors: ['time'] })
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
                          console.log(difficulty)
                          const filteredQuestions = questionArray.filter(question => question.difficulty === difficulty);
                          const randomQuestion = Math.floor(Math.random() * filteredQuestions.length);
                          interaction.followUp(`https://leetcode.com/problems/${filteredQuestions[randomQuestion].titleSlug}`);
                        })
                        .catch((err) => console.log(err));
                    })
                    .catch((err) => console.log(err))
                }
              })
      })
      .catch((collected) => {
        interaction.followUp('Looks like nobody got the answer this time.');
      });
  })
  .catch((collected) => {
    interaction.followUp('Looks like nobody got the answer this time.');
  });
  }
});

client.login(DISCORD_TOKEN);
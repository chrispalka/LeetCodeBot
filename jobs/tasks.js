const axios = require('axios');
const dotenv = require('dotenv');
const cron = require('cron');
const { Client, Intents } = require('discord.js');

dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const { DISCORD_TOKEN, CHANNEL_ID, GUILD_ID } = process.env;

const problemTypes = [
  "array",
  "string",
  "dynamic-programming",
  "hash-table",
  "binary-tree",
  "tree",
  "binary-search-tree",
  "recursion",
  "backtracking",
  "graph",
  "linked-list",
  "trie"
]

const dailyProblem = async () => {
  const randomProblem = problemTypes[Math.floor(Math.random() * problemTypes.length)];
  const difficulty = "Easy";
  try {
    const response = await axios({
      url: 'https://leetcode.com/graphql',
      method: 'post',
      data: {
        query: `query getTopicTag($slug: String!) {topicTag(slug: $slug){name translatedName questions{status title difficulty titleSlug acRate}} }`,
        variables: { "slug": randomProblem }
      }
    })
    const { data } = response.data;
    const questionArray = data.topicTag.questions || [];
    const filteredQuestions = questionArray.filter(question => question.difficulty === difficulty);
    const randomQuestion = Math.floor(Math.random() * filteredQuestions.length);
    return `https://leetcode.com/problems/${filteredQuestions[randomQuestion].titleSlug}`;
  } catch (err) {
    console.log(err)
  }
}
client.once('ready', () => {
  let scheduledMessage = new cron.CronJob('* * * * * *', () => {
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

module.exports = dailyProblem;
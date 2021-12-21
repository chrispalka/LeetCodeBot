const questions = require('../questions.json')
const axios = require('axios');
const titleCaseHelper = require('../helpers/titleCaseHelper.js');

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('code')
    .setDescription('Grabs leetcode problem'),
  async execute(interaction) {
    let difficulty = '';
    let proceed = false;
    let filterType = 'question_one';
    const filter = response => {
      return questions[filterType].answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
    };

    interaction.reply(questions.question_one.question, { fetchReply: true })
      .then(() => {
        interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
          .then((collected) => {
            if (collected.first().content === 'random') {
              difficulty = titleCaseHelper(questions.question_one.answers[Math.floor(Math.random() * questions.question_one.answers.length - 1)])
            } else {
              difficulty = titleCaseHelper(collected.first().content)
            }
            filterType = 'question_two'
            proceed = true;
          })
          .catch((collected) => {
            interaction.followUp('You took too long! Please try again.');
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
                    .catch((collected) => {
                      interaction.followUp('You took too long! Please try again.');
                    })
                })
            }
          })
      })
  },
};
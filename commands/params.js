const questions = require('../questions.json')
const titleCaseHelper = require('../helpers/titleCaseHelper.js');
const Sequelize = require('sequelize');
const { addParam, deleteParam, getParams } = require('../models/index.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('params')
    .setDescription('Sets bot parameters'),
  async execute(interaction) {
    let difficulty = '';
    let problemType = '';
    let interval = '';
    let question = 1;
    let filterType = 'question_one';
    const intervals = {
      minute: "* * * * *",
      fiveminute: '*/5 * * * *',
      hourly: '0 * * * *',
      daily: '0 10 * * *',
      weekly: '0 0 * * 1',
    }
    const filter = response => {
      return questions[filterType].answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
    };

    interaction.reply(questions.question_one.question, { fetchReply: true })
      .then(() => {
        interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
          .then((collected) => {
            difficulty = titleCaseHelper(collected.first().content)
            filterType = 'question_two'
            question = 2;
          })
          .catch((collected) => {
            interaction.followUp('You took too long! Please try again.');
          })
          .then(() => {
            if (question === 2) {
              interaction.followUp(questions.question_two.question, { fetchReply: true })
                .then(() => {
                  interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                    .then((collected) => {
                      problemType = collected.first().content
                      filterType = 'question_three'
                      question = 3
                    })
                    .catch((collected) => {
                      interaction.followUp('You took too long! Please try again');
                    })
                    .then(() => {
                      if (question === 3) {
                        interaction.followUp(questions.question_three.question, { fetchReply: true })
                          .then(() => {
                            interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                              .then((collected) => {
                                interval = collected.first().content.toLowerCase();
                                (async () => {
                                  let previousInterval = '';
                                  let id = 5
                                  const params = await getParams();
                                  if (params.length > 0) {
                                    id = params[0].dataValues.id;
                                    previousInterval = params[0].dataValues.currentInterval;
                                  }
                                  addParam(id, difficulty, problemType, intervals[interval], previousInterval)
                                    .then(() => {
                                      interaction.followUp('Configuration Updated')
                                    })
                                })()
                              })
                              .catch((err) => {
                                console.log(err)
                                interaction.followUp('You took too long! Please try again');
                              })
                          })
                      }
                    })
                })
            }
          })
      })
  },
};
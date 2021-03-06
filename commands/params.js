const questions = require('../questions.json')
const titleCaseHelper = require('../helpers/titleCaseHelper.js');
const { addParam, updateParam, getParams } = require('../models/index.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('params')
    .setDescription('Sets bot parameters'),
  async execute(interaction) {
    let guildId, channelId;
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
            guildId = collected.first().guildId;
            channelId = collected.first().channelId;
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
                                  const params = await getParams(guildId);
                                  if (params) {
                                    id = params.dataValues.id;
                                    previousInterval = params.dataValues.currentInterval;
                                    updateParam(id, intervals[interval], previousInterval)
                                      .then(() => {
                                        interaction.followUp('Configuration Updated! Please allow up to one minute for changes to reflect')
                                      })
                                  } else {
                                    addParam(difficulty, problemType, intervals[interval], previousInterval, guildId, channelId)
                                      .then(() => {
                                        interaction.followUp('Configuration Updated! Please allow up to one minute for changes to reflect')
                                      })
                                  }
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
const { SlashCommandBuilder } = require('@discordjs/builders');
const { updateRun, getParams } = require('../models/index.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop Automated Coding Challenge'),
  async execute(interaction) {
    let run;
    const dict = {
      yes: false,
      no: true,
    }
    const filter = response => ['Yes', 'No'].some(answer => answer.toLowerCase() === response.content.toLowerCase())
    interaction.reply('Stop automated coding challenge?', { fetchReply: true })
      .then(() => {
        interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
          .then((collected) => {
            run = dict[collected.first().content.toLowerCase()];
            (async () => {
              const params = await getParams(collected.first().guildId);
              if (params && !run) {
                id = params.dataValues.id;
                updateRun(id, run)
                  .then(() => {
                    interaction.followUp('Configuration Updated');
                  })
              } else if (run) {
                interaction.followUp('Query cancelled');
              } else {
                interaction.followUp('Params have not been set. Please type /params to get started!');
              }
            })()
          })
          .catch((err) => {
            console.log(err);
            interaction.followUp('You took too long! Please try again');
          })
      })
  },
};
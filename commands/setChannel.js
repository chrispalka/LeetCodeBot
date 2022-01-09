const { SlashCommandBuilder } = require('@discordjs/builders');
const { updateChannel, getParams } = require('../models/index.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-channel')
    .setDescription('Sets current channel for automated coding challenge'),
  async execute(interaction) {
    let channelId, channelUpdate;
    const dict = {
      yes: true,
      no: false,
    }
    const filter = response => ['Yes', 'No'].some(answer => answer.toLowerCase() === response.content.toLowerCase())
    interaction.reply('Set current channel for automated coding challenge?', { fetchReply: true })
      .then(() => {
        interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
          .then((collected) => {
            channelId = collected.first().channelId;
            response = dict[collected.first().content.toLowerCase()];
            (async () => {
              const params = await getParams(collected.first().guildId);
              if (params && response) {
                id = params.dataValues.id;
                channelUpdate = true;
                updateChannel(id, channelId, channelUpdate)
                  .then(() => {
                    interaction.followUp('Channel updated! Please wait 1 minute for changes to reflect');
                  })
              } else if (!response) {
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
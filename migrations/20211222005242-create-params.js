'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('params', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      difficulty: {
        type: Sequelize.STRING
      },
      problemType: {
        type: Sequelize.STRING
      },
      currentInterval: {
        type: Sequelize.STRING
      },
      previousInterval: {
        type: Sequelize.STRING
      },
      guildId: {
        type: Sequelize.STRING
      },
      channelId: {
        type: Sequelize.STRING
      },
      run: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      channelUpdate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('params');
  }
};
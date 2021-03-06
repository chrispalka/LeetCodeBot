'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = {
  db,
  updateParam: (id, currentInterval, previousInterval) => db.params.upsert({
    id, currentInterval, previousInterval
  },
    { where: { id } }
  ).then((response) => response)
    .catch((err) => console.log(err)),
  updateChannel: (id, channelId, channelUpdate) => db.params.upsert({
    id, channelId, channelUpdate
  },
    { where: { id } }
  ).then((response) => response)
    .catch((err) => console.log(err)),
  updateRun: (id, run) => db.params.upsert({
    id, run
  },
    { where: { id } }
  ).then((response) => response)
    .catch((err) => console.log(err)),
  addParam: (difficulty, problemType, currentInterval, previousInterval, guildId, channelId, job) => db.params.create({
    difficulty, problemType, currentInterval, previousInterval, guildId, channelId, job
  }).then((response) => response)
    .catch((err) => console.log(err)),
  deleteParam: () => db.params.destroy({
    where: {}
  }).then((response) => response)
    .catch((err) => console.log(err)),
  getParams: (guildId) => db.params.findOne({
    where: {
      guildId
    }
  })
    .then(response => response)
    .catch((err) => console.log(err)),
  getAllParams: () => db.params.findAll()
    .then((response) => response)
    .catch((err) => console.log(err)),
  getInterval: (interval) => db.params.findAll({
    attributes: [
      interval
    ]
  }).then((response) => response)
    .catch((err) => console.log(err))
}

'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class params extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  params.init({
    difficulty: DataTypes.STRING,
    problemType: DataTypes.STRING,
    currentInterval: DataTypes.STRING,
    previousInterval: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'params',
    timestamps: false
  });
  return params;
};
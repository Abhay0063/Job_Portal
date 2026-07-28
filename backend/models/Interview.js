const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  mode: {
    type: DataTypes.ENUM('online', 'in-person', 'phone'),
    allowNull: false,
    defaultValue: 'online',
  },
  meetingLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'passed', 'failed'),
    allowNull: false,
    defaultValue: 'scheduled',
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'interviews',
});

module.exports = Interview;

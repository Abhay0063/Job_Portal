const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Candidate = sequelize.define('Candidate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  resumeUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  skills: {
    type: DataTypes.STRING, // comma-separated for now; move to a join table later if you need filtering
    allowNull: true,
  },
  experienceYears: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  education: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'candidates',
});

module.exports = Candidate;

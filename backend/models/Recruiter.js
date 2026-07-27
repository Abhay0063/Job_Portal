const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recruiter = sequelize.define('Recruiter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  companyWebsite: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  companyDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  designation: {
    type: DataTypes.STRING, // e.g. "HR Manager"
    allowNull: true,
  },
}, {
  tableName: 'recruiters',
});

module.exports = Recruiter;

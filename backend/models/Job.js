const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  jobType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'internship', 'contract'),
    allowNull: false,
    defaultValue: 'full-time',
  },
  salaryMin: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  salaryMax: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('open', 'closed'),
    allowNull: false,
    defaultValue: 'open',
  },
  skillsRequired: {
    type: DataTypes.STRING, // comma-separated, same convention as Candidate.skills
    allowNull: true,
  },
  experienceRequired: {
    type: DataTypes.STRING, // free text, e.g. "2-4 years" — deliberately not an integer since real postings phrase this loosely
    allowNull: true,
  },
}, {
  tableName: 'jobs',
});

module.exports = Job;

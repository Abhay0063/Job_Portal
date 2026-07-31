const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavedJob = sequelize.define('SavedJob', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
}, {
  tableName: 'saved_jobs',
  indexes: [
    { unique: true, fields: ['candidateId', 'jobId'] }, // a candidate can only save a job once
  ],
});

module.exports = SavedJob;

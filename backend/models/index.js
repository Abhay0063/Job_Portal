const sequelize = require('../config/database');
const User = require('./User');
const Recruiter = require('./Recruiter');
const Candidate = require('./Candidate');
const Job = require('./Job');
const Application = require('./Application');
const Interview = require('./Interview');

// --- User <-> Recruiter (1:1) ---
User.hasOne(Recruiter, { foreignKey: 'userId', onDelete: 'CASCADE' });
Recruiter.belongsTo(User, { foreignKey: 'userId' });

// --- User <-> Candidate (1:1) ---
User.hasOne(Candidate, { foreignKey: 'userId', onDelete: 'CASCADE' });
Candidate.belongsTo(User, { foreignKey: 'userId' });

// --- Recruiter <-> Job (1:many) ---
Recruiter.hasMany(Job, { foreignKey: 'recruiterId', onDelete: 'CASCADE' });
Job.belongsTo(Recruiter, { foreignKey: 'recruiterId' });

// --- Job <-> Application (1:many) ---
Job.hasMany(Application, { foreignKey: 'jobId', onDelete: 'CASCADE' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

// --- Candidate <-> Application (1:many) ---
Candidate.hasMany(Application, { foreignKey: 'candidateId', onDelete: 'CASCADE' });
Application.belongsTo(Candidate, { foreignKey: 'candidateId' });

// --- Application <-> Interview (1:1) ---
Application.hasOne(Interview, { foreignKey: 'applicationId', onDelete: 'CASCADE' });
Interview.belongsTo(Application, { foreignKey: 'applicationId' });

module.exports = {
  sequelize,
  User,
  Recruiter,
  Candidate,
  Job,
  Application,
  Interview,
};

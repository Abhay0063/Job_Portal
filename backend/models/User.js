const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false, // will be hashed in session 2 (auth)
  },
  role: {
    type: DataTypes.ENUM('admin', 'recruiter', 'candidate'),
    allowNull: false,
    defaultValue: 'candidate',
  },
}, {
  tableName: 'users',
});

module.exports = User;

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Managed MySQL hosts (Aiven, PlanetScale, etc.) require SSL for external connections.
// Local dev doesn't use SSL, so this only activates when DB_SSL=true is explicitly set.
const dialectOptions = process.env.DB_SSL === 'true'
  ? { ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } }
  : {};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    dialectOptions,
    logging: false, // set to console.log if you want to see raw SQL
    define: {
      timestamps: true, // adds createdAt / updatedAt to every table
    },
  }
);

module.exports = sequelize;

require('dotenv/config');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.MARIADB_URI);

module.exports = sequelize;
const logger = require('../utils/logger');

module.exports = (err) => {
  switch (err.name) {
    case 'TypeError':
      logger.error(
        `Could not find any JWT Secret in .env ? Make sure to have the environment variable JWT_SECRET.`
      );
      process.exit(1);
    case 'SequelizeConnectionRefusedError':
      logger.error(
        `Could not connect to MariaDB... Make sure to have MARIADB_URI environment variable and it the service is up`
      );
      process.exit(1);
    case 'MongooseServerSelectionError':
      logger.error(
        `Could not connect to MongoDB... Make sure to have MONGO_URI environment variable and it the service is up`
      );
      process.exit(1);
    default:
      logger.error(err.message);
      process.exit(1);
  }
};

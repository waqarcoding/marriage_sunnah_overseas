'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const process = require('process');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;

// -------------------- CONNECTION --------------------
if (config.use_env_variable) {
  const dbUrl = process.env[config.use_env_variable];
  if (!dbUrl) throw new Error(`Environment variable ${config.use_env_variable} is not set`);

  sequelize = new Sequelize(dbUrl, {
    dialect: config.dialect,
    host: config.host,
    port: config.port,
    logging: false,
  });

} else {
  const database = config.database || '';
  const username = config.username || '';
  const password = config.password || '';

  if (!database || !username) {
    throw new Error('Database name or username is not defined in config');
  }

  sequelize = new Sequelize(database, username, password, {
    dialect: config.dialect,
    host: config.host,
    port: config.port,
    logging: false,
  });
}

// -------------------- LOAD MODELS --------------------
fs.readdirSync(__dirname)
  .filter(file =>
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// -------------------- ASSOCIATIONS --------------------
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// -------------------- SAFE SYNC FUNCTION --------------------
db.syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync({ alter: true });

    console.log('✅ Models synced successfully');
  } catch (error) {
    console.error('❌ Sync error:', error);
  }
};

module.exports = db;
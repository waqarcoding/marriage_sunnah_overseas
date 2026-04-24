import { Sequelize, DataTypes } from 'sequelize';
import { readdirSync } from 'fs';
import { join, basename as pathBasename } from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
// @ts-ignore
import configFile from '../config/config.js' assert { type: 'json' };

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = pathBasename(__filename);
const basename = pathBasename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = configFile[env];
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
    ...(config.dialectOptions && { dialectOptions: config.dialectOptions }),
  });
} else {
  const database = config.database || '';
  const username = config.username || '';
  const password = config.password || '';
  if (!database || !username) throw new Error('Database name or username is not defined in config');
  sequelize = new Sequelize(database, username, password, {
    dialect: config.dialect,
    host: config.host,
    port: config.port,
    logging: false,
    ...(config.dialectOptions && { dialectOptions: config.dialectOptions }),
  });
}

// -------------------- LOAD MODELS --------------------
// Models must each export a default function: (sequelize, DataTypes) => Model
// @ts-ignore
const modelFiles = readdirSync(new URL('.', import.meta.url).pathname)
  .filter(file =>
    !file.startsWith('.') &&
    file !== 'index.js' &&
    file.endsWith('.js') &&
    !file.includes('.test.js')
  );

for (const file of modelFiles) {
  const filePath = join(__dirname, file);
  // Use dynamic import with path, but outside of top-level await context
  // so wrap inside an async IIFE to allow for async/await usage if necessary
  // Here, to keep the logic synchronous, use require instead  
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const modelDef = require(filePath).default;
  const model = modelDef(sequelize, DataTypes);
  db[model.name] = model;
}

// -------------------- ASSOCIATIONS --------------------
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// -------------------- AUTHENTICATE --------------------
db.authenticateDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// -------------------- SYNC (dev only) --------------------
db.syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced successfully');
  } catch (error) {
    console.error('❌ Sync error:', error);
  }
};

export default db;
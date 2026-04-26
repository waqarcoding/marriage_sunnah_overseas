import { Sequelize, DataTypes } from 'sequelize';
import { readdirSync } from 'fs';
import { join, dirname, basename as pathBasename } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import process from 'process';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const basename = pathBasename(__filename);

// @ts-ignore
const require = createRequire(import.meta.url);
const configFile = require('../config/config.js');
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
const modelFiles = readdirSync(__dirname)
  .filter(file =>
    !file.startsWith('.') &&
    file !== 'index.js' &&
    file.endsWith('.js') &&
    !file.includes('.test.js')
  );

for (const file of modelFiles) {
  // @ts-ignore
  const imported = await import(pathToFileURL(join(__dirname, file)).href);
  const modelDef = imported.default ?? imported;
  if (typeof modelDef !== 'function') { console.warn(`Skipping ${file}`); continue; }
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
  // Sync each model individually so one failure doesn't block others
  // Users table has too many keys to alter — skip it safely
  const SKIP_TABLES = ['Users']; // tables with known alter issues

  // @ts-ignore
  const models = Object.values(db).filter(m => m?.prototype instanceof sequelize.Sequelize.Model || (m && m.tableName));

  let synced = 0;
  let skipped = 0;

  for (const modelName of Object.keys(db)) {
    const model = db[modelName];
    if (!model || typeof model.sync !== 'function') continue;
    if (SKIP_TABLES.includes(model.tableName || modelName)) {
      console.log(`⏭️  Skipping sync for ${modelName} (known key limit issue)`);
      skipped++;
      continue;
    }
    try {
      await model.sync({ alter: true });
      console.log(`✅ Synced: ${modelName}`);
      synced++;
    } catch (err) {
      console.warn(`⚠️  Sync skipped for ${modelName}: ${err}`);
      skipped++;
    }
  }

  console.log(`✅ DB sync complete — ${synced} synced, ${skipped} skipped`);
};

export default db;
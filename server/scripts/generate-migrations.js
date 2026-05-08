const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// DB config
const config = require('../config/config.js').development;

const sequelize = new Sequelize(
  config.database || '',
  config.username || '',
  config.password || '',
  {
    host: config.host,
    dialect: 'mysql',
    logging: false
  }
);

const modelsPath = path.join(__dirname, '../models');
const migrationsPath = path.join(__dirname, '../migrations');

if (!fs.existsSync(migrationsPath)) {
  fs.mkdirSync(migrationsPath);
}

const files = fs.readdirSync(modelsPath)
  .filter(file => file.endsWith('.js') && file !== 'index.js');

let generatedCount = 0;
let skippedCount = 0;

files.forEach(file => {
  const defineModel = require(path.join(modelsPath, file));

  let model;

  try {
    // @ts-ignore
    model = defineModel(sequelize, Sequelize.DataTypes);
  } catch (err) {
    console.log(`❌ Skipped ${file} (model init failed)`);
    skippedCount++;
    return;
  }

  if (!model || !model.rawAttributes) {
    console.log(`❌ Skipped ${file} (no attributes found)`);
    skippedCount++;
    return;
  }

  const tableName = model.tableName || model.name;
  const attributes = model.rawAttributes;

  let fields = [];

  Object.keys(attributes).forEach((key) => {
    const attr = attributes[key];

    // skip timestamps (handled by DB style)
    if (key === 'id' || key === 'created_at' || key === 'updated_at') return;

    let type;
    let skipField = false;

    // ================= ENUM FIX =================
    if (attr.type?.key === 'ENUM') {
      const values = attr.type?.values;

      if (!values || !Array.isArray(values) || values.length === 0) {
        console.log(`
❌ ENUM ERROR in ${file}
Field: ${key}
👉 Add values like:
   DataTypes.ENUM('value1', 'value2')
                `);
        skipField = true;
      } else {
        type = `Sequelize.ENUM(${values.map(v => `'${v}'`).join(', ')})`;
      }
    } else {
      type = `Sequelize.${attr.type?.key || 'STRING'}`;
    }

    if (skipField) return;

    fields.push(`      ${key}: {
        type: ${type},
        allowNull: ${attr.allowNull === false ? 'false' : 'true'}
      }`);
  });

  const migration = `
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('${tableName}', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

${fields.length ? fields.join(',\n') + ',' : ''}

      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('${tableName}');
  }
};
`;

  const fileName = `${Date.now()}-create-${tableName}.js`;

  fs.writeFileSync(
    path.join(migrationsPath, fileName),
    migration
  );

  console.log(`✅ Generated: ${tableName}`);
  generatedCount++;
});

console.log('\n==============================');
console.log(`✅ Generated: ${generatedCount}`);
console.log(`❌ Skipped: ${skippedCount}`);
console.log('==============================');
console.log('🎉 Migration generation completed');
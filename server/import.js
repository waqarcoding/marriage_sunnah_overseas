require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('./models');

async function importDatabase() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'backupdata.sql'), 'utf8');

        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        let success = 0;
        let skipped = 0;

        for (const statement of statements) {
            try {
                await sequelize.query(statement);
                success++;
            } catch (err) {
                // Skip duplicate table/data errors, log everything else
                if (
                    err.parent?.code === 'ER_TABLE_EXISTS_ERROR' ||
                    err.parent?.code === 'ER_DUP_ENTRY'
                ) {
                    skipped++;
                } else {
                    console.warn('⚠️  Skipped statement:', err.parent?.sqlMessage);
                    skipped++;
                }
            }
        }

        console.log(`✅ Done — ${success} executed, ${skipped} skipped`);
    } catch (err) {
        console.error('❌ Import failed:', err.message);
    } finally {
        await sequelize.close();
    }
}

importDatabase();
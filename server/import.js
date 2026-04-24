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
                // Fix: Defensive error handling for unknown type and optional chaining for 'parent'
                const parent = err && typeof err === 'object' && 'parent' in err ? err.parent : undefined;
                const code = parent && typeof parent === 'object' && 'code' in parent ? parent.code : undefined;

                if (code === 'ER_TABLE_EXISTS_ERROR' || code === 'ER_DUP_ENTRY') {
                    skipped++;
                } else {
                    const sqlMessage =
                        parent && typeof parent === 'object' && 'sqlMessage' in parent
                            ? parent.sqlMessage
                            : err && typeof err === 'object' && 'message' in err
                                ? err.message
                                : String(err);
                    console.warn('⚠️  Skipped statement:', sqlMessage);
                    skipped++;
                }

            }
        }

        console.log(`✅ Done — ${success} executed, ${skipped} skipped`);
    } catch (err) {
        console.error('❌ Import failed:', err);
    } finally {
        await sequelize.close();
    }
}

importDatabase();
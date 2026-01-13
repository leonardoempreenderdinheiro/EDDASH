
const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function runSchema() {
    try {
        console.log('Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema on database...');
        await pool.query(schema);

        console.log('✅ Schema applied successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error applying schema:', err.message);
        process.exit(1);
    }
}

runSchema();


const { pool } = require('./db');

async function listDatabases() {
    try {
        console.log('Listing all databases...');

        const res = await pool.query(`
      SELECT datname 
      FROM pg_database 
      WHERE datistemplate = false 
      ORDER BY datname;
    `);

        console.log('\n--- AVAILABLE DATABASES ---');
        console.table(res.rows);

        process.exit(0);
    } catch (err) {
        console.error('Error listing databases:', err);
        process.exit(1);
    }
}

listDatabases();

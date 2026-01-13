
const { pool } = require('./db');

async function inspectSchema() {
    try {
        console.log('Connecting to inspect schema...');

        // List all tables in public schema
        const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

        console.log('\n--- FOUND TABLES ---');
        if (tablesRes.rows.length === 0) {
            console.log('No tables found in public schema.');
        } else {
            console.table(tablesRes.rows);

            // For each table, get columns
            for (const row of tablesRes.rows) {
                const tableName = row.table_name;
                console.log(`\nRequirements for table: ${tableName}`);
                const columnsRes = await pool.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = $1
                ORDER BY ordinal_position;
            `, [tableName]);
                console.table(columnsRes.rows);

                // Get first 3 rows as sample data
                try {
                    const sampleRes = await pool.query(`SELECT * FROM "${tableName}" LIMIT 3`);
                    console.log(`Sample data for ${tableName}:`);
                    console.log(sampleRes.rows);
                } catch (err) {
                    console.log(`Could not read sample data from ${tableName}: ${err.message}`);
                }
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Inspection error:', err);
        process.exit(1);
    }
}

inspectSchema();

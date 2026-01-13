
const { pool } = require('./db');

async function forceInspectSchemas() {
    try {
        console.log('Force inspecting ALL tables in ALL schemas...');

        // Get ALL tables from ALL schemas
        const allTables = await pool.query(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('information_schema', 'pg_catalog')
        ORDER BY table_schema, table_name;
    `);

        if (allTables.rows.length === 0) {
            console.log('CRITICAL: No tables found in any user schema.');
        } else {
            console.table(allTables.rows);

            // Pick the first few tables to show columns
            const limitToCheck = Math.min(allTables.rows.length, 5);
            for (let i = 0; i < limitToCheck; i++) {
                const { table_schema, table_name } = allTables.rows[i];
                console.log(`\nRequirements for ${table_schema}.${table_name}:`);

                const columnsRes = await pool.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_schema = $1 AND table_name = $2
                ORDER BY ordinal_position;
            `, [table_schema, table_name]);
                console.table(columnsRes.rows);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Inspection error:', err);
        process.exit(1);
    }
}

forceInspectSchemas();

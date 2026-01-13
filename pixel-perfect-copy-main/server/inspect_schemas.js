
const { pool } = require('./db');

async function inspectSchemasAndTables() {
    try {
        console.log('Connecting to inspect ALL schemas...');

        // 1. List all available schemas
        const schemasRes = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog')
      ORDER BY schema_name;
    `);

        const schemas = schemasRes.rows.map(r => r.schema_name);
        console.log('\n--- FOUND SCHEMAS ---');
        console.log(schemas);

        if (schemas.length === 0) {
            console.log('No user schemas found.');
        } else {
            // 2. Iterate schemas to find tables
            for (const schema of schemas) {
                console.log(`\nChecking schema: ${schema}`);
                const tablesRes = await pool.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = $1 
                ORDER BY table_name;
            `, [schema]);

                if (tablesRes.rows.length === 0) {
                    console.log(`  No tables in ${schema}.`);
                } else {
                    console.table(tablesRes.rows);

                    // 3. Inspect columns for found tables
                    for (const row of tablesRes.rows) {
                        const tableName = row.table_name;
                        console.log(`\n  >> Table: ${schema}.${tableName}`);

                        const columnsRes = await pool.query(`
                        SELECT column_name, data_type, is_nullable
                        FROM information_schema.columns 
                        WHERE table_schema = $1 AND table_name = $2
                        ORDER BY ordinal_position;
                    `, [schema, tableName]);
                        console.table(columnsRes.rows);

                        // 4. Sample data
                        try {
                            const sampleRes = await pool.query(`SELECT * FROM "${schema}"."${tableName}" LIMIT 3`);
                            console.log(`  Sample data for ${schema}.${tableName}:`);
                            console.log(sampleRes.rows);
                        } catch (err) {
                            console.log(`  Could not read sample data: ${err.message}`);
                        }
                    }
                }
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Inspection error:', err);
        process.exit(1);
    }
}

inspectSchemasAndTables();

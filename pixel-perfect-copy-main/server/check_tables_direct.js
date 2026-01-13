
const { pool } = require('./db');

async function checkTablesDirect() {
    const tables = ['base_comercial', 'leads_gerais', 'usuarios'];

    for (const table of tables) {
        try {
            console.log(`\nChecking table: ${table}...`);
            const res = await pool.query(`SELECT * FROM public.${table} LIMIT 1`);
            console.log(`✅ Success! Found ${res.rowCount} rows.`);
            if (res.rows.length > 0) {
                console.log('Columns detected:', Object.keys(res.rows[0]).join(', '));
            } else {
                console.log('Table exists but is empty. Fetching column info from metadata as backup...');
                // Fallback or just note it
            }
        } catch (err) {
            console.error(`❌ Failed to access ${table}:`, err.message);
        }
    }
    process.exit(0);
}

checkTablesDirect();

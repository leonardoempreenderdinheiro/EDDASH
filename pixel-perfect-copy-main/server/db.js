
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: false // Disable SSL for now as per test script
});

const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL Database');
        client.release();
        return true;
    } catch (err) {
        console.error('❌ Database Connection Failed:', err.message);
        return false;
    }
};

module.exports = { pool, testConnection };

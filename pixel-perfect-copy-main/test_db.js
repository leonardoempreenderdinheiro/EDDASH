import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Attempt to connect with default credentials if DATABASE_URL is not set
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:admin@localhost:5432/ed_dashboard';

const client = new pg.Client({
    connectionString,
});

console.log(`Trying to connect to: ${connectionString.split('@')[1] || 'localhost'}...`);

async function testConnection() {
    try {
        await client.connect();
        console.log('✅ Connected successfully to PostgreSQL!');

        const res = await client.query('SELECT NOW()');
        console.log('Database Time:', res.rows[0].now);

        await client.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        if (err.message.includes('password authentication failed')) {
            console.log('💡 Hint: Check your password. Default attempted: admin');
        }
        if (err.message.includes('database "ed_dashboard" does not exist')) {
            console.log('💡 Hint: Create the database "ed_dashboard" in pgAdmin first.');
        }
    }
}

testConnection();

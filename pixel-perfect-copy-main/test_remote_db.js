
import pg from 'pg';
const { Client } = pg;

const client = new Client({
    host: '178.156.188.1',
    port: 43210,
    user: 'read_lfigueiroa',
    password: '9lP6KhaRC6',
    database: 'postgres', // Default database
    ssl: false
});

async function testConnection() {
    try {
        console.log('Connecting...');
        await client.connect();
        console.log('Connected successfully!');

        const res = await client.query('SELECT NOW() as time');
        console.log('Server time:', res.rows[0].time);

        // Check current user
        const userRes = await client.query('SELECT current_user');
        console.log('Current user:', userRes.rows[0].current_user);

        // Check permissions (can we create a table?)
        console.log('Testing write permissions...');
        try {
            await client.query('CREATE TEMPORARY TABLE test_perm (id serial primary key)');
            console.log('Write permission CONFIRMED (Temporary table created).');
        } catch (err) {
            console.log('Write permission CHECK FAILED:', err.message);
        }

        await client.end();
    } catch (err) {
        console.error('Connection error:', err);
    }
}

testConnection();

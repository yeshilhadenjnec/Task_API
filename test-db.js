
// Load environment variables
require('dotenv').config();

// Connect to database
const pool = require('./src/db');

// Check environment settings
function checkEnv() {
    console.log('1. Checking .env file');

    const required = [
        'DB_HOST',
        'DB_PORT',
        'DB_NAME',
        'DB_USER',
        'DB_PASS'
    ];

    for (let key of required) {
        if (!process.env[key]) {
            throw new Error(key + ' is missing in .env file');
        }
    }

    console.log('Environment settings are correct.');
}

// Test database connection
async function checkConnection() {
    console.log('\n2. Testing MySQL connection');

    const [rows] = await pool.query('SELECT NOW() AS time');

    console.log('Database connected successfully.');
    console.log('Server time:', rows[0].time);

    return true;
}

// Check tasks table
async function checkTable() {
    console.log('\n3. Checking tasks table');

    const [rows] = await pool.query(
        "SHOW TABLES LIKE 'tasks'"
    );

    if (rows.length === 0) {
        throw new Error('Tasks table does not exist.');
    }

    console.log('Tasks table found successfully.');
}

// Test INSERT, SELECT and DELETE
async function checkOperations() {
    console.log('\n4. Testing database operations');

    const title = 'Test Task';

    // Insert task
    const [result] = await pool.query(
        'INSERT INTO tasks (title, completed) VALUES (?, ?)',
        [title, 0]
    );

    const id = result.insertId;

    console.log('Task inserted successfully.');

    try {
        // Select task
        const [rows] = await pool.query(
            'SELECT * FROM tasks WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            throw new Error('Task not found.');
        }

        console.log('Task selected successfully.');

        // Delete task
        await pool.query(
            'DELETE FROM tasks WHERE id = ?',
            [id]
        );

        console.log('Test task deleted successfully.');

    } finally {
        // Remove test task if an error occurs
        await pool.query(
            'DELETE FROM tasks WHERE id = ?',
            [id]
        );
    }
}

// Run all tests
async function main() {
    try {
        checkEnv();

        await checkConnection();

        await checkTable();

        await checkOperations();

        console.log('\nAll database tests passed!');
        console.log('You can now start your server using npm start.');

    } catch (error) {
        console.log('\nDatabase test failed.');
        console.log('Error:', error.message);

    } finally {
        // Close database connection
        await pool.end();
    }
}

// Start testing
main();

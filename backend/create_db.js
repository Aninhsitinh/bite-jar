const { Client } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
// Parse connection string to get the base connection (without the db name)
const baseConnection = dbUrl.substring(0, dbUrl.lastIndexOf('/')) + '/postgres';

const client = new Client({
  connectionString: baseConnection,
});

async function createDatabase() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL.');
    
    // Check if bitejar exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'bitejar'");
    
    if (res.rowCount === 0) {
      console.log('Database "bitejar" does not exist. Creating...');
      await client.query('CREATE DATABASE bitejar');
      console.log('Database "bitejar" created successfully.');
    } else {
      console.log('Database "bitejar" already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }
}

createDatabase();

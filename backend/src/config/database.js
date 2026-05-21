const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password123',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'chatbot_planner',
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.warn('⚠️  PostgreSQL is not running. Install PostgreSQL or use Docker to run the database.');
  } else {
    console.error('❌ Unexpected error on database client', err);
  }
});

// Initialize database schema on startup
const initializeDatabase = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split and execute each statement
    const statements = schemaSql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('✅ Database schema initialized successfully');
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.warn('⚠️  PostgreSQL is not running. The app will continue but database features will not work.');
      console.warn('   📖 See SETUP.md for database installation instructions.');
    } else {
      console.error('❌ Error initializing database:', err.message);
    }
  }
};

// Run initialization on module load with a slight delay
setTimeout(() => {
  initializeDatabase().catch((err) => {
    if (err.code !== 'ECONNREFUSED') {
      console.error('Database initialization error:', err);
    }
  });
}, 1000);

module.exports = pool;


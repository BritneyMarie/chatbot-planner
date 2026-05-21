require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password123',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'chatbot_planner',
});

const users = [
  { username: 'User One', email: 'user1@calender.com', password: 'Userone1@calender' },
  { username: 'User Two', email: 'user2@calender.com', password: 'Usertwo2@calender' },
  { username: 'User Three', email: 'user3@calender.com', password: 'Userthree3@calender' },
];

const createEvents = (userId) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return [
    {
      title: 'Team Standup',
      description: 'Daily team sync',
      start_time: new Date(today.getTime() + 9 * 3600000),
      end_time: new Date(today.getTime() + 10 * 3600000),
      color: '#667eea',
    },
    {
      title: 'Lunch Break',
      description: 'Time to eat',
      start_time: new Date(today.getTime() + 36 * 3600000),
      end_time: new Date(today.getTime() + 37 * 3600000),
      color: '#667eea',
    },
    {
      title: 'Project Review',
      description: 'Review progress',
      start_time: new Date(today.getTime() + 62 * 3600000),
      end_time: new Date(today.getTime() + 63 * 3600000),
      color: '#667eea',
    },
    {
      title: 'Team Meeting',
      description: 'Weekly sync',
      start_time: new Date(today.getTime() + 82 * 3600000),
      end_time: new Date(today.getTime() + 83 * 3600000),
      color: '#667eea',
    },
  ];
};

async function seed() {
  try {
    console.log('Seeding database...');

    for (const userData of users) {
      const hash = await bcrypt.hash(userData.password, 10);

      const userResult = await pool.query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET password_hash = $3
         RETURNING id`,
        [userData.username, userData.email, hash]
      );

      const userId = userResult.rows[0].id;

      await pool.query(
        `INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );

      const events = createEvents(userId);
      for (const event of events) {
        await pool.query(
          `INSERT INTO events (user_id, title, description, start_time, end_time, color)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, event.title, event.description, event.start_time, event.end_time, event.color]
        );
      }

      console.log(`  Created user: ${userData.email}`);
    }

    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await pool.end();
  }
}

seed();

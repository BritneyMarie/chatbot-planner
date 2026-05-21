/**
 * Seed script to populate test users and sample data
 * Run with: npm run seed
 */

const pool = require('./src/config/database');
const bcrypt = require('bcrypt');

const testUsers = [
  {
    email: 'user1@calender.com',
    password: 'Userone1@calender',
    username: 'User One'
  },
  {
    email: 'user2@calender.com',
    password: 'Usertwo2@calender',
    username: 'User Two'
  },
  {
    email: 'user3@calender.com',
    password: 'Userthree3@calender',
    username: 'User Three'
  }
];

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Clear existing seed data (optional - uncomment to reset)
    // await client.query('DELETE FROM users WHERE email LIKE \'user%@calender.com\'');
    
    for (const user of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [user.email]
        );
        
        if (existingUser.rows.length > 0) {
          console.log(`⏭️  User ${user.email} already exists, skipping...`);
          continue;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Insert user
        const userResult = await client.query(
          'INSERT INTO users (username, email, password_hash, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
          [user.username, user.email, hashedPassword]
        );
        
        const userId = userResult.rows[0].id;
        console.log(`✅ Created user: ${user.email} (ID: ${userId})`);
        
        // Insert user preferences
        await client.query(
          `INSERT INTO user_preferences (user_id, theme_primary_color, theme_secondary_color, notifications_enabled, language, created_at, updated_at)
           VALUES ($1, '#667eea', '#764ba2', true, 'en', NOW(), NOW())`,
          [userId]
        );
        console.log(`✅ Created preferences for user ${userId}`);
        
        // Insert sample events
        const eventDates = [
          { title: 'Team Standup', desc: 'Daily team sync', offset: 0, time: '09:00' },
          { title: 'Lunch Break', desc: 'Time to eat', offset: 1, time: '12:00' },
          { title: 'Project Review', desc: 'Review progress', offset: 2, time: '14:00' },
          { title: 'Team Meeting', desc: 'Weekly sync', offset: 3, time: '10:00' }
        ];
        
        for (const event of eventDates) {
          const eventDate = new Date();
          eventDate.setDate(eventDate.getDate() + event.offset);
          
          const startTime = new Date(eventDate);
          const [hours, minutes] = event.time.split(':');
          startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setHours(endTime.getHours() + 1);
          
          await client.query(
            `INSERT INTO events (user_id, title, description, start_time, end_time, color, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [userId, event.title, event.desc, startTime, endTime, '#667eea']
          );
        }
        console.log(`✅ Created 4 sample events for user ${userId}`);
        
      } catch (error) {
        console.error(`❌ Error creating user ${user.email}:`, error.message);
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📋 Test Users:');
    testUsers.forEach(user => {
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Username: ${user.username}\n`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

seedDatabase();

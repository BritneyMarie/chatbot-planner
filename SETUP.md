# Database Setup Guide

This guide explains how to set up PostgreSQL for the Chatbot-Assisted Weekly Planner application.

## Option 1: Using Docker (Recommended)

### Prerequisites
- Install Docker Desktop from https://www.docker.com/products/docker-desktop

### Steps

1. **Start PostgreSQL container:**
   ```bash
   docker run -d \
     --name chatbot-planner-db \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=password123 \
     -e POSTGRES_DB=chatbot_planner \
     -p 5432:5432 \
     postgres:15-alpine
   ```

2. **Verify the container is running:**
   ```bash
   docker ps | grep chatbot-planner-db
   ```

3. **View logs:**
   ```bash
   docker logs chatbot-planner-db
   ```

4. **To stop the container:**
   ```bash
   docker stop chatbot-planner-db
   ```

5. **To start it again:**
   ```bash
   docker start chatbot-planner-db
   ```

---

## Option 2: Using Docker Compose (Easiest)

### Prerequisites
- Install Docker Desktop (includes Docker Compose)

### Steps

1. **Navigate to project root:**
   ```bash
   cd chatbot-planner
   ```

2. **Start the database:**
   ```bash
   docker-compose up -d postgres
   ```

3. **View logs:**
   ```bash
   docker-compose logs postgres
   ```

4. **To stop the database:**
   ```bash
   docker-compose down
   ```

---

## Option 3: Local PostgreSQL Installation

### Windows
1. Download PostgreSQL 15 from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Add PostgreSQL bin directory to PATH (typically `C:\Program Files\PostgreSQL\15\bin`)
5. Create the database:
   ```bash
   psql -U postgres
   ```
   Then run:
   ```sql
   CREATE DATABASE chatbot_planner;
   ```

### macOS
1. Install via Homebrew:
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. Create the database:
   ```bash
   createdb chatbot_planner
   ```

### Linux (Ubuntu/Debian)
1. Install PostgreSQL:
   ```bash
   sudo apt-get update
   sudo apt-get install postgresql postgresql-contrib
   ```

2. Start the service:
   ```bash
   sudo systemctl start postgresql
   ```

3. Create the database:
   ```bash
   sudo -u postgres createdb chatbot_planner
   ```

---

## Verifying the Setup

After starting PostgreSQL, verify the connection works:

```bash
# Using psql CLI
psql -U postgres -h localhost -d chatbot_planner

# Or using Node.js
node -e "const pool = require('./backend/src/config/database'); console.log('✅ Database connected!');"
```

If you see the prompt `chatbot_planner=#`, the database is ready!

---

## Updating Credentials

If you used different credentials for PostgreSQL, update your `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatbot_planner
DB_USER=your_username
DB_PASSWORD=your_password
```

Then restart the backend:
```bash
cd backend
npm run dev
```

---

## Database Schema

The database schema is automatically created when the backend starts. It includes:

- `users` - User accounts and authentication
- `user_preferences` - Theme customization settings
- `events` - Calendar events
- `chatbot_conversations` - Chat history

See [backend/src/config/schema.sql](backend/src/config/schema.sql) for the full schema.

---

## Troubleshooting

### Connection refused (ECONNREFUSED)
- PostgreSQL is not running
- Check if the service is started: `pg_isready`
- Or use Docker as described above

### Authentication failed
- Wrong password in `.env`
- User doesn't exist
- Check credentials with: `psql -U postgres -h localhost`

### Database already exists
- If you get "database already exists" error, just restart the backend - it will create tables if needed

### Port 5432 already in use
- Another PostgreSQL instance is running
- Use a different port in `.env`: `DB_PORT=5433`
- Or stop the existing instance

---

## Next Steps

Once PostgreSQL is set up and running:

1. Restart the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. You should see:
   ```
   ✅ Connected to PostgreSQL database
   ✅ Database schema initialized successfully
   ```

3. The API endpoints are now ready to use!

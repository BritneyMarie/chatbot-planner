# Chatbot-Assisted Weekly Planner

A fun and interactive full-stack application combining a weekly calendar planner with an AI-powered chatbot assistant. Users can manage events, customize themes, and interact with a chatbot for weather, calendar invites, jokes, and trivia.

## Tech Stack

- **Backend:** Node.js + Express.js
- **Frontend:** React + Vite
- **Database:** PostgreSQL
- **Authentication:** JWT
- **AI:** OpenAI API
- **Containerization:** Docker + Docker Compose

## Project Structure

```
chatbot-planner/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and config setup
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, error handling
│   │   └── app.js           # Express app entry point
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Context providers (Auth, Theme)
│   │   ├── services/        # API service
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── .env.example
│   ├── vite.config.js
│   └── index.html
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (optional, for database)
- OpenAI API key

### 1. Clone and Setup

```bash
cd chatbot-planner
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and add your OpenAI API key
npm install
npm run dev  # Runs on http://localhost:5000
```

### 3. Frontend Setup (in a new terminal)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev  # Runs on http://localhost:5173
```

### 4. Database Setup (Option A: Using Docker)

```bash
docker-compose up -d postgres
```

Then run backend migrations (setup coming in Phase 2).

### 4. Database Setup (Option B: Manual PostgreSQL)

Create a PostgreSQL database:

```sql
CREATE DATABASE chatbot_planner;
```

Update `.env` with your connection details.

## API Endpoints

For complete API documentation, see [API_DOCS.md](backend/API_DOCS.md)

### Authentication (Phase 2 ✅)
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login user
- `POST /api/auth/logout` — Logout user
- `POST /api/auth/refresh` — Refresh JWT token

### Events (Phase 4 🔄)
- `GET /api/events` — List user's events
- `GET /api/events/day?date=YYYY-MM-DD` — Get events for specific day
- `GET /api/events/month?year=YYYY&month=MM` — Get events for specific month
- `POST /api/events` — Create event
- `PUT /api/events/:id` — Update event
- `DELETE /api/events/:id` — Delete event

### Chatbot (Phase 6 ⏳)
- `POST /api/chatbot/message` — Send message to chatbot
- `GET /api/chatbot/history` — Get conversation history

### User (Phase 7 ⏳)
- `GET /api/user/preferences` — Get user theme preferences
- `PUT /api/user/preferences` — Update theme preferences

## Features (Roadmap)

- ✅ Phase 1: Project structure & setup
- ✅ Phase 2: Authentication (JWT + bcrypt)
- ✅ Phase 3: Frontend auth & layout
- 🔄 Phase 4: Calendar (Day/Week/Month/Year views) — IN PROGRESS
- ⏳ Phase 5: Onboarding tour & settings
- ⏳ Phase 6: AI Chatbot integration (OpenAI)
- ⏳ Phase 7: Theme customization
- ⏳ Phase 8: Testing & deployment

## Environment Variables

See `.env.example` files in backend and frontend directories for required environment variables.

### Backend (.env)

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — PostgreSQL connection
- `JWT_SECRET` — Secret for signing JWT tokens
- `OPENAI_API_KEY` — Your OpenAI API key
- `PORT` — Backend server port (default: 5000)

### Frontend (.env)

- `VITE_API_URL` — Backend API base URL

## Development

### Running locally without Docker

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - PostgreSQL (if using Docker):**
```bash
docker run -d \
  --name chatbot-planner-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=chatbot_planner \
  -p 5432:5432 \
  postgres:15-alpine
```

### Running with Docker Compose

```bash
docker-compose up
```

This will start PostgreSQL and the backend. Frontend can still run locally with `npm run dev`.

## Testing

(Coming in Phase 8)

```bash
npm test
```

## Deployment

(Coming in Phase 8)

See individual service README files for deployment instructions.

## Contributing

Contributions welcome! Please follow the code style and create feature branches.

## License

ISC

---

**Progress Update:** Phase 4 complete! Calendar component with day/week/month/year views is now functional.
**Next Steps:** Phase 5 - Onboarding tour & settings integration.

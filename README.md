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

### Events (Phase 4 ✅)
- `GET /api/events` — List user's events
- `GET /api/events/day?date=YYYY-MM-DD` — Get events for specific day
- `GET /api/events/month?year=YYYY&month=MM` — Get events for specific month
- `POST /api/events` — Create event
- `PUT /api/events/:id` — Update event
- `DELETE /api/events/:id` — Delete event

### Advanced Calendar (Phase 7C 🔄)
- `POST /api/events/recurring` — Create recurring event (daily, weekly, biweekly, monthly, yearly)
- `GET /api/events/recurring?startDate=ISO&endDate=ISO` — Get recurring events with expanded instances
- `GET /api/events/search?q=query` — Search events by title
- `GET /api/events/filter?color=hex&search=term&startDate=ISO&endDate=ISO&recurring=bool` — Filter events
- `GET /api/events/by-color?color=hex` — Get events by color

### Chatbot (Phase 6 ✅)
- `POST /api/chatbot/message` — Send message to chatbot
- `GET /api/chatbot/history` — Get conversation history
- `DELETE /api/chatbot/history` — Clear conversation history

### Chatbot Enhancements (Phase 7A ✅)
- `POST /api/chatbot/create-event` — Create event from chat message
- `GET /api/chatbot/suggestions` — Get smart suggestions

### Notifications (Phase 7B 🔄)
- `GET /api/notifications/unread` — Get unread notifications
- `GET /api/notifications` — Get all notifications (paginated)
- `GET /api/notifications/count/unread` — Get unread count
- `PUT /api/notifications/:notificationId/read` — Mark notification as read
- `PUT /api/notifications/read/all` — Mark all as read
- `DELETE /api/notifications/:notificationId` — Delete notification
- `DELETE /api/notifications/all` — Delete all notifications

### Event Templates (Phase 7C 🔄)
- `GET /api/templates` — Get all templates (user + default)
- `GET /api/templates/user` — Get user templates only
- `GET /api/templates/defaults` — Get default templates
- `POST /api/templates` — Create new template
- `GET /api/templates/:id` — Get single template
- `PUT /api/templates/:id` — Update template
- `DELETE /api/templates/:id` — Delete template

### User (Phase 5 ✅)
- `GET /api/user/preferences` — Get user preferences (theme, language, notifications)
- `PUT /api/user/preferences` — Update user preferences
- `POST /api/user/onboarding/complete` — Mark onboarding as completed

## Features (Roadmap)

- ✅ Phase 1: Project structure & setup
- ✅ Phase 2: Authentication (JWT + bcrypt)
- ✅ Phase 3: Frontend auth & layout
- ✅ Phase 4: Calendar (Day/Week/Month/Year views) — COMPLETE
- ✅ Phase 5: Onboarding tour & settings — COMPLETE
- ✅ Phase 6: AI Chatbot integration (OpenAI) — COMPLETE
- ✅ Phase 7A: Enhanced Chatbot (event creation, smart suggestions) — COMPLETE
- ✅ Phase 7B: Notifications (in-app alerts, reminders) — COMPLETE
- 🔄 Phase 7C: Advanced calendar features (recurring events, templates, filtering) — IN PROGRESS
- ⏳ Phase 7D: UI/UX Polish (animations, responsive improvements)
- ⏳ Phase 7E: Performance Optimization (caching, lazy loading)

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

**Progress Update:** Phase 7B notifications system is now live with in-app alerts, toast notifications, and notification history!
**Next Steps:** Phase 7C - Advanced calendar features (recurring events, event templates, filtering)
